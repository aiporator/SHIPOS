import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Calendar, Users, Clock, CheckCircle2, ArrowRight,
  CalendarPlus, Download, Play, Lock, User
} from 'lucide-react';

const TIER_STYLES = {
  free: { label: 'Free', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300' },
  standard: { label: 'Standard', bg: 'bg-sky-50 dark:bg-sky-500/10 dark:bg-sky-50 dark:bg-sky-500/100/10', text: 'text-sky-600 dark:text-sky-400' },
  accelerator: { label: 'OS PLUS', bg: 'bg-purple-50 dark:bg-[#7B3FE4]/10', text: 'text-purple-600 dark:text-[#A78BFA]' },
};

const TYPE_LABELS = {
  live: 'Live Event', workshop: 'Workshop', replay: 'Replay',
  focus_session: 'Focus Session', mastermind: 'Mastermind', coaching: '1:1 Coaching',
};

export const EventOutcomes = ({ outcomes, de }) => {
  if (!outcomes?.length) return null;
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">
        {de ? 'Das nimmst du mit' : 'What you will achieve'}
      </h4>
      <div className="space-y-2">
        {outcomes.map((outcome, i) => (
          <div key={`outcome-${i}`} className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 size={11} className="text-emerald-500" />
            </div>
            <span className="text-sm">{outcome}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const EventCalendarButtons = ({ event, de }) => {
  const handleAddToGoogle = () => {
    if (event.google_calendar_url) window.open(event.google_calendar_url, '_blank');
  };

  const handleDownloadIcs = () => {
    if (!event.ics_content) return;
    const blob = new Blob([event.ics_content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '-')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-2">
        {de ? 'Zum Kalender hinzufügen' : 'Add to Calendar'}
      </h4>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleAddToGoogle} className="text-xs font-semibold gap-1.5" data-testid="add-google-cal">
          <CalendarPlus size={13} /> Google Calendar
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadIcs} className="text-xs font-semibold gap-1.5" data-testid="add-outlook-cal">
          <Download size={13} /> Outlook / iCal
        </Button>
      </div>
    </div>
  );
};

export const EventCTA = ({ event, isLocked, isReplay, onRegister, onUnregister, de }) => {
  if (isLocked) {
    return (
      <div className="p-4 rounded-xl bg-purple-50 dark:bg-[#7B3FE4]/5 border border-[#7B3FE4]/20 dark:border-[#7B3FE4]/15 text-center">
        <Lock size={20} className="mx-auto mb-2 text-purple-500" />
        <p className="text-sm font-bold mb-1">{de ? 'OS PLUS Zugang benötigt' : 'OS PLUS Access Required'}</p>
        <p className="text-xs text-muted-foreground mb-3">{de ? 'Upgrade um auf exklusive Events zuzugreifen.' : 'Upgrade to access exclusive events.'}</p>
        <Button className="w-full bg-[#6B21A8] hover:bg-[#5B11A8] text-white font-bold" data-testid="event-upgrade-btn">
          {de ? 'OS PLUS holen' : 'Get OS PLUS'} <ArrowRight size={14} className="ml-1" />
        </Button>
      </div>
    );
  }
  if (isReplay) {
    return (
      <Button className="w-full bg-[#0A0A0A] dark:bg-white dark:text-black text-white font-bold h-12" data-testid="event-watch-btn">
        <Play size={16} className="mr-2" /> {de ? 'Replay ansehen' : 'Watch Replay'}
      </Button>
    );
  }
  if (event.is_registered) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 justify-center text-emerald-600 text-sm font-semibold py-2">
          <CheckCircle2 size={18} /> {de ? 'Du bist angemeldet' : "You're registered"}
        </div>
        <Button variant="outline" onClick={() => onUnregister(event.event_id)} className="w-full font-semibold" data-testid="event-unregister-btn">
          {de ? 'Abmelden' : 'Unregister'}
        </Button>
      </div>
    );
  }
  return (
    <Button onClick={() => onRegister(event.event_id)} className="w-full bg-[#0A0A0A] dark:bg-white dark:text-black text-white font-bold h-12" data-testid="event-register-btn">
      {de ? 'Jetzt anmelden' : 'Register Now'} <ArrowRight size={14} className="ml-2" />
    </Button>
  );
};

export const EventMeta = ({ event, de }) => {
  const tier = TIER_STYLES[event.access_level] || TIER_STYLES.free;
  const eventDate = new Date(event.date);
  return (
    <>
      {/* Header badges */}
      <div className="flex items-center gap-2 mb-3">
        <Badge className="bg-white/10 text-white text-[9px] font-bold border-0">{TYPE_LABELS[event.event_type] || event.event_type}</Badge>
        <Badge className={`${tier.bg} ${tier.text} text-[9px] font-bold border-0`}>{tier.label}</Badge>
      </div>
      {/* Date/Time */}
      <div className="flex items-center gap-4 text-sm text-white/60">
        <span className="flex items-center gap-1.5">
          <Calendar size={13} />
          {eventDate.toLocaleDateString(de ? 'de-DE' : 'en-US', { weekday: 'short', day: 'numeric', month: 'long' })}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={13} />
          {eventDate.toLocaleTimeString(de ? 'de-DE' : 'en-US', { hour: '2-digit', minute: '2-digit' })} · {event.duration}
        </span>
      </div>
    </>
  );
};
