import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Loader2, Building2, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';
import logger from '../../lib/logger';

/**
 * EnterpriseQuoteModal · B2B lead-form with live volume-discount calculator.
 *
 * Live-Quote: user enters seats → we POST /api/payments/enterprise/quote → show price.
 * Submit: POST /api/payments/enterprise/lead → backend stores lead + emails admin.
 */

const fmtEur = (n) => `${(n || 0).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}€`;

export const EnterpriseQuoteModal = ({ open, onClose, de = true }) => {
  const [seats, setSeats] = useState(20);
  const [quote, setQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ company: '', contact_name: '', contact_email: '', phone: '', message: '' });

  // Live quote update
  useEffect(() => {
    if (!open || seats < 1) return;
    let cancelled = false;
    setLoadingQuote(true);
    api.post('/payments/enterprise/quote', { seats })
      .then((res) => { if (!cancelled) setQuote(res.data); })
      .catch((err) => logger.error('quote err', err))
      .finally(() => { if (!cancelled) setLoadingQuote(false); });
    return () => { cancelled = true; };
  }, [seats, open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSubmitted(false);
      setSubmitting(false);
      setForm({ company: '', contact_name: '', contact_email: '', phone: '', message: '' });
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company || !form.contact_name || !form.contact_email) return;
    setSubmitting(true);
    try {
      await api.post('/payments/enterprise/lead', { ...form, seats });
      setSubmitted(true);
    } catch (err) {
      logger.error('lead err', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="enterprise-quote-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-black">
            <Building2 size={22} className="text-[#BFFF00]" />
            {de ? 'Leadership OS Enterprise' : 'Leadership OS Enterprise'}
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-3" data-testid="enterprise-quote-success">
            <CheckCircle2 size={48} className="mx-auto text-[#6B8A00] dark:text-[#BFFF00]" />
            <h3 className="text-xl font-black">{de ? 'Anfrage erhalten!' : 'Request received!'}</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {de
                ? 'Mert meldet sich innerhalb von 24h mit einem maßgeschneiderten Angebot bei dir.'
                : 'Mert will get back to you with a tailored offer within 24h.'}
            </p>
            <Button onClick={onClose} className="bg-[#BFFF00] text-[#0A0A0A] hover:bg-[#9ACC00]">
              {de ? 'Schließen' : 'Close'}
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Live-Quote-Calculator */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0A0A0A] to-[#1A1A2E] text-white">
              <p className="text-[10px] font-black tracking-widest text-[#BFFF00] mb-3">
                {de ? 'LIVE-PREISRECHNER' : 'LIVE PRICE CALCULATOR'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <Label className="text-white/70 text-xs mb-1.5 block">
                    {de ? 'Anzahl Mitarbeiter' : 'Number of employees'}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={10000}
                    value={seats}
                    onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value || '1', 10)))}
                    className="bg-white/[0.08] border-white/20 text-white text-2xl font-black h-14"
                    data-testid="enterprise-seats-input"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-white/50">
                    {de ? 'Gesamtpreis · 1 Jahr' : 'Total · 1 year'}
                  </p>
                  {loadingQuote ? (
                    <Loader2 size={24} className="animate-spin text-[#BFFF00]" />
                  ) : quote ? (
                    <>
                      <p className="text-3xl font-black text-[#BFFF00]" data-testid="enterprise-quote-total">
                        {fmtEur(quote.total_price)}
                      </p>
                      <p className="text-[11px] text-white/60">
                        {fmtEur(quote.price_per_seat)} / Seat · {quote.discount_pct}% Rabatt · {de ? 'spart' : 'saves'} {fmtEur(quote.total_savings)}
                      </p>
                    </>
                  ) : null}
                </div>
              </div>
              <p className="text-[10px] text-white/50 mt-3">
                {de
                  ? 'Volume-Discount: 10% ab 5 MA · 15% ab 10 · 20% ab 20 · 30% ab 50 · 40% ab 100 · 50% ab 200'
                  : 'Volume discount: 10% from 5 · 15% from 10 · 20% from 20 · 30% from 50 · 40% from 100 · 50% from 200'}
              </p>
            </div>

            {/* Lead-Form */}
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="enterprise-lead-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="company" className="text-xs">{de ? 'Firma *' : 'Company *'}</Label>
                  <Input id="company" required value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    data-testid="enterprise-form-company"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_name" className="text-xs">{de ? 'Ansprechpartner *' : 'Contact *'}</Label>
                  <Input id="contact_name" required value={form.contact_name}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                    data-testid="enterprise-form-name"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email" className="text-xs">{de ? 'E-Mail *' : 'Email *'}</Label>
                  <Input id="contact_email" type="email" required value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    data-testid="enterprise-form-email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs">{de ? 'Telefon' : 'Phone'}</Label>
                  <Input id="phone" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    data-testid="enterprise-form-phone"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="message" className="text-xs">{de ? 'Nachricht (optional)' : 'Message (optional)'}</Label>
                <Textarea id="message" rows={3} value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={de ? 'Branche, Zeitrahmen, besondere Anforderungen…' : 'Industry, timeline, special needs…'}
                  data-testid="enterprise-form-message"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  {de ? 'Abbrechen' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !form.company || !form.contact_name || !form.contact_email}
                  className="flex-1 bg-[#BFFF00] text-[#0A0A0A] hover:bg-[#9ACC00] font-bold"
                  data-testid="enterprise-form-submit"
                >
                  {submitting
                    ? <><Loader2 size={14} className="mr-1.5 animate-spin" /> {de ? 'Sende...' : 'Sending...'}</>
                    : (de ? 'Angebot anfordern' : 'Request quote')}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
