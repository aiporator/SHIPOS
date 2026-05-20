import { useRef } from 'react';
import { Zap, CheckCircle2 } from 'lucide-react';
import { useMotion } from '../../hooks/useMotion';

const BG_IMG = 'https://images.unsplash.com/photo-1633602114554-be8c2c5d6828?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80';

export const LoginBrandPanel = ({ features, de }) => {
  const rootRef = useRef(null);

  // Premium cinematic entrance: parallax bg → logo → headline (word-by-word) → features stagger → trust line
  useMotion(rootRef, ({ tl, gsap, q }) => {
    // 1. Background image gentle ken-burns + fade
    const bg = q('[data-anim="brand-bg"]')[0];
    if (bg) {
      gsap.fromTo(bg,
        { scale: 1.12, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.8, ease: 'power2.out' },
      );
    }

    // 2. Logo block
    tl.from(q('[data-anim="brand-logo"]'), { y: -20, opacity: 0, duration: 0.7, delay: 0.25 });

    // 3. Headline — split into 3 lines and stagger
    tl.from(q('[data-anim="brand-headline-line"]'), {
      y: 30, opacity: 0, duration: 0.85, stagger: 0.12, ease: 'expo.out',
    }, '-=0.35');

    // 4. Feature list cascade
    tl.from(q('[data-anim="brand-feature"]'), {
      x: -16, opacity: 0, duration: 0.55, stagger: 0.09, ease: 'power3.out',
    }, '-=0.5');

    // 5. Trust line
    tl.from(q('[data-anim="brand-trust"]'), { y: 12, opacity: 0, duration: 0.6 }, '-=0.2');

    // Continuous: super-subtle floating effect on the lime accent
    gsap.to(q('[data-anim="brand-accent"]'), {
      y: -3, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut',
    });
  }, []);

  return (
    <div ref={rootRef} data-testid="login-brand-panel" className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
      <div data-anim="brand-bg" className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BG_IMG})` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/95" />

      {/* Aurora gradient — adds depth motion */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 -left-20 h-[28rem] w-[28rem] rounded-full bg-[#BFFF00]/[0.07] blur-[120px] animate-[auroraFloat_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 -right-20 h-[24rem] w-[24rem] rounded-full bg-emerald-500/[0.04] blur-[110px] animate-[auroraFloat_12s_ease-in-out_infinite_reverse]" />
      </div>

      <div className="relative z-10 flex flex-col justify-between p-12 xl:p-20 w-full">
        <div>
          <div data-anim="brand-logo" className="flex items-center gap-2.5 mb-20">
            <div className="w-10 h-10 rounded-xl bg-[#BFFF00] flex items-center justify-center">
              <Zap size={20} className="text-[#0A0A0A]" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>WLADBOT</span>
          </div>

          <h1 className="text-4xl sm:text-5xl tracking-tighter leading-[1.08] text-white mb-8" style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
            {de ? (
              <>
                <span data-anim="brand-headline-line" className="block">Die Zukunft gehört</span>
                <span data-anim="brand-headline-line" className="block"><span data-anim="brand-accent" className="text-[#BFFF00] inline-block">KI-nativen</span></span>
                <span data-anim="brand-headline-line" className="block">Führungskräften.</span>
              </>
            ) : (
              <>
                <span data-anim="brand-headline-line" className="block">The future belongs to</span>
                <span data-anim="brand-headline-line" className="block"><span data-anim="brand-accent" className="text-[#BFFF00] inline-block">AI-native</span></span>
                <span data-anim="brand-headline-line" className="block">leaders.</span>
              </>
            )}
          </h1>

          <div className="space-y-5 mt-12">
            {features.map(item => (
              <div key={item.t} data-anim="brand-feature" className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-[#BFFF00] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white/80">{item.t}</p>
                  <p className="text-xs text-white/30 mt-0.5">{item.s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div data-anim="brand-trust" className="mt-16">
          <p className="text-[11px] text-white/15 tracking-wide">
            {de ? '2.500+ Führungskräfte — von Startups bis DAX.' : '2,500+ leaders — from startups to Fortune 500.'}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes auroraFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(20px, -30px) scale(1.08); }
        }
      `}</style>
    </div>
  );
};
