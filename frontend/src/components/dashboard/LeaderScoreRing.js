import { AnimatedNumber } from './AnimatedNumber';

export const LeaderScoreRing = ({ score, size = 140 }) => {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(score, 100) / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }} data-testid="leader-score-widget">
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="scoreG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" /><stop offset="50%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="6" opacity="0.12" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#scoreG)" strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)', transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black tracking-tight"><AnimatedNumber value={score} /></span>
        <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-[0.15em]">Leader Score</span>
      </div>
    </div>
  );
};
