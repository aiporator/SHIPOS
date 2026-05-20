/**
 * Motion system — single source of truth for animations across Leader-OS.
 *
 * Wraps GSAP + @gsap/react with Leader-OS conventions:
 *  - prefers-reduced-motion is honored everywhere (we return a no-op timeline)
 *  - ScrollTrigger is registered once, lazily
 *  - all timelines use eased, premium-feeling defaults
 *
 * Usage:
 *   const containerRef = useRef(null);
 *   useMotion(containerRef, ({ tl, gsap, q }) => {
 *     tl.from(q('[data-anim="hero"]'), { y: 24, opacity: 0, duration: 0.6 });
 *   });
 *
 * The `q(selector)` helper is scoped to the containerRef so animations don't
 * leak across the page.
 */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let _registered = false;
const registerOnce = () => {
  if (_registered || typeof window === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // Premium-feeling defaults across the whole app
  gsap.defaults({ ease: 'power3.out', duration: 0.7 });
  _registered = true;
};

export const prefersReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Scoped motion hook. Calls `setup({ tl, gsap, q, ScrollTrigger })` once after
 * mount; cleans up automatically. If the user prefers reduced motion, the
 * setup callback is NOT invoked and elements stay in their final layout.
 */
export const useMotion = (scopeRef, setup, deps = []) => {
  registerOnce();
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    if (!scopeRef?.current) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      const q = gsap.utils.selector(scopeRef);
      try { setup({ tl, gsap, q, ScrollTrigger }); } catch { /* dev guardrail */ }
    }, scopeRef);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, { scope: scopeRef, dependencies: deps });
};

/**
 * Lightweight ref-based mount animation. Drop on any element for a clean
 * entrance with no boilerplate.
 *
 *   <div ref={useEntrance({ y: 20, delay: 0.1 })}>...</div>
 */
export const useEntrance = ({ y = 16, opacity = 0, delay = 0, duration = 0.65 } = {}) => {
  registerOnce();
  const ref = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion() || !ref.current) return;
    const anim = gsap.from(ref.current, { y, opacity, delay, duration, ease: 'power3.out' });
    return () => { try { anim.kill(); } catch { /* ignore */ } };
  }, [y, opacity, delay, duration]);
  return ref;
};

export { gsap, ScrollTrigger, useGSAP };
