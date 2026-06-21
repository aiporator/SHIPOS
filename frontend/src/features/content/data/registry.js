/**
 * Article registry — the single source of truth for all published
 * content. Static imports (no dynamic `import('./articles/' + slug)`)
 * because dynamic imports with computed paths are awkward with CRA's
 * webpack and break bundler-side static analysis.
 *
 * To add an article: import it here, add to ARTICLES, done. The
 * registry order is the default chronological list (newest first
 * after the sort below). Filtering happens via `listArticles({...})`.
 */
import warumFrameworksNichtImKopfBleiben from './articles/warum-frameworks-nicht-im-kopf-bleiben';
import sprintOderMarathon from './articles/sprint-oder-marathon';
import dieFeedbackFormelBww from './articles/die-feedback-formel-bww';
import wieLenaIhrTownhallDrehte from './articles/wie-lena-ihr-townhall-drehte';
import deinKalenderFuehrtDich from './articles/dein-kalender-fuehrt-dich';
import kiImFuehrungsAlltagDreiUseCases from './articles/ki-im-fuehrungs-alltag-drei-use-cases';
import chatgptAlsSparringPartnerFuenfSkripte from './articles/chatgpt-als-sparring-partner-fuenf-skripte';
import warumLeaderOs from './articles/warum-leader-os';
import wasInLeaderOsDrinIst from './articles/was-in-leader-os-drin-ist';
import deinErsterTagMitLeaderOs from './articles/dein-erster-tag-mit-leader-os';
import wladbotVsChatgptVsCoach from './articles/wladbot-vs-chatgpt-vs-coach';
import leaderOsFuerEngineeringLeitung from './articles/leader-os-fuer-engineering-leitung';
import leaderOsFuerHrUndPeopleOps from './articles/leader-os-fuer-hr-und-people-ops';
import leaderOsFuerScaleupGruender from './articles/leader-os-fuer-scaleup-gruender';
import leaderOsImTeamRollout from './articles/leader-os-im-team-rollout';
import derBusinessCaseFuerLeaderOs from './articles/der-business-case-fuer-leader-os';
import leaderOsVsKlassischesCoaching from './articles/leader-os-vs-klassisches-coaching';
import kiLeadershipWasBedeutetDasKonkret from './articles/ki-leadership-was-bedeutet-das-konkret';
import mitarbeitergespraechVorbereitenMitKi from './articles/mitarbeitergespraech-vorbereiten-mit-ki';
import feedbackGebenVorlageBwwFramework from './articles/feedback-geben-vorlage-bww-framework';
import townhallRedeStrukturierenSexier from './articles/townhall-rede-strukturieren-sexier';
import harvardVerhandlungsmethodeErklaert from './articles/harvard-verhandlungsmethode-erklaert';
import schulzVonThunKommunikationsquadratFuerFuehrungskraefte from './articles/schulz-von-thun-kommunikationsquadrat-fuer-fuehrungskraefte';
import alpenMethodeFuerFuehrungskraefte from './articles/alpen-methode-fuer-fuehrungskraefte';
import fuenfRollenDerFuehrungNachWladJachtchenko from './articles/5-rollen-der-fuehrung-nach-wlad-jachtchenko';
import dreiSaeulenDerUeberzeugungLogosEthosPathos from './articles/drei-saeulen-der-ueberzeugung-logos-ethos-pathos';
import vierFarbenModellPersonalities from './articles/vier-farben-modell-personalities';
import dunkleRhetorikErkennenUndAbwehren from './articles/dunkle-rhetorik-erkennen-und-abwehren';
import konfliktgespraechFuehrenSkript from './articles/konfliktgespraech-fuehren-skript';
import kuendigungsgespraechRichtigFuehren from './articles/kuendigungsgespraech-richtig-fuehren';
import gehaltsgespraechVorbereitenSkript from './articles/gehaltsgespraech-vorbereiten-skript';
import schlagfertigkeitLernenAlsFuehrungskraft from './articles/schlagfertigkeit-lernen-als-fuehrungskraft';
import zehnStufenDesZuhoerens from './articles/zehn-stufen-des-zuhoerens';
import promptEngineeringFuerFuehrungskraefte from './articles/prompt-engineering-fuer-fuehrungskraefte';
import kiToolsFuerFuehrungskraefte2026 from './articles/ki-tools-fuer-fuehrungskraefte-2026';
import leaderOsFuerMittelstandCeo from './articles/leader-os-fuer-mittelstand-ceo';
import leaderOsFuerCtoUndTechVorstand from './articles/leader-os-fuer-cto-und-tech-vorstand';
import leaderOsFuerVertriebsleitung from './articles/leader-os-fuer-vertriebsleitung';
import leaderOsFuerNeuBefoerderteLeads from './articles/leader-os-fuer-neu-befoerderte-leads';
import kiStrategieFuerMittelstand from './articles/ki-strategie-fuer-mittelstand';
import erste100TageAlsCtoOderVpEngineering from './articles/erste-100-tage-als-cto-oder-vp-engineering';
import kiCoachingVsTraditionellesCoachingDach from './articles/ki-coaching-vs-traditionelles-coaching-dach';
// +20 KI-Paradox & System bucket
import dasKiProduktivitaetsParadox from './articles/das-ki-produktivitaets-paradox';
import warumDeinChatgptTabDichNichtEffizienterMacht from './articles/warum-dein-chatgpt-tab-dich-nicht-effizienter-macht';
import wennDeineKiInvestitionVersickertFuenfDiagnoseFragen from './articles/wenn-deine-ki-investition-versickert-fuenf-diagnose-fragen';
import kiToolMuedigkeitWasZuTunIst from './articles/ki-tool-muedigkeit-was-zu-tun-ist';
import outputMessenImKiZeitalter from './articles/output-messen-im-ki-zeitalter';
import warum90ProzentAllerKiTrainingsScheitern from './articles/warum-90-prozent-aller-ki-trainings-scheitern';
import dasSystemHinterDemSystem from './articles/das-system-hinter-dem-system';
import damitEsJederSchafftDieZugaenglichkeitsPhilosophie from './articles/damit-es-jeder-schafft-die-zugaenglichkeits-philosophie';
import mikroDrillsFuenfzehnMinutenProTag from './articles/mikro-drills-fuenfzehn-minuten-pro-tag';
import dieLeaderOsKursArchitektur from './articles/die-leader-os-kurs-architektur';
import mehrAlsEineTransformation from './articles/mehr-als-eine-transformation';
import kiWissenVsKiReflex from './articles/ki-wissen-vs-ki-reflex';
import vomEinzelErfolgZumTeamSystem from './articles/vom-einzel-erfolg-zum-team-system';
import wennKiDichVerlangsamt from './articles/wenn-ki-dich-verlangsamt';
import derLernpfadVomKiNutzerZumKiLeader from './articles/der-lernpfad-vom-ki-nutzer-zum-ki-leader';
import systemStattTransformationDerKleineHebel from './articles/system-statt-transformation-der-kleine-hebel';
import dreiRitualeDieKiInvestmentsRentabelMachen from './articles/drei-rituale-die-ki-investments-rentabel-machen';
import dieKursBibliothekStrukturiertePfadeDurchLeaderOs from './articles/die-kurs-bibliothek-strukturierte-pfade-durch-leader-os';
import vomPowerUserZumMultiplikator from './articles/vom-power-user-zum-multiplikator';
import kiInZehnMinutenProTag from './articles/ki-in-zehn-minuten-pro-tag';
import kiOhneMethodikIstSlop from './articles/ki-ohne-methodik-ist-slop';
import derKiSprintWasDreissigTageStrukturierteAnwendungVeraendern from './articles/der-ki-sprint-was-dreissig-tage-strukturierte-anwendung-veraendern';
import fuerJedenMitarbeiterNichtNurFuerFuehrungskraefte from './articles/fuer-jeden-mitarbeiter-nicht-nur-fuer-fuehrungskraefte';
import dasVersprechenUndDieGrenzen from './articles/das-versprechen-und-die-grenzen';
import die5RollenEinerKiNativenFuehrungskraft from './articles/die-5-rollen-einer-ki-nativen-fuehrungskraft';
import in6MonatenZurKiNativenFuehrungskraft from './articles/in-6-monaten-zur-ki-nativen-fuehrungskraft';
import schlagfertigkeitImKiZeitalter from './articles/schlagfertigkeit-im-ki-zeitalter';

const ARTICLES = [
  // Brand-new KI-Voice articles (Wlad x KI, signature launch posts).
  die5RollenEinerKiNativenFuehrungskraft,
  in6MonatenZurKiNativenFuehrungskraft,
  schlagfertigkeitImKiZeitalter,

  // KI-Paradox & der Hebel-Effekt (Top bucket — diagnostic + solution + accessibility)
  dasKiProduktivitaetsParadox,
  warumDeinChatgptTabDichNichtEffizienterMacht,
  wennDeineKiInvestitionVersickertFuenfDiagnoseFragen,
  kiToolMuedigkeitWasZuTunIst,
  outputMessenImKiZeitalter,
  wennKiDichVerlangsamt,
  warum90ProzentAllerKiTrainingsScheitern,
  kiOhneMethodikIstSlop,
  kiWissenVsKiReflex,
  dasSystemHinterDemSystem,
  damitEsJederSchafftDieZugaenglichkeitsPhilosophie,
  mehrAlsEineTransformation,
  systemStattTransformationDerKleineHebel,
  dreiRitualeDieKiInvestmentsRentabelMachen,
  derLernpfadVomKiNutzerZumKiLeader,
  mikroDrillsFuenfzehnMinutenProTag,
  kiInZehnMinutenProTag,
  fuerJedenMitarbeiterNichtNurFuerFuehrungskraefte,
  vomEinzelErfolgZumTeamSystem,
  vomPowerUserZumMultiplikator,
  dieLeaderOsKursArchitektur,
  dieKursBibliothekStrukturiertePfadeDurchLeaderOs,
  derKiSprintWasDreissigTageStrukturierteAnwendungVeraendern,
  dasVersprechenUndDieGrenzen,

  // Plattform-Hub: Why / What / Use-Cases for Leader-OS
  warumLeaderOs,
  wasInLeaderOsDrinIst,
  deinErsterTagMitLeaderOs,
  wladbotVsChatgptVsCoach,
  leaderOsFuerEngineeringLeitung,
  leaderOsFuerHrUndPeopleOps,
  leaderOsFuerScaleupGruender,
  leaderOsImTeamRollout,
  derBusinessCaseFuerLeaderOs,
  leaderOsVsKlassischesCoaching,
  leaderOsFuerMittelstandCeo,
  leaderOsFuerCtoUndTechVorstand,
  leaderOsFuerVertriebsleitung,
  leaderOsFuerNeuBefoerderteLeads,

  // Methodik + KI-Wissens-Hub
  warumFrameworksNichtImKopfBleiben,
  sprintOderMarathon,
  dieFeedbackFormelBww,
  wieLenaIhrTownhallDrehte,
  deinKalenderFuehrtDich,
  kiImFuehrungsAlltagDreiUseCases,
  chatgptAlsSparringPartnerFuenfSkripte,
  kiLeadershipWasBedeutetDasKonkret,
  kiToolsFuerFuehrungskraefte2026,
  kiStrategieFuerMittelstand,
  promptEngineeringFuerFuehrungskraefte,
  kiCoachingVsTraditionellesCoachingDach,
  mitarbeitergespraechVorbereitenMitKi,
  feedbackGebenVorlageBwwFramework,
  townhallRedeStrukturierenSexier,
  konfliktgespraechFuehrenSkript,
  kuendigungsgespraechRichtigFuehren,
  gehaltsgespraechVorbereitenSkript,
  schlagfertigkeitLernenAlsFuehrungskraft,
  dunkleRhetorikErkennenUndAbwehren,
  harvardVerhandlungsmethodeErklaert,
  schulzVonThunKommunikationsquadratFuerFuehrungskraefte,
  alpenMethodeFuerFuehrungskraefte,
  fuenfRollenDerFuehrungNachWladJachtchenko,
  dreiSaeulenDerUeberzeugungLogosEthosPathos,
  vierFarbenModellPersonalities,
  zehnStufenDesZuhoerens,
  erste100TageAlsCtoOderVpEngineering,
];

const BY_SLUG = new Map(ARTICLES.map((a) => [a.slug, a]));

/**
 * Get an article by slug. Returns null if missing or unpublished.
 */
export function getArticle(slug) {
  const found = BY_SLUG.get(slug);
  if (!found) return null;
  if (found.status && found.status !== 'published') return null;
  return found;
}

/**
 * List articles, newest first.
 *
 * @param {Object} [options]
 * @param {string} [options.type]   — filter by 'article' | 'guide' | 'field-note' | 'case-study'
 * @param {string} [options.tag]    — filter by tag (case-insensitive)
 * @param {string[]} [options.slugs]— preserve given order (used by RelatedArticles)
 * @param {number} [options.limit]
 */
export function listArticles(options = {}) {
  let out = ARTICLES.filter((a) => !a.status || a.status === 'published');

  if (options.type) {
    out = out.filter((a) => a.type === options.type);
  }
  if (options.tag) {
    const t = options.tag.toLowerCase();
    out = out.filter((a) => (a.tags ?? []).some((x) => x.toLowerCase() === t));
  }
  if (options.slugs) {
    const order = new Map(options.slugs.map((s, i) => [s, i]));
    out = out
      .filter((a) => order.has(a.slug))
      .sort((a, b) => order.get(a.slug) - order.get(b.slug));
  } else {
    out = [...out].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  }

  if (typeof options.limit === 'number') out = out.slice(0, options.limit);
  return out;
}

/**
 * The full set of unique tags across all published articles.
 */
export function listTags() {
  const set = new Set();
  for (const a of ARTICLES) {
    if (a.status && a.status !== 'published') continue;
    for (const t of a.tags ?? []) set.add(t);
  }
  return Array.from(set).sort();
}
