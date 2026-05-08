import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Play, Clock, Layers, Crown, CheckCircle2, Sparkles } from 'lucide-react';
import api from '../../lib/api';
import logger from '../../lib/logger';

const VideoCard = ({ video, onPlay, onUpgrade }) => {
  const { unlocked, exclusive } = video;
  return (
    <div
      onClick={() => (unlocked ? onPlay(video) : onUpgrade(video))}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
        unlocked
          ? 'hover:scale-[1.015] hover:shadow-xl'
          : 'opacity-80 hover:opacity-100'
      }`}
      data-testid={`learning-video-card-${video.id}`}
    >
      {/* Thumbnail / cover */}
      <div
        className="relative h-32 flex items-center justify-center overflow-hidden"
        style={{
          background: exclusive
            ? `linear-gradient(135deg, #0A0A0A 0%, ${video.thumbnail_color}22 100%)`
            : `linear-gradient(135deg, ${video.thumbnail_color} 0%, ${video.thumbnail_color}AA 100%)`,
        }}
      >
        {exclusive && (
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(191,255,0,0.3) 0%, transparent 50%)',
          }} />
        )}
        <div className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
          unlocked ? 'bg-white/95' : 'bg-black/40 backdrop-blur'
        }`}>
          {unlocked ? (
            <Play size={22} className="text-black ml-0.5" fill="black" />
          ) : (
            <Lock size={20} className="text-white/90" />
          )}
        </div>
        {exclusive && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#BFFF00] text-[#0A0A0A] text-[9px] font-black uppercase tracking-wider">
            <Crown size={9} /> Accelerator
          </div>
        )}
        {!exclusive && unlocked && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur text-white text-[9px] font-bold uppercase tracking-wider">
            Starter
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 bg-white/80 dark:bg-card/70 backdrop-blur border-t border-black/[0.04] dark:border-white/[0.06]">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
          <span style={{ color: video.thumbnail_color }}>{video.module}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>{video.level}</span>
        </div>
        <h3 className="text-sm font-black tracking-tight leading-tight">{video.title}</h3>
        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
          {video.description}
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">
          <div className="flex items-center gap-3 text-[10px] font-semibold text-muted-foreground">
            <span className="flex items-center gap-1"><Clock size={10} /> {video.duration}</span>
            <span className="flex items-center gap-1"><Layers size={10} /> {video.episodes} Folgen</span>
          </div>
          {unlocked ? (
            <CheckCircle2 size={12} className="text-[#30D158]" />
          ) : (
            <span className="text-[9px] font-bold text-[#BFFF00]">UPGRADE →</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default function LearningVideosTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/my-path/videos');
        setData(res.data);
      } catch (err) {
        logger.error('Learning videos load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePlay = (video) => {
    // Future: navigate to a dedicated video-player; for now, toast/alert
    navigate(`/chat?prefill=${encodeURIComponent('Erkläre mir die Kerninhalte von "' + video.title + '"')}`);
  };
  const handleUpgrade = () => navigate('/coaching');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16" data-testid="learning-videos-loading">
        <div className="w-8 h-8 border-3 border-[#BFFF00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!data) return null;

  const userRank = { free: 0, starter: 1, standard: 2, accelerator: 3 }[data.user_tier] || 0;
  const hasStarter = userRank >= 1;
  const hasAccelerator = userRank >= 3;

  return (
    <div className="space-y-8" data-testid="learning-videos-tab">
      {/* Summary strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-black/[0.04] dark:border-white/[0.06] bg-gradient-to-br from-white to-gray-50/60 dark:from-card dark:to-card/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#BFFF00]/15 flex items-center justify-center">
            <Sparkles size={18} className="text-[#BFFF00]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deine Bibliothek</p>
            <h3 className="text-base font-black">
              {data.unlocked_count} / {data.total_count} Kurse freigeschaltet
            </h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dein Tier</p>
          <p className="text-sm font-black" style={{ color: hasAccelerator ? '#BFFF00' : hasStarter ? '#6B8A00' : '#64748B' }}>
            {data.user_tier_name}
          </p>
        </div>
      </div>

      {/* Standard / Leadership OS section — 12 Videokurse drip */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#6B8A00]">Leadership OS</span>
              <span className="text-[9px] font-bold text-muted-foreground/50">· €997 / Jahr · 12 Kurse drip</span>
            </div>
            <h2 className="text-xl font-black tracking-tight">Leadership-Grundlagen</h2>
            <p className="text-xs text-muted-foreground mt-0.5">12 Kurse · monatlich freigeschaltet · {data.starter_videos.reduce((s, v) => s + v.episodes, 0)} Folgen</p>
          </div>
          {!hasStarter && (
            <button
              onClick={handleUpgrade}
              className="text-[11px] font-black px-4 py-2 rounded-xl bg-[#0A0A0A] text-[#BFFF00] hover:bg-[#0A0A0A]/90 transition-colors"
              data-testid="unlock-starter-btn"
            >
              Freischalten →
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.starter_videos.map(v => (
            <VideoCard key={v.id} video={v} onPlay={handlePlay} onUpgrade={handleUpgrade} />
          ))}
        </div>
      </section>

      {/* Accelerator / Leadership OS PLUS section */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown size={10} className="text-[#BFFF00]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-[#BFFF00]">PLUS exklusiv</span>
              <span className="text-[9px] font-bold text-muted-foreground/50">· €4.447 / Jahr inkl. 12× Coaching</span>
            </div>
            <h2 className="text-xl font-black tracking-tight">Master-Programme</h2>
            <p className="text-xs text-muted-foreground mt-0.5">4 Masterclasses · {data.accelerator_videos.reduce((s, v) => s + v.episodes, 0)} Folgen · 1 Jahr Zugang</p>
          </div>
          {!hasAccelerator && (
            <button
              onClick={handleUpgrade}
              className="text-[11px] font-black px-4 py-2 rounded-xl bg-[#BFFF00] text-[#0A0A0A] hover:bg-[#BFFF00]/90 transition-colors shadow-lg shadow-[#BFFF00]/20"
              data-testid="unlock-accelerator-btn"
            >
              Accelerator buchen →
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.accelerator_videos.map(v => (
            <VideoCard key={v.id} video={v} onPlay={handlePlay} onUpgrade={handleUpgrade} />
          ))}
        </div>
      </section>
    </div>
  );
}
