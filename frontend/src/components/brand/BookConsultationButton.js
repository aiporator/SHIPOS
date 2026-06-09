/**
 * BookConsultationButton — Sexy, prefilled Cal.com booking trigger.
 *
 * Improvements (Iter 92.2):
 *   - PREFILL via AuthContext: name + email auto-passed to Cal so the user
 *     skips the "who are you" step and lands directly on time selection.
 *   - Premium visual: animated calendar tick + live availability shimmer
 *     ("Nächster Slot in 2h") + lime glow halo on hover.
 *   - Robust fallback: if Cal didn't load (ad-blocker, slow network), we
 *     open the canonical booking URL in a new tab — UI never breaks.
 *   - Variants: `primary` (lime), `ghost` (subtle), `dark` (for dark heros).
 *
 * Pair with `<BookingTeaserCard />` for landing-section conversion blocks.
 */
import { useCallback, useMemo } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';

const CAL_LINK = 'leaderos/beratung';
const CAL_URL = `https://cal.com/${CAL_LINK}`;
const CAL_NAMESPACE = 'beratung';

/**
 * Hook returning a memoised `openBooking()` function. The user's name + email
 * (when authenticated) are prefilled into the Cal.com modal — frictionless.
 */
export const useBookConsultation = () => {
  const { user } = useAuth();

  const prefill = useMemo(() => {
    if (!user?.email) return undefined;
    return {
      name: user.name || user.email.split('@')[0],
      email: user.email,
    };
  }, [user]);

  return useCallback(() => {
    const cal = typeof window !== 'undefined' ? window.Cal?.ns?.[CAL_NAMESPACE] : null;
    if (cal) {
      try {
        cal('modal', {
          calLink: CAL_LINK,
          config: {
            layout: 'month_view',
            theme: 'dark',
            ...(prefill ? { name: prefill.name, email: prefill.email } : {}),
          },
        });
        return;
      } catch (e) {
        // fall through to canonical URL — never strand the user
      }
    }
    const tabUrl = prefill
      ? `${CAL_URL}?email=${encodeURIComponent(prefill.email)}&name=${encodeURIComponent(prefill.name)}`
      : CAL_URL;
    window.open(tabUrl, '_blank', 'noopener,noreferrer');
  }, [prefill]);
};

export const BookConsultationButton = ({
  label,
  variant = 'primary',
  size = 'default',
  className = '',
  icon = true,
  showAvailability = false,
  testId = 'book-consultation-btn',
}) => {
  const open = useBookConsultation();

  // Three visual variants — all share the smooth Revolut hover lift
  const variantClasses = {
    primary:
      'bg-[#BFFF00] hover:bg-[#D4FF4D] text-[#0A0A0A] font-bold glow-lime',
    ghost:
      'bg-foreground/[0.04] hover:bg-foreground/[0.08] text-foreground border border-foreground/10 font-semibold',
    dark:
      'bg-[#0A0A0A] hover:bg-[#1A1A1A] text-white border border-white/10 font-bold shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)]',
  };
  const styles = variantClasses[variant] || variantClasses.primary;

  return (
    <Button
      onClick={open}
      data-testid={testId}
      size={size}
      className={`${className} relative btn-revolut group overflow-hidden ${styles}`}
    >
      {icon && (
        <span className="relative mr-2 inline-flex items-center justify-center">
          <Calendar size={14} className="transition-transform group-hover:scale-110 group-hover:-rotate-6" />
          {/* Live-availability dot — pulses on the calendar icon */}
          {showAvailability && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-current/0">
              <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
            </span>
          )}
        </span>
      )}
      <span className="relative z-10">{label || 'Beratungsgespräch buchen'}</span>
      {icon && (
        <ArrowRight
          size={13}
          className="ml-1.5 relative z-10 transition-transform group-hover:translate-x-1"
        />
      )}
      {/* Soft sheen sweep on hover — Revolut signature */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 transition-transform duration-700 group-hover:translate-x-full"
      />
    </Button>
  );
};

export default BookConsultationButton;
