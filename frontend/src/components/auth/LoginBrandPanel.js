import { WladMark } from '../brand/WladMark';

/**
 * LoginBrandPanel — linke Hälfte der Login-Page, Nike Athletic-Editorial-DNA.
 *
 * Schwarzer Block mit massiver Outfit-Italic-Headline, Lime-Akzent,
 * Liste der Benefits als Mono-eyebrow + Body. 8px-Schritt rhythmus,
 * keine Gradients, keine Aurora-Soup.
 */
export const LoginBrandPanel = ({ features, de }) => {
  return (
    <div
      data-testid="login-brand-panel"
      className="hidden lg:flex lg:w-[48%] relative overflow-hidden bg-black text-white"
    >
      {/* Dezenter Lime-Glow rechts unten — einziger chromatischer Moment */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -bottom-32 -right-32 h-[26rem] w-[26rem] rounded-full bg-brand/[0.20] blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col justify-between p-12 xl:p-20 w-full">
        <div>
          <div className="flex items-center gap-3 mb-16 xl:mb-20">
            <WladMark size={40} animated />
            <div className="flex flex-col leading-none">
              <span
                className="font-black text-[20px] tracking-tight text-white"
                style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.025em' }}
              >
                Leader<span className="text-brand mx-0.5">·</span>OS
              </span>
              <span className="text-[8.5px] tracking-[0.28em] uppercase font-bold text-brand mt-1.5 font-mono">
                ▸ Powered by WladBot
              </span>
            </div>
          </div>

          {/* Eyebrow */}
          <p className="text-[10.5px] font-bold uppercase tracking-[0.28em] text-brand mb-6 font-mono">
            ▸ MANIFEST · LEADER-OS
          </p>

          {/* Nike-style massive uppercase headline */}
          <h1
            className="leading-[0.88] tracking-[-0.04em] text-white mb-12"
            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(48px, 5vw, 80px)' }}
          >
            {de ? (
              <>
                Die Zukunft<br />
                <span className="text-white/55">gehört</span><br />
                <span className="text-brand not-italic">KI-Nativen</span>
                <span className="text-brand not-italic">.</span>
              </>
            ) : (
              <>
                The future<br />
                <span className="text-white/55">belongs to</span><br />
                <span className="text-brand not-italic">AI-Natives</span>
                <span className="text-brand not-italic">.</span>
              </>
            )}
          </h1>

          {/* Benefit-Liste als typographische Spec-Tabelle, kein Icon-Soup */}
          <ul className="space-y-5 mt-12 cascade border-t-2 border-white/15 pt-8">
            {features.map((item, i) => (
              <li key={item.t} className="grid grid-cols-12 gap-3 items-start">
                <span className="col-span-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand font-mono pt-0.5">
                  §{String(i + 1).padStart(2, '0')}
                </span>
                <div className="col-span-11">
                  <p className="text-[15px] font-bold text-white leading-[1.3]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {item.t}
                  </p>
                  <p className="text-[12.5px] text-white/55 mt-1 leading-[1.4]">{item.s}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 pt-8 border-t-2 border-white/15">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-white/55 font-mono">
            ▸ 2 500+ FÜHRUNGSKRÄFTE · STARTUPS BIS DAX
          </p>
        </div>
      </div>
    </div>
  );
};
