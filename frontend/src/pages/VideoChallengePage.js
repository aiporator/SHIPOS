import { useState, useEffect, useRef, useCallback } from 'react';
import logger from '../lib/logger';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { useTier } from '../contexts/TierContext';
import { AnalysisResults } from '../components/video/AnalysisResults';
import { LoadingOverlay } from '../components/shared/LoadingOverlay';
import { TierLockOverlay } from '../components/shared/TierLockOverlay';
import { ChallengeList } from '../components/video/ChallengeList';
import { RecordingStudio } from '../components/video/RecordingStudio';
import { VideoUpsellModal } from '../components/video/VideoUpsellModal';
import api from '../lib/api';
import { downloadHTMLReport } from '../lib/reportGenerator';

const DEFAULT_RATING = { mode: 'hard', level: 'fortgeschritten', focus: [], audience: 'allgemein' };

export default function VideoChallengePage() {
  const { lang } = useLanguage();
  const tierCtx = useTier();
  const isAccelerator = tierCtx.hasFeature('video_analysis');
  const [challenges, setChallenges] = useState([]);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [timer, setTimer] = useState(0);
  const [stream, setStream] = useState(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const [ratingConfig, setRatingConfig] = useState(DEFAULT_RATING);
  const [trial, setTrial] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const blobRef = useRef(null);
  const submitVideoRef = useRef(null);  // Iter 92.22: ref so MediaRecorder.onstop can auto-submit

  // Trial-aware access: Accelerator always passes, others get 3 free in first 14 days.
  const canAccess = isAccelerator || Boolean(trial?.active);

  const saveGlobalPrefs = useCallback(async (newConfig) => {
    setRatingConfig(newConfig);
    try { await api.put('/auth/profile', { rating_preferences: newConfig }); }
    catch (err) { logger.error('Failed to save rating preferences:', err); }
  }, []);

  const loadChallenges = useCallback(async () => {
    try {
      const [challengeRes, prefsRes, trialRes] = await Promise.all([
        api.get('/video-challenges'),
        api.get('/rating-preferences').catch(() => ({ data: {} })),
        api.get('/user/video-trial-status').catch(() => ({ data: null })),
      ]);
      setChallenges(challengeRes.data);
      setTrial(trialRes.data);
      const prefs = prefsRes.data;
      if (prefs && (prefs.mode || prefs.level)) {
        setRatingConfig(prev => ({
          ...prev,
          mode: prefs.mode || prev.mode,
          level: prefs.level || prev.level,
          focus: prefs.focus || prev.focus,
          audience: prefs.audience || prev.audience,
        }));
      }
    } catch (err) { logger.error('Failed to load challenges:', err); }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    setRecording(false);
    clearInterval(timerRef.current);
  }, []);

  const startRecording = useCallback(() => {
    if (!stream) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current = mr;
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      blobRef.current = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecorded(true);
      // Iter 92.22 (Mert): Auto-Submit nach Stop. User soll nicht erst auf
      // "Submit" klicken — die Analyse läuft direkt los, sobald die Aufnahme
      // beendet ist (manuell gestoppt ODER Zeitlimit erreicht).
      setTimeout(() => { submitVideoRef.current?.(); }, 250);
    };
    mr.start();
    setRecording(true);
    setTimer(0);
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
  }, [stream]);

  useEffect(() => { loadChallenges(); }, [loadChallenges]);
  useEffect(() => { return () => { if (stream) stream.getTracks().forEach(t => t.stop()); }; }, [stream]);
  useEffect(() => {
    if (recording && timer >= (activeChallenge?.time_limit || 180)) stopRecording();
  }, [timer, recording, activeChallenge, stopRecording]);

  const startChallenge = async (challenge) => {
    setActiveChallenge(challenge);
    setAnalysis(null); setRecorded(false); setTimer(0);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(s);
      if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.muted = true; }
    } catch (err) {
      logger.error('Camera access denied:', err);
      // Surface the failure so the user doesn't sit through a countdown that goes nowhere.
      const msg = lang === 'de'
        ? 'Kamera-Zugriff verweigert. Bitte in deinen Browser-Einstellungen erlauben und neu laden.'
        : 'Camera access denied. Please allow it in browser settings and reload.';
      try { (await import('sonner')).toast.error(msg); }
      catch (toastErr) { logger.warn('toast unavailable:', toastErr?.message); }
    }
  };

  const submitVideo = async () => {
    if (!blobRef.current || !activeChallenge) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', blobRef.current, 'challenge.webm');
      const params = new URLSearchParams();
      params.set('rating_mode', ratingConfig.mode);
      params.set('rating_level', ratingConfig.level);
      if (ratingConfig.focus?.length) params.set('rating_focus', ratingConfig.focus.join(','));
      params.set('rating_audience', ratingConfig.audience);

      // Async job pattern — bypasses Cloudflare 30s edge timeout. The backend
      // returns immediately with a job_id; we poll until status === 'complete'.
      // Falls back to synchronous /analyze if the async endpoint isn't deployed
      // yet (defensive: covers Vercel-rollout window).
      let analysisResult = null;
      try {
        const startRes = await api.post(
          `/video-challenges/${activeChallenge.challenge_id}/analyze-async?${params.toString()}`,
          formData, { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        const jobId = startRes.data?.job_id;
        if (!jobId) throw new Error('no_job_id');
        // Poll for up to 5 minutes (every 2.5s = 120 attempts). Realistic max for
        // a 60-min audio with parallel chunked Whisper + GPT-5.2 is ~90s.
        const POLL_INTERVAL_MS = 2500;
        const MAX_POLLS = 120;
        let consecutivePollErrors = 0;
        for (let i = 0; i < MAX_POLLS; i += 1) {
          await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
          let job;
          try {
            const pollRes = await api.get(`/video-challenges/jobs/${jobId}`);
            job = pollRes.data;
            consecutivePollErrors = 0;
          } catch (pollErr) {
            // Whisper sync-IO can briefly stall the backend event loop —
            // tolerate up to 5 in a row before giving up.
            consecutivePollErrors += 1;
            logger.warn(`poll attempt ${i+1} failed (${consecutivePollErrors}/5):`, pollErr?.message);
            if (consecutivePollErrors >= 5) throw pollErr;
            continue;
          }
          if (!job || !job.status) continue;  // empty body = transient — keep polling
          if (job.status === 'complete') {
            analysisResult = job.analysis;
            break;
          }
          if (job.status === 'error') {
            const err = new Error(job.error_detail || 'Analyse fehlgeschlagen');
            err.response = { data: { detail: job.error_detail || 'Analyse fehlgeschlagen' }, status: job.error_code || 500 };
            throw err;
          }
        }
        if (!analysisResult) throw new Error('Zeitüberschreitung — bitte Aufnahme erneut hochladen');
      } catch (asyncErr) {
        // 404 → /analyze-async not deployed yet → fall through to sync endpoint
        if (asyncErr?.response?.status === 404) {
          logger.warn('async endpoint missing, falling back to sync /analyze');
          const res = await api.post(
            `/video-challenges/${activeChallenge.challenge_id}/analyze?${params.toString()}`,
            formData, { headers: { 'Content-Type': 'multipart/form-data' } }
          );
          analysisResult = res.data;
        } else {
          throw asyncErr;
        }
      }

      setAnalysis(analysisResult);
      if (analysisResult?._trial) setTrial(analysisResult._trial);
      if (stream) stream.getTracks().forEach(t => t.stop());
      setStream(null);
    } catch (err) {
      logger.error('Analysis failed:', err);
      const detail = err?.response?.data?.detail || err?.message || (lang === 'de'
        ? 'Analyse konnte nicht abgeschlossen werden. Bitte erneut aufnehmen.'
        : 'Analysis could not be completed. Please record again.');
      try {
        const { toast } = await import('sonner');
        toast.error(detail, { duration: 6000 });
      } catch (toastErr) { logger.warn('toast unavailable:', toastErr?.message); }
    }
    finally { setAnalyzing(false); }
  };
  // Keep submitVideoRef in sync so auto-submit on MediaRecorder.onstop works.
  submitVideoRef.current = submitVideo;

  const resetChallenge = () => {
    setActiveChallenge(null); setAnalysis(null); setRecorded(false);
    setRecording(false); setTimer(0);
    if (stream) { stream.getTracks().forEach(t => t.stop()); setStream(null); }
  };

  const handleDownloadReport = () => {
    if (!analysis || !activeChallenge) return;
    downloadHTMLReport({
      title: `Mission: ${activeChallenge.title}`,
      subtitle: activeChallenge.description,
      analysis, challenge: activeChallenge,
      scores: [
        { label: 'Gesamt',       value: analysis.overall_score || 0,    color: '#F59E0B' },
        { label: 'Klarheit',     value: analysis.clarity_score || 0,    color: '#2563EB' },
        { label: 'Souveränität', value: analysis.confidence_score || 0, color: '#7C3AED' },
        { label: 'Empathie',     value: analysis.empathy_score || 0,    color: '#EC4899' },
        { label: 'Struktur',     value: analysis.structure_score || 0,  color: '#10B981' },
      ],
      sections: [
        ...(analysis.wlad_assessment ? [{ title: 'Wlads persönliches Feedback', content: analysis.wlad_assessment, type: 'info' }] : []),
        ...(analysis.transcript ? [{ title: 'Dein Transkript', content: `"${analysis.transcript}"` }] : []),
        ...(analysis.strengths?.length ? [{ title: 'Deine Stärken', content: analysis.strengths, type: 'success' }] : []),
        ...(analysis.improvements?.length ? [{ title: 'Verbesserungspotenzial', content: analysis.improvements, type: 'warning' }] : []),
      ],
    });
  };

  return (
    <DashboardLayout>
      {!canAccess && !tierCtx.loading && <TierLockOverlay feature="video_analysis" requiredTier="accelerator" de={lang === 'de'} />}
      <LoadingOverlay isOpen={analyzing} flow="video" de={lang === 'de'} />
      <div className="p-6 lg:p-10 max-w-4xl mx-auto bg-gradient-mesh min-h-screen" data-testid="video-challenge-page">
        {showUpsell && <VideoUpsellModal onClose={() => setShowUpsell(false)} lang={lang} />}

        {/* Trial banner — visible for Free/Standard users with active trial */}
        {!isAccelerator && trial?.eligible && (
          <div className={`mb-5 rounded-2xl border px-4 py-3 flex items-center gap-3 ${trial.active ? 'bg-[#BFFF00]/10 border-[#BFFF00]/30' : 'bg-rose-500/5 border-rose-500/20'}`} data-testid="video-trial-banner">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${trial.active ? 'bg-[#BFFF00] text-[#0A0A0A]' : 'bg-rose-500/15 text-rose-500'}`}>
              <span className="text-[13px] font-black">{trial.remaining}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold leading-tight" data-testid="video-trial-headline">
                {trial.active
                  ? (lang === 'de'
                      ? `Du hast ${trial.remaining} von ${trial.total} kostenlosen Video-Analysen übrig`
                      : `${trial.remaining} of ${trial.total} free video analyses remaining`)
                  : (lang === 'de'
                      ? 'Dein gratis Video-Analyse-Kontingent ist aufgebraucht'
                      : 'Your free video analysis quota is used up')
                }
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {trial.active
                  ? (lang === 'de'
                      ? `Probier-Phase läuft noch ${trial.days_left} Tage — danach exklusiv im Leadership OS PLUS.`
                      : `Trial ends in ${trial.days_left} days — then PLUS exclusive.`)
                  : (lang === 'de'
                      ? 'Upgrade auf Leadership OS PLUS für unbegrenzte Analysen.'
                      : 'Upgrade to Leadership OS PLUS for unlimited analyses.')
                }
              </p>
            </div>
          </div>
        )}

        {!activeChallenge && !analysis && (
          <ChallengeList
            challenges={challenges}
            ratingConfig={ratingConfig}
            onSaveRatingConfig={saveGlobalPrefs}
            onStartChallenge={startChallenge}
            lang={lang}
          />
        )}

        {activeChallenge && !analysis && (
          <RecordingStudio
            activeChallenge={activeChallenge}
            recording={recording} recorded={recorded} analyzing={analyzing}
            timer={timer} videoRef={videoRef}
            ratingConfig={ratingConfig} onSaveRatingConfig={saveGlobalPrefs}
            onCancel={resetChallenge}
            onStartRecording={startRecording} onStopRecording={stopRecording}
            onReset={() => { setRecorded(false); setTimer(0); }}
            onSubmit={submitVideo}
            lang={lang}
          />
        )}

        {analysis && (
          <AnalysisResults
            analysis={analysis}
            activeChallenge={activeChallenge}
            resetChallenge={resetChallenge}
            handleDownloadReport={handleDownloadReport}
            setShowUpsell={setShowUpsell}
            lang={lang}
            isAccelerator={isAccelerator}
            onReplay={(challenge) => {
              // Iter 92.23: "Mission wiederholen" — clear analysis state and
              // restart camera with the same challenge so the user can record
              // a second attempt immediately. Previous attempts remain in
              // /missions/archive for side-by-side comparison.
              setAnalysis(null);
              setRecorded(false);
              setRecording(false);
              setTimer(0);
              blobRef.current = null;
              if (challenge) startChallenge(challenge);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
