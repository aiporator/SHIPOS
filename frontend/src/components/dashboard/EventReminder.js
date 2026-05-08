import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../ui/card';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import logger from '../../lib/logger';
import { ChevronRight } from 'lucide-react';
import { ReminderUrgencyIcon, ReminderContent, ReminderActions, URGENCY } from './reminder/ReminderParts';

const useDismissedReminders = () => {
  const [dismissed, setDismissed] = useState(() => {
    const stored = sessionStorage.getItem('wladbot_reminder_dismissed');
    return stored ? JSON.parse(stored) : {};
  });

  const dismiss = (eventId) => {
    const updated = { ...dismissed, [eventId]: true };
    setDismissed(updated);
    sessionStorage.setItem('wladbot_reminder_dismissed', JSON.stringify(updated));
  };

  return { dismissed, dismiss };
};

export const EventReminderBanner = ({ de }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const { dismissed, dismiss } = useDismissedReminders();

  const loadReminders = useCallback(async () => {
    try {
      const res = await api.get('/events-reminders');
      setData(res.data);
    } catch (err) { logger.error(err); }
  }, []);

  useEffect(() => { loadReminders(); }, [loadReminders]);

  if (!data) return null;

  const activeReminders = (data.reminders || []).filter(r => !dismissed[r.event_id]);
  const nextEvent = data.next_event && !dismissed[data.next_event?.event_id] ? data.next_event : null;
  const topReminder = activeReminders[0];
  if (!topReminder && !nextEvent) return null;

  const event = topReminder || nextEvent;
  const urgency = URGENCY[event.urgency] || URGENCY.soon;
  const isToday = event.urgency === 'today';

  return (
    <div className="animate-fade-in mb-5" data-testid="event-reminder-banner">
      <Card className="border-black/[0.04] dark:border-white/[0.06] overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 p-3">
            <ReminderUrgencyIcon urgency={urgency} isToday={isToday} />
            <ReminderContent event={event} de={de} />
            <ReminderActions event={event} de={de} onNavigate={navigate} onDismiss={dismiss} />
          </div>

          {activeReminders.length > 1 && (
            <div className="px-3 pb-2">
              <button onClick={() => navigate('/events')} className="text-[9px] text-muted-foreground hover:text-foreground transition-colors">
                +{activeReminders.length - 1} {de ? 'weitere Events' : 'more events'} <ChevronRight size={8} className="inline" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Small badge for sidebar — shows count of upcoming reminders
export const EventReminderCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/events-reminders');
        setCount((res.data?.reminders || []).length);
      } catch { /* silent */ }
    })();
  }, []);

  if (count === 0) return null;
  return (
    <span className="ml-auto w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center" data-testid="event-reminder-badge">
      {count}
    </span>
  );
};
