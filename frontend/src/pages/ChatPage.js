import { useState, useEffect, useRef, useCallback } from 'react';
import { usePricing } from '../contexts/PricingContext';
import logger from '../lib/logger';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ScrollArea } from '../components/ui/scroll-area';
import { PaywallModal } from '../components/shared/PaywallModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useCredits } from '../contexts/CreditContext';
import api from '../lib/api';
import { ChatMessage } from '../components/chat/ChatMessage';
import { ChatRolesHeader } from '../components/chat/ChatRolesHeader';
import { ChatEmpty } from '../components/chat/ChatEmpty';
import { ChatUpsellModal } from '../components/chat/ChatUpsellModal';
import { ChatInputBar } from '../components/chat/ChatInputBar';
import { ChatInlineUpsell } from '../components/chat/ChatInlineUpsell';
import { VoiceModeOverlay } from '../components/chat/VoiceModeOverlay';

const buildFullMessage = ({ text, messages, userContext, attachedPdf }) => {
  let fullMsg = text;
  if (messages.length === 0 && (userContext.role || userContext.company || userContext.industry)) {
    const ctx = [];
    if (userContext.role) ctx.push(`Meine Rolle: ${userContext.role}`);
    if (userContext.company) ctx.push(`Unternehmen: ${userContext.company}`);
    if (userContext.industry) ctx.push(`Branche: ${userContext.industry}`);
    fullMsg = `[Kontext: ${ctx.join(', ')}]\n\n${text}`;
  }
  if (attachedPdf) {
    if (attachedPdf.type === 'image') {
      fullMsg = `[Bild angehängt: ${attachedPdf.filename}]\n\n${fullMsg}`;
    } else if (attachedPdf.full_text) {
      const typeLabel = {
        pdf: `PDF · ${attachedPdf.pages_read}/${attachedPdf.pages} Seiten`,
        docx: 'Word-Dokument',
        txt: 'Textdatei',
        md: 'Markdown',
        csv: 'CSV-Tabelle',
      }[attachedPdf.type] || attachedPdf.type?.toUpperCase();
      fullMsg = `[Dokument: ${attachedPdf.filename} · ${typeLabel}]\n---\n${attachedPdf.full_text}\n---\n\n${fullMsg}`;
    }
  }
  return fullMsg;
};

export default function ChatPage() {
  const { open: openPricing } = usePricing();
  const [searchParams] = useSearchParams();
  const { lang } = useLanguage();
  const de = lang === 'de';
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [userContext, setUserContext] = useState({ role: '', company: '', industry: '' });
  const [showPaywall, setShowPaywall] = useState(false);
  const [attachedPdf, setAttachedPdf] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [audioMode, setAudioMode] = useState(false);
  const { isPremium, totalUsed, reload: reloadCredits } = useCredits();
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  // searchParams used for ?prefill=... (deep-link from /missions Deep-Chat-CTA)
  // and ?session=... (legacy deep-link). See effect below.

  const loadSessions = useCallback(async () => {
    try {
      const res = await api.get('/chat/sessions');
      if (res.data.length > 0 && !currentSession) setCurrentSession(res.data[0].session_id);
    } catch (err) { logger.error('Failed to load sessions:', err); }
  }, [currentSession]);

  const loadHistory = useCallback(async (sid) => {
    try { const res = await api.get(`/chat/history/${sid}`); setMessages(res.data); }
    catch (err) { logger.error('Failed to load history:', err); }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);
  useEffect(() => { if (currentSession) loadHistory(currentSession); }, [currentSession, loadHistory]);
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Iter 92.23.2 (Mert: "wenn man den Chat dann erweitern will sollte
  // direkt das Wissen aufgegriffen werden und im Chat die Unterhaltung
  // weitergehen") — handles ?prefill=... deep links from Mission Deep-Chat-CTA
  // and other contextual entry-points. Auto-creates a fresh session AND
  // auto-sends the prefilled message so the user lands on a streaming reply,
  // not an empty input field.
  const prefillHandledRef = useRef(false);
  useEffect(() => {
    if (prefillHandledRef.current) return;
    const prefill = searchParams.get('prefill');
    if (!prefill) return;
    prefillHandledRef.current = true;
    // Strip the query-param from the URL so a manual refresh doesn't re-fire it.
    const cleanPath = window.location.pathname;
    window.history.replaceState(null, '', cleanPath);
    // Auto-send: bypass the input field entirely so the user sees Wlad's reply
    // immediately, with the deep-feedback question already incorporated.
    setTimeout(() => {
      handleSendRef.current?.(prefill);
    }, 250);
  }, [searchParams]);

  const handleSendRef = useRef(null);

  const handleNewSession = async () => {
    try {
      const res = await api.post('/chat/sessions', { title: de ? 'Neues Gespräch' : 'New Conversation' });
      setCurrentSession(res.data.session_id);
      setMessages([]);
      loadSessions();
    } catch (err) { logger.error('Failed to create session:', err); }
  };

  const handleSend = async (overrideMsg) => {
    const text = (overrideMsg || input).trim();
    if (!text || loading) return;
    setInput('');
    const fullMsg = buildFullMessage({ text, messages, userContext, attachedPdf });
    setMessages(prev => [...prev, {
      role: 'user', content: text,
      pdf: attachedPdf ? { filename: attachedPdf.filename, pages: attachedPdf.pages } : null,
    }]);
    setAttachedPdf(null);
    setLoading(true);
    try {
      const res = await api.post('/chat', { message: fullMsg, session_id: currentSession });
      if (!currentSession) { setCurrentSession(res.data.session_id); loadSessions(); }
      setMessages(prev => [...prev, { role: 'assistant', content: JSON.stringify(res.data.response), parsed: res.data.response }]);
      reloadCredits();
    } catch (err) {
      if (err.response?.status === 402) {
        setShowPaywall(true);
        setMessages(prev => prev.slice(0, -1));
      } else {
        logger.error('Chat error:', err);
        setMessages(prev => [...prev, { role: 'assistant', content: de ? 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' : 'An error occurred. Please try again.' }]);
      }
    }
    finally { setLoading(false); }
  };
  // Keep ref synced so the prefill effect (above) can call handleSend without
  // referencing it in dependency arrays (would cause infinite loops).
  handleSendRef.current = handleSend;

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (file.size > 15 * 1024 * 1024) {
      alert(de ? 'Datei zu groß (max 15 MB)' : 'File too large (max 15 MB)');
      return;
    }
    setUploadingPdf(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/chat/upload-document', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAttachedPdf(res.data);
    } catch (err) {
      logger.error('Upload failed:', err);
      alert(err.response?.data?.detail || (de ? 'Upload fehlgeschlagen' : 'Upload failed'));
    } finally { setUploadingPdf(false); }
  };

  const handleVoice = (text) => setInput(prev => prev + ' ' + text);

  return (
    <DashboardLayout>
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} creditsUsed={totalUsed} />}
      <div className="flex flex-col h-screen" data-testid="chat-page">
        {showUpsell && <ChatUpsellModal onClose={() => setShowUpsell(false)} de={de} />}

        <ChatRolesHeader
          showContext={showContext} setShowContext={setShowContext}
          userContext={userContext} setUserContext={setUserContext}
          onNewSession={handleNewSession}
          lang={lang}
          de={de}
        />

        <ScrollArea className="flex-1 px-6 py-4 bg-gradient-mesh">
          {messages.length === 0 && (
            <ChatEmpty setInput={setInput} lang={lang} de={de} />
          )}
          {messages.map((msg, i) => (
            <div key={`msg-${msg.role}-${i}`}>
              <ChatMessage msg={msg} de={de} />
              {msg.role === 'assistant' && !isPremium && (i + 1) % 10 === 0 && (
                <ChatInlineUpsell onNavigate={() => openPricing('leadership_os')} de={de} />
              )}
            </div>
          ))}
          {loading && (
            <div className="flex mb-4">
              <div className="bg-white dark:bg-card border border-black/[0.06] dark:border-white/[0.06] rounded-2xl px-4 py-3 flex gap-1 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-sky-50 dark:bg-sky-500/100 typing-dot" />
                <div className="w-2 h-2 rounded-full bg-sky-50 dark:bg-sky-500/100 typing-dot" />
                <div className="w-2 h-2 rounded-full bg-sky-50 dark:bg-sky-500/100 typing-dot" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </ScrollArea>

        <ChatInputBar
          input={input} setInput={setInput} loading={loading}
          onSend={() => handleSend()} onVoice={handleVoice}
          attachedPdf={attachedPdf} setAttachedPdf={setAttachedPdf}
          uploadingPdf={uploadingPdf} onPdfUpload={handlePdfUpload}
          isPremium={isPremium} onOpenUpsell={() => openPricing('leadership_os')}
          onOpenAudioMode={() => setAudioMode(true)}
          de={de}
        />
      </div>
      {audioMode && (
        <VoiceModeOverlay
          sessionId={currentSession}
          onSessionUpdate={(sid) => { setCurrentSession(sid); loadSessions(); }}
          onClose={() => {
            setAudioMode(false);
            if (currentSession) loadHistory(currentSession);
            reloadCredits();
          }}
          de={de}
        />
      )}
    </DashboardLayout>
  );
}
