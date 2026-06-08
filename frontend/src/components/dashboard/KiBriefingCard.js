import { Card, CardContent } from '../ui/card';
import { Newspaper, Quote, MessageSquareText, TrendingUp } from 'lucide-react';

export const KiBriefingCard = ({ kiNews, de, onNavigate }) => {
  if (!kiNews) {
    return (
      <Card className="bg-[#0A0A0A] text-foreground border-0 animate-fade-in overflow-hidden" data-testid="ki-news-card">
        <CardContent className="px-4 py-6 text-center">
          <p className="text-[11px] text-muted-foreground/70">{de ? 'Lade KI-Briefing...' : 'Loading AI Briefing...'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0A0A0A] text-foreground border-0 animate-fade-in overflow-hidden" data-testid="ki-news-card">
      <CardContent className="p-0">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#BFFF00]/15 flex items-center justify-center">
              <Newspaper size={12} className="text-brand" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">KI-Briefing</span>
          </div>
          <span className="text-[9px] text-muted-foreground/50">{kiNews.date || ''}</span>
        </div>

        {/* Quote */}
        {kiNews.quote_of_the_day && (
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-start gap-2.5">
              <Quote size={14} className="text-brand shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[11px] text-foreground/80 leading-relaxed italic">"{kiNews.quote_of_the_day.quote}"</p>
                <p className="text-[9px] text-muted-foreground/70 mt-1.5 font-semibold">{kiNews.quote_of_the_day.author} — {kiNews.quote_of_the_day.role}</p>
                <p className="text-[9px] text-[#BFFF00]/60 mt-0.5">{kiNews.quote_of_the_day.insight}</p>
                {kiNews.quote_of_the_day.coach_prompt && (
                  <button
                    onClick={() => onNavigate(`/chat?msg=${encodeURIComponent(kiNews.quote_of_the_day.coach_prompt)}`)}
                    className="mt-2 flex items-center gap-1 text-[9px] font-bold text-[#BFFF00]/70 hover:text-brand transition-colors"
                    data-testid="ki-news-quote-discuss"
                  >
                    <MessageSquareText size={10} /> {de ? 'Mit Coach diskutieren' : 'Discuss with Coach'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Trends */}
        {kiNews.trends && (
          <div className="px-4 py-3 space-y-2.5">
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Trends</p>
            {kiNews.trends.map((trend, i) => (
              <div key={trend.title} className="group">
                <div className="flex items-start gap-2">
                  <TrendingUp size={10} className={`shrink-0 mt-0.5 ${trend.impact === 'Kritisch' ? 'text-red-400' : trend.impact === 'Hoch' ? 'text-amber-400' : 'text-muted-foreground/70'}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[10px] font-semibold text-foreground/80 truncate">{trend.title}</p>
                      <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${trend.impact === 'Kritisch' ? 'bg-red-500/20 text-red-400' : trend.impact === 'Hoch' ? 'bg-amber-500/20 text-amber-400' : 'bg-foreground/10 text-muted-foreground'}`}>
                        {trend.impact}
                      </span>
                    </div>
                    <p className="text-[9px] text-muted-foreground/70 leading-relaxed line-clamp-2">{trend.summary}</p>
                    {trend.coach_prompt && (
                      <button
                        onClick={() => onNavigate(`/chat?msg=${encodeURIComponent(trend.coach_prompt)}`)}
                        className="mt-1 flex items-center gap-1 text-[8px] font-bold text-[#BFFF00]/50 hover:text-brand transition-colors opacity-0 group-hover:opacity-100"
                        data-testid={`ki-news-trend-discuss-${i}`}
                      >
                        <MessageSquareText size={8} /> {de ? 'Diskutieren' : 'Discuss'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
