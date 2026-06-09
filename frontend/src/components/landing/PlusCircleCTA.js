import { Link } from 'react-router-dom';

/**
 * PlusCircleCTA — THE signature interaction of the Direction-A brand.
 *
 * Visual: a perfect lime-green circle with a black `+` glyph, an
 * underlined action-phrase to its right, the whole thing pivots
 * slightly up on hover with a lime glow halo.
 *
 * Pass `to` for internal navigation (React Router) or `href` for
 * external (opens in a new tab by default; pass external=false to
 * disable). The two paths render the same visual.
 */

const baseClasses =
  'group inline-flex items-center gap-3 text-current ' +
  'transition-all duration-200 ease-out hover:translate-y-[-1px]';

const circleClasses =
  'flex items-center justify-center w-11 h-11 rounded-full bg-brand ' +
  'text-[#0A0A0A] font-black text-xl leading-none ' +
  'transition-all duration-200 group-hover:shadow-[0_8px_24px_-8px_rgba(191,255,0,0.65)] ' +
  'group-hover:brightness-105';

const labelClasses =
  'text-[14px] md:text-[15px] font-bold underline decoration-1 ' +
  'underline-offset-[6px] decoration-current/40 ' +
  'group-hover:decoration-current transition-all';

export const PlusCircleCTA = ({
  href,
  to,
  children,
  className = '',
  testId,
  external = true,
}) => {
  const sharedProps = {
    className: `${baseClasses} ${className}`,
    'data-testid': testId,
  };

  const inner = (
    <>
      <span aria-hidden className={circleClasses}>+</span>
      <span className={labelClasses}>{children}</span>
    </>
  );

  if (to) {
    return <Link to={to} {...sharedProps}>{inner}</Link>;
  }

  return (
    <a
      href={href || '#'}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      {...sharedProps}
    >
      {inner}
    </a>
  );
};
