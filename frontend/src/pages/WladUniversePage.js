/**
 * WladUniversePage — Die zentrale Wissensbibliothek der Plattform.
 *
 * Hier findet sich ALLES, was Wlad Jachtchenko an Methodik, Material und
 * sozialer Bestätigung mitbringt: 5 Rollen, 13 Themen-Säulen, 3 Bücher,
 * Podcast, Masterclass, die staatlich zertifizierte 6-Monats-Ausbildung
 * + die echten Track-Record-Stats.
 *
 * Jeder „Mit WladBot trainieren"-Button schiebt einen authentischen
 * Wlad-Starter-Prompt direkt in den Chat — der User landet in fokussiertem
 * Coaching ohne erst überlegen zu müssen, was er fragen soll.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  Sparkles, BookOpen, ExternalLink, Award, Mic2, GraduationCap,
  ArrowRight, Users, TrendingUp, Library, Target,
} from 'lucide-react';
import {
  WLAD_5_ROLES,
  WLAD_TOPIC_PILLARS,
  WLAD_BOOKS,
  WLAD_PODCAST,
  WLAD_MASTERCLASS,
  WLAD_STATS,
  WLAD_AUSBILDUNG,
} from '../data/wladTopics';

const StatTile = ({ value, label }) => (
  <div className="text-center px-4 py-3" data-testid={`wlad-stat-${label.split(' ')[0].toLowerCase()}`}>
    <div className="text-3xl md:text-4xl font-black text-[#BFFF00] tabular-nums leading-none"
         style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em' }}>
      {value}
    </div>
    <div className="text-[10px] uppercase tracking-wider text-white/55 mt-1.5 font-semibold">
      {label}
    </div>
  </div>
);

const RoleCard = ({ role, onTrain }) => (
  <Card className="p-5 bg-white/[0.02] border-white/[0.06] hover:border-white/[0.15] transition-all group"
        data-testid={`wlad-role-${role.id}`}>
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
           style={{ background: `${role.color}1A`, border: `1px solid ${role.color}33` }}>
        <span className="text-xs font-black" style={{ color: role.color, fontFamily: 'Outfit, sans-serif' }}>
          {WLAD_5_ROLES.indexOf(role) + 1}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {role.role}
        </h3>
        <p className="text-[11px] font-bold mt-0.5" style={{ color: role.color }}>
          {role.headline}
        </p>
      </div>
    </div>
    <p className="text-[12px] text-white/65 mt-3 leading-relaxed">{role.description}</p>
    <Button
      size="sm"
      variant="outline"
      onClick={() => onTrain(role.prompt_de)}
      data-testid={`train-role-${role.id}`}
      className="mt-3 w-full border-white/[0.12] bg-white/[0.02] hover:bg-white/[0.06] text-white/85 text-[11px] font-semibold"
    >
      <Sparkles size={11} className="mr-1.5" style={{ color: role.color }} />
      Mit WladBot trainieren
    </Button>
  </Card>
);

const TopicCard = ({ topic, color, onTrain }) => (
  <button
    onClick={() => onTrain(topic.prompt_de)}
    data-testid={`wlad-topic-card-${topic.id}`}
    className="text-left p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.15] transition-all group"
  >
    <div className="flex items-start justify-between gap-2 mb-1">
      <h4 className="font-bold text-white text-sm leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
        {topic.title}
      </h4>
      <ArrowRight size={13} className="text-white/30 group-hover:text-[#BFFF00] group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
    </div>
    <div className="flex items-center gap-2 mt-2">
      <span className="w-1 h-1 rounded-full" style={{ background: color }} />
      <span className="text-[10px] text-white/45 uppercase tracking-wider font-semibold">Wlad-Framework</span>
    </div>
  </button>
);

const PillarSection = ({ pillar, onTrain }) => (
  <div data-testid={`wlad-pillar-${pillar.id}`}>
    <div className="flex items-center gap-2 mb-3">
      <span className="w-1.5 h-6 rounded-full" style={{ background: pillar.color }} />
      <h3 className="text-base font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
        {pillar.label_de}
      </h3>
      <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
        · {pillar.label_en}
      </span>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
      {pillar.topics.map((t) => (
        <TopicCard key={t.id} topic={t} color={pillar.color} onTrain={onTrain} />
      ))}
    </div>
  </div>
);

export default function WladUniversePage() {
  const navigate = useNavigate();
  const [pendingPrompt, setPendingPrompt] = useState(null);

  const handleTrain = (prompt) => {
    setPendingPrompt(prompt);
    // Stash the prompt in sessionStorage so ChatPage can pick it up
    try {
      sessionStorage.setItem('wlad_starter_prompt', prompt);
    } catch (e) { /* sessionStorage may be blocked */ }
    navigate('/chat');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto pb-12">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-2xl border border-[#BFFF00]/15"
                 style={{ background: 'radial-gradient(circle at 0% 0%, rgba(191,255,0,0.12), transparent 50%), radial-gradient(circle at 100% 100%, rgba(0,170,255,0.08), transparent 50%), rgba(255,255,255,0.015)' }}>
          <div className="p-6 md:p-10">
            <div className="flex items-center gap-2 mb-3">
              <Library size={14} className="text-[#BFFF00]" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#BFFF00] font-bold">Wlad-Universum</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-[1.05] mb-3"
                style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.035em' }}>
              Die komplette Wissens-<br className="hidden md:block" />bibliothek von Wlad Jachtchenko.
            </h1>
            <p className="text-base md:text-lg text-white/65 max-w-2xl leading-relaxed">
              Europas führender Kommunikations- und Leadership-Coach. 12 Bücher, davon 3 SPIEGEL-Bestseller.
              400.000 Kunden in 20+ Ländern. Jetzt im WladBot vereint — trainierbar 24/7.
            </p>

            {/* Stats Strip */}
            <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-2 rounded-2xl border border-white/[0.06] bg-black/30 backdrop-blur"
                 data-testid="wlad-stats-strip">
              {WLAD_STATS.map((s, i) => (
                <div key={s.label} className={i < WLAD_STATS.length - 1 ? 'md:border-r border-white/[0.05]' : ''}>
                  <StatTile {...s} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5 ROLLEN ─────────────────────────────────────────────────── */}
        <section data-testid="wlad-5-rollen">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Target size={13} className="text-[#BFFF00]" />
                <span className="text-[10px] uppercase tracking-wider text-[#BFFF00] font-bold">
                  Kern-Framework
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white"
                  style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.025em' }}>
                Die 5 Rollen einer Führungskraft
              </h2>
              <p className="text-sm text-white/55 mt-1">
                Jede Rolle ist eine Disziplin. Jede Disziplin ist trainierbar mit WladBot.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {WLAD_5_ROLES.map((r) => (
              <RoleCard key={r.id} role={r} onTrain={handleTrain} />
            ))}
          </div>
        </section>

        {/* ── 13 TOPICS — drei Säulen ──────────────────────────────────── */}
        <section className="space-y-7" data-testid="wlad-13-topics">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={13} className="text-[#BFFF00]" />
              <span className="text-[10px] uppercase tracking-wider text-[#BFFF00] font-bold">
                Keynote-Methodik
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white"
                style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.025em' }}>
              13 Themen · 3 Säulen
            </h2>
            <p className="text-sm text-white/55 mt-1">
              Wlads offizielle Trainings-Taxonomie. Klick → Starter-Prompt im Chat.
            </p>
          </div>
          {WLAD_TOPIC_PILLARS.map((p) => (
            <PillarSection key={p.id} pillar={p} onTrain={handleTrain} />
          ))}
        </section>

        {/* ── AUSBILDUNG ────────────────────────────────────────────────── */}
        <section data-testid="wlad-ausbildung"
                 className="rounded-2xl border border-white/[0.06] overflow-hidden"
                 style={{ background: 'linear-gradient(135deg, rgba(191,255,0,0.06) 0%, transparent 60%), rgba(255,255,255,0.015)' }}>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap size={14} className="text-[#BFFF00]" />
              <span className="text-[10px] uppercase tracking-wider text-[#BFFF00] font-bold">Tiefer einsteigen</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white leading-tight"
                style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.025em' }}>
              {WLAD_AUSBILDUNG.title}
            </h2>
            <p className="text-sm text-white/65 mt-2">{WLAD_AUSBILDUNG.subtitle}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
              <div>
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-white/55 mb-2">Format</h4>
                <ul className="space-y-2.5">
                  {WLAD_AUSBILDUNG.format.map((f) => (
                    <li key={f.title} className="flex gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#BFFF00] mt-1.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white">{f.title}</div>
                        <div className="text-[11px] text-white/55">{f.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-wider font-bold text-white/55 mb-2">Outcomes</h4>
                <ul className="space-y-2.5">
                  {WLAD_AUSBILDUNG.outcomes.map((o) => (
                    <li key={o} className="flex gap-2.5">
                      <Award size={12} className="text-[#BFFF00] mt-1 shrink-0" />
                      <span className="text-sm text-white/80">{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href={WLAD_AUSBILDUNG.url} target="_blank" rel="noopener noreferrer" data-testid="ausbildung-cta">
                <Button className="bg-[#BFFF00] hover:bg-[#D4FF4D] text-black font-bold">
                  <GraduationCap size={14} className="mr-2" />
                  Beratungsgespräch buchen
                </Button>
              </a>
              <Button variant="outline" onClick={() => handleTrain('Erkläre mir die staatlich zertifizierte 6-Monats-Führungskräfte-Ausbildung von Wlad. Was würdest du mir nach meiner aktuellen Situation als Erstes raten?')}
                      className="border-white/15 text-white/85"
                      data-testid="ausbildung-chat-cta">
                <Sparkles size={13} className="mr-1.5" /> Mit WladBot besprechen
              </Button>
            </div>
          </div>
        </section>

        {/* ── BÜCHER · PODCAST · MASTERCLASS ────────────────────────────── */}
        <section data-testid="wlad-resources">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <BookOpen size={13} className="text-[#BFFF00]" />
              <span className="text-[10px] uppercase tracking-wider text-[#BFFF00] font-bold">Originalquellen</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white"
                style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.025em' }}>
              Bücher · Podcast · Masterclass
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {WLAD_BOOKS.map((b) => (
              <a key={b.id} href={b.url} target="_blank" rel="noopener noreferrer"
                 data-testid={`book-card-${b.id}`}
                 className="block p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#BFFF00]/30 hover:bg-white/[0.04] transition-all group">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <BookOpen size={16} className="text-[#BFFF00]" />
                  <ExternalLink size={11} className="text-white/30 group-hover:text-[#BFFF00] transition-colors" />
                </div>
                <h3 className="font-bold text-white text-base leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  „{b.title}"
                </h3>
                <p className="text-[11px] text-white/60 mt-1.5 leading-relaxed">{b.subtitle}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/35 font-semibold mt-2">{b.publisher}</p>
              </a>
            ))}
            <a href={WLAD_PODCAST.url} target="_blank" rel="noopener noreferrer"
               data-testid="podcast-card"
               className="block p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#BFFF00]/30 hover:bg-white/[0.04] transition-all group">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Mic2 size={16} className="text-[#BFFF00]" />
                <ExternalLink size={11} className="text-white/30 group-hover:text-[#BFFF00] transition-colors" />
              </div>
              <h3 className="font-bold text-white text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>„{WLAD_PODCAST.title}"</h3>
              <p className="text-[11px] text-white/60 mt-1.5">{WLAD_PODCAST.subtitle}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/35 font-semibold mt-2">Podcast (DE)</p>
            </a>
            <a href={WLAD_MASTERCLASS.url} target="_blank" rel="noopener noreferrer"
               data-testid="masterclass-card"
               className="block p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#BFFF00]/30 hover:bg-white/[0.04] transition-all group">
              <div className="flex items-start justify-between gap-2 mb-2">
                <TrendingUp size={16} className="text-[#BFFF00]" />
                <ExternalLink size={11} className="text-white/30 group-hover:text-[#BFFF00] transition-colors" />
              </div>
              <h3 className="font-bold text-white text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>{WLAD_MASTERCLASS.title}</h3>
              <p className="text-[11px] text-white/60 mt-1.5">{WLAD_MASTERCLASS.subtitle}</p>
              <p className="text-[10px] uppercase tracking-wider text-white/35 font-semibold mt-2">1.100+ Videos · VR Training</p>
            </a>
          </div>
        </section>

        {/* ── COMMUNITY CTA ─────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-white/[0.06] p-6 md:p-8 text-center"
                 style={{ background: 'radial-gradient(circle at 50% 0%, rgba(191,255,0,0.08), transparent 60%)' }}
                 data-testid="community-cta">
          <Users size={24} className="text-[#BFFF00] mx-auto mb-3" />
          <h3 className="text-xl md:text-2xl font-black text-white"
              style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
            Werde Teil der Argumentorik-Community.
          </h3>
          <p className="text-sm text-white/55 mt-2 max-w-xl mx-auto">
            400.000+ Führungskräfte trainieren bereits mit Wlads Methodik. Du bekommst hier täglich neue Workouts,
            Live-Calls und persönliches Feedback. WladBot ist dein 24/7-Co-Pilot.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-5">
            <Button onClick={() => handleTrain('Stell mir 3 Fragen, mit denen WladBot meinen aktuellen Leadership-Status diagnostiziert. Dann gib mir den ersten konkreten Trainings-Schritt.')}
                    className="bg-[#BFFF00] hover:bg-[#D4FF4D] text-black font-bold"
                    data-testid="community-chat-cta">
              <Sparkles size={14} className="mr-2" /> Sofort mit WladBot starten
            </Button>
            <a href="https://www.argumentorik.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-white/15 text-white/85" data-testid="community-external-cta">
                <ExternalLink size={13} className="mr-1.5" /> Mehr auf argumentorik.com
              </Button>
            </a>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
