/**
 * BookConsultationButton — öffnet das cal.com Booking-Modal.
 *
 * Nutzt das in `index.html` initialisierte `Cal.ns.beratung` Namespace. Wenn
 * cal.com (z.B. wegen Ad-Blocker) nicht laden konnte, wird der User in
 * einem neuen Tab zur kanonischen Booking-URL geschickt — niemals broken.
 */
import { useCallback } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

const CAL_LINK = 'leaderos/beratung';
const CAL_URL = `https://cal.com/${CAL_LINK}`;

export const useBookConsultation = () => {
  return useCallback(() => {
    // Try Cal.com embed first
    if (typeof window !== 'undefined' && window.Cal?.ns?.beratung) {
      try {
        window.Cal.ns.beratung('modal', {
          calLink: CAL_LINK,
          config: { layout: 'month_view' },
        });
        return;
      } catch (e) { /* fall through to tab open */ }
    }
    // Fallback: open in new tab so user is never stuck
    window.open(CAL_URL, '_blank', 'noopener,noreferrer');
  }, []);
};

export const BookConsultationButton = ({
  label,
  variant = 'primary',
  size = 'default',
  className = '',
  icon = true,
  testId = 'book-consultation-btn',
}) => {
  const open = useBookConsultation();
  const isPrimary = variant === 'primary';

  return (
    <Button
      onClick={open}
      data-testid={testId}
      size={size}
      className={`${className} btn-revolut group ${
        isPrimary
          ? 'bg-[#BFFF00] hover:bg-[#D4FF4D] text-[#0A0A0A] font-bold shadow-[0_8px_24px_-8px_rgba(191,255,0,0.6)]'
          : 'bg-foreground/[0.04] hover:bg-foreground/[0.08] text-foreground border border-foreground/10 font-semibold'
      }`}
    >
      {icon && <Calendar size={14} className="mr-2" />}
      {label || 'Beratungsgespräch buchen'}
      {icon && <ArrowRight size={13} className="ml-1.5 transition-transform group-hover:translate-x-0.5" />}
    </Button>
  );
};

export default BookConsultationButton;
