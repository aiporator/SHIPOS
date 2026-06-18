import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { X, Star, Users, User, Mail, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { EventOutcomes, EventCalendarButtons, EventCTA, EventMeta } from './EventParts';
import { useState } from 'react';
import api from '../../lib/api';
import logger from '../../lib/logger';
import { toast } from 'sonner';

export const EventDetailModal = ({ event, onClose, onRegister, onUnregister, de, isPremium }) => {
  const isReplay = event.event_type === 'replay';
  const isLocked = event.access_level === 'accelerator' && !isPremium;
  const [sendingTest, setSendingTest] = useState(false);

  const handleSendTestReminder = async () => {
    setSendingTest(true);
    try {
      const res = await api.post(`/events/${event.event_id}/send-test-reminder`);
      if (res.data?.sent) {
        toast.success(de ? `Test-Email an ${res.data.email} gesendet` : `Test email sent to ${res.data.email}`);
      } else {
        toast.error(res.data?.error || (de ? 'Email konnte nicht gesendet werden' : 'Email could not be sent'));
      }
    } catch (err) {
      logger.error(err);
      toast.error(err.response?.data?.detail || (de ? 'Email-Service nicht konfiguriert' : 'Email service not configured'));
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="relative w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
        <Card className="border-0 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#0A0A0A] to-[#1A1A2E] p-6 text-white relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors" data-testid="event-modal-close">
              <X size={20} />
            </button>
            <EventMeta event={event} de={de} />
            {event.featured && <Star size={12} className="text-amber-400 fill-amber-400 absolute top-6 right-12" />}
            <h2 className="text-xl font-bold leading-tight mb-2 mt-3">{event.title}</h2>
          </div>

          <CardContent className="p-6 space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>

            <EventOutcomes outcomes={event.outcomes} de={de} />

            {/* Host & Participants */}
            <div className="flex items-center gap-4 py-3 border-y border-black/[0.04] dark:border-white/[0.04]">
              {event.host && (
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-muted-foreground" />
                  <span className="font-medium">{event.host}</span>
                </div>
              )}
              {event.max_participants && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                  <Users size={14} />
                  <span>{event.registered}/{event.max_participants} {de ? 'Teilnehmer' : 'participants'}</span>
                </div>
              )}
            </div>

            {!isReplay && <EventCalendarButtons event={event} de={de} />}

            {event.is_registered && !isReplay && (
              <Button
                onClick={handleSendTestReminder}
                disabled={sendingTest}
                variant="outline"
                className="w-full text-xs font-semibold border-[#BFFF00]/30 hover:bg-[#BFFF00]/10"
                data-testid="send-test-reminder-btn"
              >
                {sendingTest
                  ? <><Loader2 size={12} className="mr-1.5 animate-spin" /> {de ? 'Wird gesendet...' : 'Sending...'}</>
                  : <><Mail size={12} className="mr-1.5" /> {de ? 'Test-Erinnerung per Email senden' : 'Send test email reminder'}</>}
              </Button>
            )}

            {event.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-[9px] font-medium rounded-full">{tag}</Badge>
                ))}
              </div>
            )}

            <EventCTA event={event} isLocked={isLocked} isReplay={isReplay} onRegister={onRegister} onUnregister={onUnregister} de={de} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
