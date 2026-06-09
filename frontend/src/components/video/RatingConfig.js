import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Flame, Sparkles, Users, BarChart3, Target, Shield,
  Heart, Zap, MessageSquareText, ChevronDown, ChevronUp, Settings2
} from 'lucide-react';
import api from '../../lib/api';
import logger from '../../lib/logger';

const MODES = [
  {
    id: 'soft',
    label: 'Ermutigend',
    labelEn: 'Encouraging',
    desc: 'Fokus auf Stärken. Motivierendes, aufbauendes Feedback.',
    descEn: 'Focus on strengths. Motivating, encouraging feedback.',
    icon: Heart,
    gradient: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-500/20',
    active: 'ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/15',
  },
  {
    id: 'hard',
    label: 'Ehrlich & Direkt',
    labelEn: 'Honest & Direct',
    desc: 'Schonungslos ehrlich. Benchmark gegen Top 1%.',
    descEn: 'Brutally honest. Benchmarked against top 1%.',
    icon: Zap,
    gradient: 'from-red-500 to-orange-500',
    bg: 'bg-red-50 dark:bg-red-500/10 border-red-200/50 dark:border-red-500/20',
    active: 'ring-2 ring-red-500 shadow-lg shadow-red-500/15',
  },
];

const LEVELS = [
  { id: 'einsteiger', label: 'Einsteiger', labelEn: 'Beginner', desc: 'Erste Führungsrolle' },
  { id: 'fortgeschritten', label: 'Fortgeschritten', labelEn: 'Advanced', desc: '2+ Jahre Führung' },
  { id: 'executive', label: 'Executive', labelEn: 'Executive', desc: 'C-Level / VP' },
];

const FOCUS_OPTIONS = [
  { id: 'klarheit', label: 'Klarheit', icon: MessageSquareText, color: 'text-sky-500' },
  { id: 'empathie', label: 'Empathie', icon: Heart, color: 'text-pink-500' },
  { id: 'struktur', label: 'Struktur', icon: BarChart3, color: 'text-purple-500' },
  { id: 'ueberzeugungskraft', label: 'Überzeugungskraft', icon: Sparkles, color: 'text-amber-500' },
];

const AUDIENCES = [
  { id: 'allgemein', label: 'Allgemein', labelEn: 'General' },
  { id: 'team', label: 'Mein Team', labelEn: 'My Team' },
  { id: 'board', label: 'Board / Vorstand', labelEn: 'Board' },
  { id: 'kunden', label: 'Kunden', labelEn: 'Clients' },
  { id: 'investoren', label: 'Investoren', labelEn: 'Investors' },
];

export const RatingConfig = ({ config, onChange, de, compact = false }) => {
  const [expanded, setExpanded] = useState(!compact);

  const setMode = (mode) => onChange({ ...config, mode });
  const setLevel = (level) => onChange({ ...config, level });
  const setAudience = (audience) => onChange({ ...config, audience });
  const toggleFocus = (focusId) => {
    const current = config.focus || [];
    const next = current.includes(focusId)
      ? current.filter(f => f !== focusId)
      : [...current, focusId];
    onChange({ ...config, focus: next });
  };

  if (compact && !expanded) {
    const activeMode = MODES.find(m => m.id === config.mode) || MODES[1];
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 dark:bg-card/50 border border-black/[0.04] dark:border-white/[0.06] hover:shadow-md transition-all w-full text-left group"
        data-testid="rating-config-toggle"
      >
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${activeMode.gradient} flex items-center justify-center shrink-0`}>
          <activeMode.icon size={13} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold">{de ? activeMode.label : activeMode.labelEn}</p>
          <p className="text-[9px] text-muted-foreground truncate">
            {LEVELS.find(l => l.id === config.level)?.label} · {AUDIENCES.find(a => a.id === config.audience)?.label}
            {config.focus?.length > 0 && ` · ${config.focus.length} Fokus`}
          </p>
        </div>
        <Settings2 size={14} className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
      </button>
    );
  }

  return (
    <Card className="border-black/[0.04] dark:border-white/[0.06] animate-fade-in" data-testid="rating-config-panel">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#BFFF00] to-[#9ACC00] flex items-center justify-center">
              <Settings2 size={12} className="text-white" />
            </div>
            <h3 className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
              {de ? 'Bewertungs-Einstellungen' : 'Rating Settings'}
            </h3>
          </div>
          {compact && (
            <Button variant="ghost" size="sm" onClick={() => setExpanded(false)} className="h-7 w-7 p-0">
              <ChevronUp size={14} />
            </Button>
          )}
        </div>

        {/* Rating Mode */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            {de ? 'Bewertungsmodus' : 'Rating Mode'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`p-3 rounded-xl border text-left transition-all ${m.bg} ${config.mode === m.id ? m.active : 'opacity-60 hover:opacity-100'}`}
                data-testid={`rating-mode-${m.id}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${m.gradient} flex items-center justify-center`}>
                    <m.icon size={12} className="text-white" />
                  </div>
                  <span className="text-[12px] font-bold">{de ? m.label : m.labelEn}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{de ? m.desc : m.descEn}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            {de ? 'Erfahrungslevel' : 'Experience Level'}
          </p>
          <div className="flex gap-1.5">
            {LEVELS.map(l => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`flex-1 py-2 px-3 rounded-lg text-center transition-all border ${
                  config.level === l.id
                    ? 'bg-[#BFFF00]/[0.06] dark:bg-[#BFFF00]/10 border-[#BFFF00]/30 dark:border-[#BFFF00]/20 text-[#4A6200] dark:text-[#BFFF00] shadow-sm'
                    : 'bg-white dark:bg-card border-black/[0.04] dark:border-white/[0.06] text-muted-foreground hover:text-foreground'
                }`}
                data-testid={`rating-level-${l.id}`}
              >
                <p className="text-[11px] font-bold">{de ? l.label : l.labelEn}</p>
                <p className="text-[9px] text-muted-foreground">{l.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Focus Areas (multi-select) */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            {de ? 'Fokus-Bereiche' : 'Focus Areas'}
            <span className="text-muted-foreground/50 ml-1 normal-case">({de ? 'optional, mehrere möglich' : 'optional, multiple'})</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {FOCUS_OPTIONS.map(f => {
              const isActive = config.focus?.includes(f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => toggleFocus(f.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                    isActive
                      ? 'bg-[#BFFF00]/[0.06] dark:bg-[#BFFF00]/10 border-[#BFFF00]/30 dark:border-[#BFFF00]/20 text-[#4A6200] dark:text-[#BFFF00]'
                      : 'bg-white dark:bg-card border-black/[0.04] dark:border-white/[0.06] text-muted-foreground hover:text-foreground'
                  }`}
                  data-testid={`rating-focus-${f.id}`}
                >
                  <f.icon size={12} className={isActive ? f.color : 'text-muted-foreground'} />
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Audience */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            {de ? 'Zielgruppe der Rede' : 'Speech Audience'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {AUDIENCES.map(a => (
              <button
                key={a.id}
                onClick={() => setAudience(a.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                  config.audience === a.id
                    ? 'bg-[#BFFF00]/[0.06] dark:bg-[#BFFF00]/10 border-[#BFFF00]/30 dark:border-[#BFFF00]/20 text-[#4A6200] dark:text-[#BFFF00]'
                    : 'bg-white dark:bg-card border-black/[0.04] dark:border-white/[0.06] text-muted-foreground hover:text-foreground'
                }`}
                data-testid={`rating-audience-${a.id}`}
              >
                {de ? a.label : a.labelEn}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
