import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/badge';
import { Flame, ArrowRight } from 'lucide-react';
import api from '../../lib/api';

export const ChallengeMiniBar = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/challenge30/status').then(r => {
      const d = r.data;
      const completed = d.completed_days?.length || 0;
      setData({ completed, currentDay: d.current_day || 1, total: 30 });
    }).catch(() => {});
  }, []);

  if (!data) return null;

  const pct = Math.round((data.completed / data.total) * 100);

  return (
    <button
      onClick={() => navigate('/challenge')}
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:scale-105 transition-all group"
      data-testid="challenge-mini-bar"
    >
      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
        <Flame size={14} />
      </div>
      <div className="text-left">
        <p className="text-[10px] font-bold opacity-80">30-Tage Challenge</p>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[9px] font-bold">{data.completed}/{data.total}</span>
        </div>
      </div>
      <ArrowRight size={12} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
    </button>
  );
};
