/**
 * MagneticCursor — premium custom cursor with magnetic snap to interactive elements.
 *
 * Behavior:
 *  - A small dot follows the actual cursor with very subtle lag (GSAP quickTo)
 *  - A larger outline ring follows with more lag — gives "trailing pen" feel
 *  - When hovering [data-magnetic], a button, or a link → outline grows + snaps to element center
 *  - When pressing mouse → quick scale punch
 *  - Native cursor stays visible on form inputs (so user can see text caret)
 *  - Disabled on touch devices + when prefers-reduced-motion
 *
 * Drop once in DashboardLayout (or App.js) — no per-component wiring needed.
 */
import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../../hooks/useMotion';

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], [data-magnetic], [data-testid$="-btn"]';
const TEXT_INPUT_SELECTOR = 'input, textarea, [contenteditable="true"]';

export const MagneticCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    // Skip on touch devices
    if (typeof window === 'undefined' || matchMedia('(pointer: coarse)').matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // High-perf position setters
    const dotX  = gsap.quickTo(dot,  'x', { duration: 0.12, ease: 'power3' });
    const dotY  = gsap.quickTo(dot,  'y', { duration: 0.12, ease: 'power3' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.42, ease: 'power3' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.42, ease: 'power3' });

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let hovered = null;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dotX(mouseX);
      dotY(mouseY);

      // Magnetic snap: if hovering an interactive element, pull ring to its center
      if (hovered) {
        const r = hovered.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        // Blend 60% target, 40% mouse for natural pull
        ringX(cx * 0.6 + mouseX * 0.4);
        ringY(cy * 0.6 + mouseY * 0.4);
      } else {
        ringX(mouseX);
        ringY(mouseY);
      }
    };

    const onEnterInteractive = (e) => {
      hovered = e.target.closest(INTERACTIVE_SELECTOR);
      if (!hovered) return;
      gsap.to(ring, {
        scale: 1.8,
        backgroundColor: 'rgba(191, 255, 0, 0.10)',
        borderColor: 'rgba(191, 255, 0, 0.55)',
        duration: 0.35, ease: 'power3.out',
      });
      gsap.to(dot, { scale: 0, duration: 0.25 });
    };

    const onLeaveInteractive = () => {
      hovered = null;
      gsap.to(ring, {
        scale: 1,
        backgroundColor: 'rgba(255,255,255,0)',
        borderColor: 'rgba(255,255,255,0.4)',
        duration: 0.45, ease: 'power3.out',
      });
      gsap.to(dot, { scale: 1, duration: 0.3 });
    };

    const onDown = () => { gsap.to(ring, { scale: 0.85, duration: 0.12, ease: 'power3.out' }); };
    const onUp   = () => {
      gsap.to(ring, {
        scale: hovered ? 1.8 : 1, duration: 0.3, ease: 'back.out(2)',
      });
    };

    const onEnterText = () => {
      gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
    };
    const onLeaveText = () => {
      gsap.to([dot, ring], { opacity: 1, duration: 0.2 });
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onEnterInteractive);
    document.addEventListener('mouseout',  onLeaveInteractive);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup',   onUp);

    // Hide custom cursor when entering text fields
    document.querySelectorAll(TEXT_INPUT_SELECTOR).forEach(el => {
      el.addEventListener('mouseenter', onEnterText);
      el.addEventListener('mouseleave', onLeaveText);
    });

    // Hide native cursor for the body — but keep it for text inputs
    document.documentElement.classList.add('magnetic-cursor-active');

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onEnterInteractive);
      document.removeEventListener('mouseout',  onLeaveInteractive);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup',   onUp);
      document.documentElement.classList.remove('magnetic-cursor-active');
    };
  }, []);

  // Don't render on touch / reduced-motion devices
  if (typeof window !== 'undefined') {
    if (prefersReducedMotion() || matchMedia('(pointer: coarse)').matches) return null;
  }

  return (
    <>
      <style>{`
        html.magnetic-cursor-active,
        html.magnetic-cursor-active body { cursor: none; }
        html.magnetic-cursor-active input,
        html.magnetic-cursor-active textarea,
        html.magnetic-cursor-active [contenteditable="true"] { cursor: text; }
      `}</style>
      <div
        ref={ringRef}
        className="magnetic-cursor-ring"
        aria-hidden
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 32, height: 32, marginLeft: -16, marginTop: -16,
          borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.4)',
          backgroundColor: 'rgba(255,255,255,0)',
          pointerEvents: 'none', zIndex: 9999,
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />
      <div
        ref={dotRef}
        className="magnetic-cursor-dot"
        aria-hidden
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 5, height: 5, marginLeft: -2.5, marginTop: -2.5,
          borderRadius: '50%',
          background: '#BFFF00',
          pointerEvents: 'none', zIndex: 10000,
          boxShadow: '0 0 10px rgba(191,255,0,0.6)',
          willChange: 'transform',
        }}
      />
    </>
  );
};
