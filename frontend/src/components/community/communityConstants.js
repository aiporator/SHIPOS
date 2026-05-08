import { Users, Trophy, HelpCircle, Sparkles, Flame } from 'lucide-react';

export const CATEGORIES = [
  { id: 'all',       label_de: 'Alle',       label_en: 'All',       icon: Users },
  { id: 'win',       label_de: 'Wins',       label_en: 'Wins',      icon: Trophy,    color: 'text-amber-500' },
  { id: 'question',  label_de: 'Fragen',     label_en: 'Questions', icon: HelpCircle, color: 'text-sky-500' },
  { id: 'challenge', label_de: 'Heraus­forderung', label_en: 'Challenge', icon: Flame, color: 'text-rose-500' },
  { id: 'general',   label_de: 'Allgemein',  label_en: 'General',   icon: Sparkles,  color: 'text-violet-500' },
];

export const getCategoryConfig = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[4];

export const timeAgo = (iso, de) => {
  try {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return de ? 'gerade eben' : 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
    return `${Math.floor(diff / 86400)} d`;
  } catch { return ''; }
};
