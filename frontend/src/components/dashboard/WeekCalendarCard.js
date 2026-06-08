import { Card, CardContent } from '../ui/card';
import { Calendar } from 'lucide-react';

// Accessible lime token: dark enough on white, bright on dark.
const LIME_TXT = 'text-[#6B8A00] dark:text-brand';

export const WeekCalendarCard = ({ de, onNavigate }) => {
  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7;
  const labels = de ? ['Mo','Di','Mi','Do','Fr','Sa','So'] : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  return (
    <Card className="border-black/[0.04] dark:border-white/[0.06] animate-fade-in" data-testid="week-calendar">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Calendar size={12} /> {de ? 'Diese Woche' : 'This Week'}
          </h3>
          <button onClick={() => onNavigate('/events')} className={`text-[10px] font-semibold ${LIME_TXT} hover:underline`}>{de ? 'Kalender' : 'View Calendar'}</button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-3">
          {labels.map((label, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - dayOfWeek + i);
            const isToday = i === dayOfWeek;
            return (
              <div key={label} className="text-center">
                <p className="text-[8px] text-muted-foreground/50 font-medium">{label}</p>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-0.5 text-xs font-bold ${isToday ? 'bg-[#BFFF00] text-[#0A0A0A]' : ''}`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        <div className="space-y-2 border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 rounded-full bg-[#BFFF00]" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold truncate">{de ? 'KI Strategie Workshop' : 'AI Strategy Workshop'}</p>
              <p className="text-[9px] text-muted-foreground">15:00</p>
            </div>
            <button className={`text-[9px] ${LIME_TXT} font-semibold`}>+ Cal</button>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 rounded-full bg-amber-500" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold truncate">{de ? 'Tägliche Challenge' : 'Daily Challenge'}</p>
              <p className="text-[9px] text-muted-foreground">10:00</p>
            </div>
            <button className={`text-[9px] ${LIME_TXT} font-semibold`}>+ Cal</button>
          </div>
        </div>
        <div className="flex gap-3 mt-3 pt-2 border-t border-border">
          {[
            { label: 'Event', color: 'bg-[#BFFF00]' },
            { label: 'Assessment', color: 'bg-amber-500' },
            { label: 'Coaching', color: 'bg-[#7B3FE4]' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${l.color}`} />
              <span className="text-[8px] text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
