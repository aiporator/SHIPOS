/**
 * TrackFieldVisual — Pure SVG-Illustration einer Tartan-Bahn.
 *
 * Konzept: 5 Lauf-Bahnen, 5 Pixel-Figuren auf den Bahnen.
 * Vier davon sind Anzugträger (graue Silhouetten, gehen langsam),
 * eine ist im T-Shirt (helle Silhouette mit Lime-Aura, vorneweg).
 * Über dem T-Shirt-Läufer steht "MIT WLADBOT". Die anderen sind
 * deutlich zurück.
 *
 * Pure SVG — keine externen Assets, scharf bei jeder Auflösung.
 * Wird im LandingPage Hero (oder dedizierter Section) gerendert.
 */

export const TrackFieldVisual = ({ className = '' }) => (
  <svg
    viewBox="0 0 800 320"
    aria-label="Wer KI-nativ wird, läuft vorneweg"
    className={`w-full h-auto ${className}`}
    role="img"
  >
    {/* Bahn-Hintergrund — kalter Beton-Asphalt */}
    <rect width="800" height="320" fill="#F5F5F2" />

    {/* Inner field (Lime patch) */}
    <rect x="80" y="240" width="640" height="60" fill="#16632B" opacity="0.1" />

    {/* 5 Bahnen mit Mittel-Linien */}
    {[60, 100, 140, 180, 220].map((y, i) => (
      <g key={i}>
        {/* Bahn-Boden */}
        <rect x="40" y={y - 18} width="720" height="36" fill={i === 4 ? '#D4493C' : '#C53A2E'} opacity={i === 4 ? 0.9 : 0.65} />
        {/* Mittel-Linie */}
        <line x1="40" y1={y} x2="760" y2={y} stroke="#FFFFFF" strokeWidth="1" strokeDasharray="8 6" opacity="0.55" />
        {/* Bahn-Nummer rechts */}
        <text
          x="775"
          y={y + 4}
          fill="#FFFFFF"
          opacity="0.6"
          fontSize="9"
          fontWeight="700"
          textAnchor="end"
          style={{ fontFamily: 'monospace', letterSpacing: '0.15em' }}
        >
          {String(i + 1).padStart(2, '0')}
        </text>
      </g>
    ))}

    {/* Start-Linie */}
    <line x1="80" y1="40" x2="80" y2="240" stroke="#FFFFFF" strokeWidth="3" />
    {/* Ziel-Linie */}
    <line x1="720" y1="40" x2="720" y2="240" stroke="#FFFFFF" strokeWidth="3" />
    <text x="720" y="32" fill="#0A0A0A" fontSize="10" fontWeight="900" textAnchor="middle" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '0.18em' }}>
      ZIEL
    </text>

    {/* Anzug-Träger auf Bahnen 1-4, weit hinten (am Anfang der Strecke) */}
    {[60, 100, 140, 180].map((y, i) => (
      <g key={`suit-${i}`} transform={`translate(${150 + i * 18}, ${y - 14})`}>
        {/* Kopf */}
        <rect x="6" y="0" width="6" height="6" fill="#C4A382" />
        {/* Hair */}
        <rect x="6" y="0" width="6" height="2" fill="#3A2418" />
        {/* Anzug-Körper schwarz */}
        <rect x="4" y="6" width="10" height="14" fill="#1A1A1A" />
        {/* Anzug-Lapels heller */}
        <rect x="4" y="6" width="2" height="6" fill="#2A2A2A" />
        <rect x="12" y="6" width="2" height="6" fill="#2A2A2A" />
        {/* Schlips */}
        <rect x="8" y="8" width="2" height="6" fill="#5B0E0E" />
        {/* Beine */}
        <rect x="5" y="20" width="3" height="8" fill="#1A1A1A" />
        <rect x="10" y="20" width="3" height="8" fill="#1A1A1A" />
        {/* Schuhe */}
        <rect x="5" y="28" width="3" height="2" fill="#000" />
        <rect x="10" y="28" width="3" height="2" fill="#000" />

        {/* Speed-lines hinter ihm (klein — er ist langsam) */}
        <line x1="-2" y1="14" x2="2" y2="14" stroke="#0A0A0A" strokeWidth="0.8" opacity="0.3" />
        <line x1="-2" y1="18" x2="0" y2="18" stroke="#0A0A0A" strokeWidth="0.8" opacity="0.2" />
      </g>
    ))}

    {/* T-Shirt Läufer auf Bahn 5 — WEIT VORNE, fast am Ziel */}
    <g transform="translate(640, 226)">
      {/* Lime Aura */}
      <ellipse cx="9" cy="14" rx="20" ry="22" fill="#BFFF00" opacity="0.35" />
      <ellipse cx="9" cy="14" rx="14" ry="16" fill="#BFFF00" opacity="0.55" />

      {/* Kopf */}
      <rect x="6" y="0" width="6" height="6" fill="#F2C8A4" />
      <rect x="6" y="0" width="6" height="2" fill="#3A2418" />

      {/* T-Shirt weiß */}
      <rect x="3" y="6" width="12" height="11" fill="#FFFFFF" />
      {/* Lime Brust-Akzent */}
      <rect x="7" y="9" width="4" height="2" fill="#BFFF00" />

      {/* Arme — eine angewinkelt nach hinten, eine nach vorne (Lauf-Pose) */}
      <rect x="-1" y="8" width="3" height="6" fill="#F2C8A4" transform="rotate(-25 0.5 11)" />
      <rect x="16" y="6" width="3" height="6" fill="#F2C8A4" transform="rotate(35 17.5 9)" />

      {/* Beine — Lauf-Pose */}
      <rect x="4" y="17" width="3" height="9" fill="#1A4A5A" transform="rotate(20 5.5 22)" />
      <rect x="11" y="17" width="3" height="9" fill="#1A4A5A" transform="rotate(-30 12.5 22)" />
      {/* Schuhe Lime */}
      <rect x="2" y="26" width="4" height="2" fill="#BFFF00" />
      <rect x="13" y="26" width="4" height="2" fill="#BFFF00" />

      {/* Heavy speed-lines */}
      <line x1="-10" y1="10" x2="0" y2="10" stroke="#BFFF00" strokeWidth="2" />
      <line x1="-15" y1="14" x2="-2" y2="14" stroke="#BFFF00" strokeWidth="2" />
      <line x1="-10" y1="18" x2="0" y2="18" stroke="#BFFF00" strokeWidth="2" />
      <line x1="-8" y1="22" x2="-1" y2="22" stroke="#0A0A0A" strokeWidth="1.5" opacity="0.6" />

      {/* Label "MIT WLADBOT" */}
      <g transform="translate(-25, -34)">
        <rect x="0" y="0" width="72" height="22" fill="#0A0A0A" />
        <rect x="0" y="0" width="6" height="22" fill="#BFFF00" />
        <text
          x="36"
          y="14"
          fill="#FFFFFF"
          fontSize="10"
          fontWeight="900"
          textAnchor="middle"
          style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '0.18em' }}
        >
          MIT WLADBOT
        </text>
        {/* Pfeil zum Läufer */}
        <polygon points="34,22 38,22 36,28" fill="#0A0A0A" />
      </g>
    </g>

    {/* Wettkampf-Eyebrow oben */}
    <text x="50" y="20" fill="#0A0A0A" fontSize="9" fontWeight="700" style={{ fontFamily: 'monospace', letterSpacing: '0.22em' }}>
      ▸ 100-METER · KI-NATIVE LEADERSHIP
    </text>

    {/* Footer-Tag bottom-left */}
    <text x="50" y="305" fill="#0A0A0A" fontSize="8" fontWeight="700" opacity="0.55" style={{ fontFamily: 'monospace', letterSpacing: '0.22em' }}>
      LEADER-OS · STADIUM
    </text>
    <text x="750" y="305" fill="#0A0A0A" fontSize="8" fontWeight="700" textAnchor="end" opacity="0.55" style={{ fontFamily: 'monospace', letterSpacing: '0.22em' }}>
      BIB · 0001
    </text>
  </svg>
);

export const TrackFieldSection = () => (
  <section
    className="bg-[#FAFAF7] border-y-2 border-black"
    aria-label="100 Meter KI-Native Leadership"
  >
    <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-16 md:py-24 grid md:grid-cols-12 gap-10 items-center">
      <div className="md:col-span-5">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand-strong mb-4 font-mono">
          ▸ DAS RENNEN HAT ANGEFANGEN
        </p>
        <h2
          className="text-[44px] sm:text-[64px] md:text-[84px] leading-[0.92] tracking-[-0.04em] text-black"
          style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
        >
          Wer KI-nativ wird,<br />
          <span className="text-black/55">läuft vorneweg</span>
          <span className="text-brand">.</span>
        </h2>
        <p className="mt-7 max-w-md text-[15px] md:text-[16px] leading-[1.6] text-black/70">
          Während die anderen noch im Anzug am Start stehen,
          ist die KI-native Führungskraft schon am Ziel. Kein
          Wunderwerk — nur die richtigen Werkzeuge, das richtige
          Mindset und ein Coach der mitläuft.
        </p>
      </div>
      <div className="md:col-span-7 border-2 border-black bg-white p-3 md:p-5 shadow-[8px_8px_0_0_#000]">
        <TrackFieldVisual />
      </div>
    </div>
  </section>
);
