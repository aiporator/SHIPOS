/**
 * LearningVideosManager · admin tool to drop Vimeo IDs / URLs onto the 10 lessons.
 *
 * Reads /api/admin/learning-videos and lets the operator set vimeo_id /
 * vimeo_url per lesson row. As soon as a value is saved, the lesson becomes
 * playable in the in-app player without any code deploy.
 */
import { useEffect, useState, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Video, Check, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import api from '../../lib/api';
import logger from '../../lib/logger';

const TierBadge = ({ tier }) => (
  <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
    tier === 'accelerator'
      ? 'bg-[#BFFF00]/15 text-[#BFFF00] border border-[#BFFF00]/25'
      : 'bg-white/[0.06] text-white/55 border border-white/[0.08]'
  }`}>
    {tier}
  </span>
);

const VideoRow = ({ video, onSave }) => {
  const [vid, setVid] = useState(video.vimeo_id || '');
  const [url, setUrl] = useState(video.vimeo_url || '');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [err, setErr] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setErr('');
    try {
      const payload = { vimeo_id: vid.trim(), vimeo_url: url.trim() };
      const res = await api.put(`/admin/learning-videos/${video.id}`, payload);
      onSave(res.data.video);
      setSavedAt(Date.now());
    } catch (e) {
      logger.error('save learning_video failed', e);
      setErr(e?.response?.data?.detail || 'Save fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  const hasVideo = (vid && vid.trim()) || (url && url.trim());
  return (
    <Card className="p-4 bg-white/[0.02] border-white/[0.06]" data-testid={`learning-video-row-${video.id}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
          hasVideo ? 'bg-[#BFFF00]/15' : 'bg-white/[0.05]'
        }`}>
          {hasVideo ? <Check size={16} className="text-[#BFFF00]" /> : <Video size={16} className="text-white/40" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-white/45 uppercase">{video.id}</span>
            <TierBadge tier={video.min_tier} />
            <span className="text-[10px] text-white/40">· {video.module} · {video.duration} · {video.episodes} Ep</span>
          </div>
          <h4 className="font-bold text-white text-sm mt-1 truncate">{video.title}</h4>
        </div>
        {video.vimeo_id && (
          <a
            href={`https://vimeo.com/${video.vimeo_id}`}
            target="_blank" rel="noopener noreferrer"
            className="text-[#BFFF00] hover:text-[#D4FF4D] text-[11px] flex items-center gap-1"
            data-testid={`vimeo-preview-${video.id}`}
          >
            Vimeo <ExternalLink size={11} />
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2 items-center">
        <Input
          value={vid}
          onChange={(e) => setVid(e.target.value)}
          placeholder="Vimeo ID (z.B. 123456789)"
          className="bg-white/[0.03] border-white/[0.06] text-white text-xs"
          data-testid={`vimeo-id-input-${video.id}`}
        />
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Full Vimeo URL (optional)"
          className="bg-white/[0.03] border-white/[0.06] text-white text-xs"
          data-testid={`vimeo-url-input-${video.id}`}
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#BFFF00] hover:bg-[#D4FF4D] text-black font-bold text-[11px]"
          data-testid={`save-video-btn-${video.id}`}
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : (savedAt ? <Check size={12} /> : 'Speichern')}
        </Button>
      </div>
      {err && (
        <div className="mt-2 text-[11px] text-red-400 flex items-center gap-1.5">
          <AlertCircle size={11} /> {err}
        </div>
      )}
    </Card>
  );
};

export const LearningVideosManager = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/learning-videos');
      setData(res.data);
    } catch (e) {
      logger.error('learning-videos load failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = (updated) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      next.videos = next.videos.map((v) => v.id === updated.id ? {
        ...v,
        vimeo_id: updated.vimeo_id || null,
        vimeo_url: updated.vimeo_url || null,
        video_url: updated.video_url || null,
        has_video: !!(updated.vimeo_id || updated.vimeo_url || updated.video_url),
      } : v);
      next.ready = next.videos.filter(v => v.has_video).length;
      next.missing = next.total - next.ready;
      return next;
    });
  };

  if (loading || !data) {
    return (
      <Card className="p-8 flex items-center justify-center bg-white/[0.02] border-white/[0.06]">
        <Loader2 className="animate-spin text-white/40" />
      </Card>
    );
  }

  return (
    <div className="space-y-3" data-testid="learning-videos-manager">
      <Card className="p-4 bg-gradient-to-br from-[#BFFF00]/[0.05] to-transparent border-[#BFFF00]/15">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#BFFF00]/15 flex items-center justify-center">
            <Video size={16} className="text-[#BFFF00]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">
              {data.ready} / {data.total} Lektionen freigeschaltet
            </p>
            <p className="text-[11px] text-white/55">
              {data.missing > 0
                ? `${data.missing} Lektionen warten noch auf Vimeo-Link.`
                : 'Alle Lektionen sind playerbereit.'}
            </p>
          </div>
          <div className="text-2xl font-black text-[#BFFF00] tabular-nums" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {Math.round((data.ready / data.total) * 100)}%
          </div>
        </div>
      </Card>

      {data.videos.map((v) => (
        <VideoRow key={v.id} video={v} onSave={handleSave} />
      ))}
    </div>
  );
};

export default LearningVideosManager;
