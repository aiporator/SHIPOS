/**
 * PageTransition — drop-in route transition wrapper.
 *
 * Uses GSAP to play a fade+rise on every route change. Respects
 * prefers-reduced-motion (becomes a no-op pass-through).
 *
 * Wrap <Routes> children, or wrap individual route elements:
 *   <Route path="/dashboard" element={<PageTransition><DashboardPage /></PageTransition>} />
 *
 * Or globally in App.js by wrapping the entire <Routes> output:
 *   <PageTransition key={location.pathname}>{children}</PageTransition>
 *
 * The `key={location.pathname}` forces React to unmount+remount on every
 * route change, so the GSAP `from` animation re-plays cleanly.
 */
import { useRef, useEffect } from 'react';
import { gsap, prefersReducedMotion } from '../../hooks/useMotion';

export const PageTransition = ({ children, mode = 'rise' }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion() || !ref.current) return;
    const el = ref.current;

    const presets = {
      rise:  { y: 16, opacity: 0, duration: 0.55, ease: 'power3.out' },
      slide: { x: 24, opacity: 0, duration: 0.55, ease: 'power3.out' },
      scale: { opacity: 0, scale: 0.985, duration: 0.55, ease: 'power3.out' },
    };

    const anim = gsap.from(el, presets[mode] || presets.rise);
    return () => { try { anim.kill(); } catch { /* ignore */ } };
  }, [mode]);

  return (
    <div ref={ref} data-page-transition data-mode={mode} style={{ willChange: 'transform, opacity' }}>
      {children}
    </div>
  );
};
