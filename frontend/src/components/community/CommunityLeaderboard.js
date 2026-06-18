import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Trophy, Crown } from 'lucide-react';

const medalFor = (idx) => {
  if (idx === 0) return '🥇';
  if (idx === 1) return '🥈';
  if (idx === 2) return '🥉';
  return `${idx + 1}.`;
};

export const CommunityLeaderboard = ({ leaderboard, postsCount, de }) => (
  <aside className="space-y-4">
    <Card className="border-black/[0.06] dark:border-white/[0.06] sticky top-6" data-testid="leaderboard-card">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={14} className="text-amber-500" />
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{de ? 'Top Leaders' : 'Top Leaders'}</h3>
        </div>
        {leaderboard.length === 0 ? (
          <p className="text-[10px] text-muted-foreground/50">{de ? 'Noch keine Daten.' : 'No data yet.'}</p>
        ) : (
          <div className="space-y-2.5">
            {leaderboard.map((lb, i) => (
              <div key={lb.user_id} className="flex items-center gap-2.5" data-testid={`lb-row-${i}`}>
                <span className="text-[11px] font-black w-6 text-center shrink-0">{medalFor(i)}</span>
                <Avatar className="w-7 h-7 shrink-0">
                  {lb.picture && <AvatarImage src={lb.picture} />}
                  <AvatarFallback className="text-[9px] font-bold bg-gradient-to-br from-[#BFFF00] to-[#9ACC00] text-[#0A0A0A]">
                    {(lb.name || 'L')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-[11px] font-bold truncate">{lb.name}</p>
                    {lb.tier === 'accelerator' && <Crown size={8} className="text-[#BFFF00] shrink-0" />}
                  </div>
                  <p className="text-[9px] text-muted-foreground truncate">{lb.post_count} · {lb.total_likes} ♥ · {lb.xp} XP</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    <Card className="border-black/[0.06] dark:border-white/[0.06] bg-gradient-to-br from-[#0A0A0A] to-[#1A1A2E] text-white" data-testid="community-stats-card">
      <CardContent className="p-5">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-3">{de ? 'Community-Puls' : 'Community Pulse'}</h3>
        <div className="space-y-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-[#BFFF00]">{postsCount}</span>
            <span className="text-[10px] text-white/50">{de ? 'aktive Posts' : 'active posts'}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-white">{leaderboard.reduce((s, l) => s + (l.total_likes || 0), 0)}</span>
            <span className="text-[10px] text-white/50">{de ? 'Likes insgesamt' : 'total likes'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </aside>
);
