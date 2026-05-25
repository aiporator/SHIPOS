/**
 * WladUniversePage — Doppelfunktion: interne Wissensbibliothek + Landing-Page
 * für Beratungsgespräch-Bookings (cal.com Integration: leaderos/beratung).
 *
 * Design: Revolut-inspired — riesige bold Outfit-Headlines, klare Hierarchie,
 * Glow-Halos via design tokens (NICHT hardcoded text-white), Cal-Buttons an
 * 5 strategischen Conversion-Points.
 *
 * Light/Dark: alle Farben kommen aus hsl(var(--...)). Brand-Lime wird nur
 * für Accents verwendet (nie für reinen Text in Light-Mode — dort `#6B8A00`).
 */
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { BookConsultationButton, useBookConsultation } from '../components/brand/BookConsultationButton';
import {
  Sparkles, BookOpen, ExternalLink, Award, Mic2, GraduationCap,
  ArrowRight, Users, TrendingUp, Library, Target, CheckCircle2,
  Calendar, Headphones,
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

const OUTFIT = { fontFamily: 'Outfit, Inter, system-ui, sans-serif' };

// ── Atoms ────────────────────────────────────────────────────────────────

const SectionEyebrow = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2 mb-2.5">
    {Icon && <Icon size={13} className="text-brand" />}
    <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-brand">
      {label}
    </span>
  </div>
);

const StatTile = ({ value, label }) => (
  <div className="text-center px-4 py-4 group cursor-default"
       data-testid={`wlad-stat-${label.split(' ')[0].toLowerCase()}`}>
    <div className="text-3xl md:text-4xl font-black text-brand num-ticker leading-none transition-transform duration-300 group-hover:scale-105"
         style={OUTFIT}>
      {value}
    </div>
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2 font-bold">
      {label}
    </div>
  </div>
);

const RoleCard = ({ role, index, onTrain }) => (
  <div className="card-revolut p-5 cursor-default" data-testid={`wlad-role-${role.id}`}>
    <div className="flex items-start gap-3 mb-3">
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
        style={{
          background: `${role.color}1F`,
          border: `1px solid ${role.color}3D`,
          boxShadow: `inset 0 1px 0 ${role.color}22`,
        }}
      >
        <span className="text-sm font-black" style={{ ...OUTFIT, color: role.color }}>
          {index + 1}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-black text-foreground text-base leading-tight" style={OUTFIT}>
          {role.role}
        </h3>
        <p className="text-[11px] font-bold mt-1" style={{ color: role.color }}>
          {role.headline}
        </p>
      </div>
    </div>
    <p className="text-[12.5px] text-muted-foreground leading-relaxed">{role.description}</p>
    <Button
      size="sm"
      variant="outline"
      onClick={() => onTrain(role.prompt_de)}
      data-testid={`train-role-${role.id}`}
      className="mt-3.5 w-full border-border bg-foreground/[0.02] hover:bg-foreground/[0.06] text-foreground/85 text-[11px] font-semibold btn-revolut"
    >
      <Sparkles size={11} className="mr-1.5" style={{ color: role.color }} />
      Mit WladBot trainieren
    </Button>
  </div>
);

const TopicChip = ({ topic, color, onTrain }) => (
  <button
    onClick={() => onTrain(topic.prompt_de)}
    data-testid={`wlad-topic-card-${topic.id}`}
    className="text-left p-4 rounded-2xl bg-card border border-border hover:bg-foreground/[0.04] hover:border-foreground/15 transition-all group btn-revolut"
  >
    <div className="flex items-start justify-between gap-2 mb-2">
      <h4 className="font-black text-foreground text-sm leading-tight" style={OUTFIT}>
        {topic.title}
      </h4>
      <ArrowRight
        size={13}
        className="text-muted-foreground/40 group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5"
      />
    </div>
    <div className="flex items-center gap-2">
      <span className="w-1 h-1 rounded-full" style={{ background: color }} />
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
        Wlad-Framework
      </span>
    </div>
  </button>
);

const PillarBlock = ({ pillar, onTrain }) => (
  <div data-testid={`wlad-pillar-${pillar.id}`}>
    <div className="flex items-center gap-2.5 mb-3.5">
      <span className="w-1.5 h-6 rounded-full" style={{ background: pillar.color }} />
      <h3 className="text-base md:text-lg font-black text-foreground" style={OUTFIT}>
        {pillar.label_de}
      </h3>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
        · {pillar.label_en}
      </span>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
      {pillar.topics.map((t) => (
        <TopicChip key={t.id} topic={t} color={pillar.color} onTrain={onTrain} />
      ))}
    </div>
  </div>
);

// ── Page ─────────────────────────────────────────────────────────────────

export default function WladUniversePage() {
  const navigate = useNavigate();
  const openBooking = useBookConsultation();

  const handleTrain = (prompt) => {
    try { sessionStorage.setItem('wlad_starter_prompt', prompt); }
    catch (e) { /* sessionStorage may be blocked */ }
    navigate('/chat');
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto pb-16 px-4 md:px-6 cascade space-y-10">

        {/* ── HERO ─ Booking-First Landing Section ──────────────────────── */}
        <section
          className="relative overflow-hidden rounded-[28px] border border-border"
          style={{
            background:
              'radial-gradient(circle at 0% 0%, rgba(191,255,0,0.18) 0%, transparent 45%), ' +
              'radial-gradient(circle at 100% 100%, rgba(0,170,255,0.12) 0%, transparent 50%), ' +
              'hsl(var(--card))',
          }}
        >
          {/* Aurora orbs */}
          <div aria-hidden className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand/15 blur-[120px]" />
          <div aria-hidden className="absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-sky-500/10 blur-[140px]" />

          <div className="relative p-8 md:p-12 lg:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Library size={13} className="text-brand" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-black text-brand">
                    Leader-OS · Wlad-Universum
                  </span>
                </div>

                <h1
                  className="text-[34px] md:text-[52px] lg:text-[62px] font-black text-foreground leading-[0.95] mb-5"
                  style={{ ...OUTFIT, letterSpacing: '-0.035em' }}
                >
                  Die staatlich zertifizierte
                  <br />
                  <span className="text-brand">Führungskräfte-Ausbildung.</span>
                </h1>

                <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed mb-7">
                  6 Monate · 5 Rollen · Live-Coachings + WladBot 24/7. Trainiert von Wlad
                  Jachtchenko — 400.000 Kunden in 20+ Ländern, 12 Bücher, 3 SPIEGEL-Bestseller.
                </p>

                <div className="flex flex-wrap gap-3">
                  <BookConsultationButton
                    label="Kostenloses Beratungsgespräch buchen"
                    size="lg"
                    className="text-[13px] h-12 px-6"
                    testId="hero-book-cta"
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleTrain('Stell mir 3 Fragen, mit denen WladBot meinen aktuellen Leadership-Status diagnostiziert. Dann gib mir den ersten konkreten Trainings-Schritt.')}
                    className="h-12 px-6 text-[13px] font-semibold border-border bg-foreground/[0.02] hover:bg-foreground/[0.06] btn-revolut"
                    data-testid="hero-chat-cta"
                  >
                    <Sparkles size={13} className="mr-2" /> Erst mit WladBot starten
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-6 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-brand" /> Unverbindlich</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-brand" /> ZFU-zertifiziert</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-brand" /> Persönlich · 1:1</span>
                </div>
              </div>

              {/* Stat-Cluster as proof anchor */}
              <div className="rounded-2xl border border-border bg-background/40 backdrop-blur-xl p-2 grid grid-cols-2 gap-1" data-testid="wlad-stats-strip">
                {WLAD_STATS.map((s) => (
                  <div key={s.label} className="rounded-xl bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors">
                    <StatTile {...s} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 5 ROLLEN ──────────────────────────────────────────────────── */}
        <section data-testid="wlad-5-rollen">
          <SectionEyebrow icon={Target} label="Kern-Framework · 5 Rollen" />
          <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
            <div>
              <h2 className="text-2xl md:text-[34px] font-black text-foreground leading-tight"
                  style={{ ...OUTFIT, letterSpacing: '-0.025em' }}>
                Die 5 Rollen einer Führungskraft
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
                Jede Rolle ist eine Disziplin. Jede Disziplin ist trainierbar mit WladBot.
              </p>
            </div>
            <BookConsultationButton
              variant="ghost"
              label="Welche Rolle passt zu dir?"
              size="sm"
              icon={false}
              className="text-[12px] h-9"
              testId="roles-book-cta"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {WLAD_5_ROLES.map((r, i) => (
              <RoleCard key={r.id} role={r} index={i} onTrain={handleTrain} />
            ))}
          </div>
        </section>

        {/* ── 13 TOPICS · 3 Säulen ──────────────────────────────────────── */}
        <section className="space-y-7" data-testid="wlad-13-topics">
          <div>
            <SectionEyebrow icon={Sparkles} label="Keynote-Methodik · 13 Themen" />
            <h2 className="text-2xl md:text-[34px] font-black text-foreground leading-tight"
                style={{ ...OUTFIT, letterSpacing: '-0.025em' }}>
              13 Themen · 3 Säulen
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Wlads offizielle Trainings-Taxonomie. Klick → Starter-Prompt im Chat.
            </p>
          </div>
          {WLAD_TOPIC_PILLARS.map((p) => (
            <PillarBlock key={p.id} pillar={p} onTrain={handleTrain} />
          ))}
        </section>

        {/* ── AUSBILDUNG ────────────────────────────────────────────────── */}
        <section
          data-testid="wlad-ausbildung"
          className="rounded-[28px] border border-border overflow-hidden relative"
          style={{
            background:
              'radial-gradient(circle at 100% 0%, rgba(191,255,0,0.12), transparent 50%), ' +
              'hsl(var(--card))',
          }}
        >
          <div aria-hidden className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-brand/10 blur-[100px]" />
          <div className="relative p-7 md:p-10">
            <SectionEyebrow icon={GraduationCap} label="Tiefer einsteigen · 6 Monate" />
            <h2 className="text-2xl md:text-[34px] font-black text-foreground leading-tight"
                style={{ ...OUTFIT, letterSpacing: '-0.025em' }}>
              {WLAD_AUSBILDUNG.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{WLAD_AUSBILDUNG.subtitle}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-8">
              <div>
                <h4 className="text-[10px] uppercase tracking-wider font-black text-muted-foreground mb-3">Format</h4>
                <ul className="space-y-3">
                  {WLAD_AUSBILDUNG.format.map((f) => (
                    <li key={f.title} className="flex gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-foreground">{f.title}</div>
                        <div className="text-[12px] text-muted-foreground">{f.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-wider font-black text-muted-foreground mb-3">Outcomes</h4>
                <ul className="space-y-3">
                  {WLAD_AUSBILDUNG.outcomes.map((o) => (
                    <li key={o} className="flex gap-3">
                      <Award size={13} className="text-brand mt-0.5 shrink-0" />
                      <span className="text-sm text-foreground/85">{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <BookConsultationButton
                size="lg"
                label="Beratungsgespräch buchen"
                className="h-12 px-6 text-[13px]"
                testId="ausbildung-book-cta"
              />
              <Button
                variant="outline"
                onClick={() => handleTrain('Erkläre mir die staatlich zertifizierte 6-Monats-Führungskräfte-Ausbildung von Wlad. Was würdest du mir nach meiner aktuellen Situation als Erstes raten?')}
                className="h-12 px-6 text-[13px] font-semibold border-border bg-foreground/[0.02] hover:bg-foreground/[0.06] btn-revolut"
                data-testid="ausbildung-chat-cta"
              >
                <Sparkles size={13} className="mr-2" /> Mit WladBot besprechen
              </Button>
            </div>
          </div>
        </section>

        {/* ── BOOKS · PODCAST · MASTERCLASS ─────────────────────────────── */}
        <section data-testid="wlad-resources">
          <SectionEyebrow icon={BookOpen} label="Originalquellen" />
          <h2 className="text-2xl md:text-[34px] font-black text-foreground leading-tight mb-5"
              style={{ ...OUTFIT, letterSpacing: '-0.025em' }}>
            Bücher · Podcast · Masterclass
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {WLAD_BOOKS.map((b) => (
              <a
                key={b.id}
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`book-card-${b.id}`}
                className="block card-revolut p-5 group"
              >
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <BookOpen size={16} className="text-brand" />
                  <ExternalLink size={11} className="text-muted-foreground/40 group-hover:text-brand transition-colors" />
                </div>
                <h3 className="font-black text-foreground text-base leading-tight" style={OUTFIT}>
                  „{b.title}"
                </h3>
                <p className="text-[12px] text-muted-foreground mt-1.5 leading-relaxed">{b.subtitle}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-black mt-3">
                  {b.publisher}
                </p>
              </a>
            ))}

            <a
              href={WLAD_PODCAST.url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="podcast-card"
              className="block card-revolut p-5 group"
            >
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <Mic2 size={16} className="text-brand" />
                <ExternalLink size={11} className="text-muted-foreground/40 group-hover:text-brand transition-colors" />
              </div>
              <h3 className="font-black text-foreground text-base" style={OUTFIT}>„{WLAD_PODCAST.title}"</h3>
              <p className="text-[12px] text-muted-foreground mt-1.5">{WLAD_PODCAST.subtitle}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-black mt-3">Podcast (DE)</p>
            </a>

            <a
              href={WLAD_MASTERCLASS.url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="masterclass-card"
              className="block card-revolut p-5 group"
            >
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <TrendingUp size={16} className="text-brand" />
                <ExternalLink size={11} className="text-muted-foreground/40 group-hover:text-brand transition-colors" />
              </div>
              <h3 className="font-black text-foreground text-base" style={OUTFIT}>{WLAD_MASTERCLASS.title}</h3>
              <p className="text-[12px] text-muted-foreground mt-1.5">{WLAD_MASTERCLASS.subtitle}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-black mt-3">
                1.100+ Videos · VR Training
              </p>
            </a>
          </div>
        </section>

        {/* ── CLOSER CTA ─────────────────────────────────────────────────── */}
        <section
          data-testid="community-cta"
          className="rounded-[28px] border border-border p-8 md:p-12 text-center relative overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(191,255,0,0.10), transparent 55%), ' +
              'hsl(var(--card))',
          }}
        >
          <div aria-hidden className="absolute -top-20 left-1/2 -translate-x-1/2 h-64 w-[480px] rounded-full bg-brand/10 blur-[120px]" />
          <div className="relative">
            <Users size={28} className="text-brand mx-auto mb-4" />
            <h3 className="text-2xl md:text-[36px] font-black text-foreground leading-tight max-w-3xl mx-auto"
                style={{ ...OUTFIT, letterSpacing: '-0.025em' }}>
              In 6 Monaten kann sich alles verändern.
            </h3>
            <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-xl mx-auto">
              Oder du machst es weiter wie bisher. Beides hat einen Preis. Sprich mit unseren
              Beratern und finde heraus, welcher Pfad zu dir passt.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-7">
              <BookConsultationButton
                size="lg"
                label="Jetzt unverbindliches Beratungsgespräch buchen"
                className="h-12 px-7 text-[13px]"
                testId="closer-book-cta"
              />
              <Button
                variant="outline"
                onClick={() => handleTrain('Erstelle mir einen 30-Tage-Trainingsplan basierend auf den 5 Wlad-Rollen. Frag mich, welche Rolle aktuell meine größte Schwäche ist.')}
                className="h-12 px-6 text-[13px] font-semibold border-border bg-foreground/[0.02] hover:bg-foreground/[0.06] btn-revolut"
                data-testid="closer-chat-cta"
              >
                <Sparkles size={13} className="mr-2" /> 30-Tage-Plan mit WladBot
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-7 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar size={11} className="text-brand" /> 30 Min · Online</span>
              <span className="flex items-center gap-1.5"><Headphones size={11} className="text-brand" /> 1:1 mit Berater:in</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-brand" /> Kostenfrei · Unverbindlich</span>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
