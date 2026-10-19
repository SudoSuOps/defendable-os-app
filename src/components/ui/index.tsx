import type { CSSProperties, ReactNode } from 'react';

export type Tone = 'pass' | 'fail' | 'review' | 'unk' | 'gold' | 'ti';

const TONE_TEXT: Record<Tone, string> = { pass: 'text-pass', fail: 'text-fail', review: 'text-review', unk: 'text-mute', gold: 'text-gold2', ti: 'text-ti' };
const TONE_BORDER: Record<Tone, string> = { pass: 'border-pass', fail: 'border-fail', review: 'border-review', unk: 'border-mute', gold: 'border-gold', ti: 'border-ti' };

/** Verdict string to display tone. */
export function verdictTone(v: string): Tone {
  switch (v) {
    case 'PASS':
    case 'CONSISTENT':
    case 'MATCH':
      return 'pass';
    case 'FAIL':
    case 'FAILED':
    case 'FLAGGED':
    case 'VALIDATOR FAILURE':
    case 'INVALID INPUT':
    case 'REJECTS':
      return 'fail';
    case 'REVIEW REQUIRED':
      return 'review';
    default:
      return 'unk';
  }
}

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('mx-auto max-w-[1360px]', className)}>{children}</div>;
}

export function Section({ id, alt, children, className, label }: { id: string; alt?: boolean; children: ReactNode; className?: string; label?: string }) {
  return (
    <section
      id={id}
      aria-label={label}
      className={cx('scroll-mt-28 border-t border-hair px-[clamp(20px,4vw,48px)] py-[clamp(72px,10vw,140px)] sm:scroll-mt-16', alt && 'bg-alt', className)}
    >
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('font-mono text-[12px] tracking-[0.16em] text-gold', className)}>{children}</div>;
}

export function SectionHeading({ eyebrow, title, sub, className, as: As = 'h2' }: { eyebrow: string; title: ReactNode; sub?: ReactNode; className?: string; as?: 'h1' | 'h2' }) {
  return (
    <div className={className}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <As className="mt-4 max-w-[960px] text-balance font-display text-[clamp(36px,5.2vw,68px)] font-semibold leading-[1.02] tracking-[-0.03em]">{title}</As>
      {sub && <p className="mt-5 max-w-[620px] text-[18px] leading-[1.55] text-fg2">{sub}</p>}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('overflow-hidden rounded-[14px] border border-hair bg-surface', className)}>{children}</div>;
}

export function MonoLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('font-mono text-[11px] tracking-[0.12em] text-mute', className)}>{children}</div>;
}

export function StatusBadge({ children, tone = 'unk', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cx('inline-block whitespace-nowrap rounded-[4px] border px-[7px] py-[3px] font-mono text-[11px] font-semibold', TONE_TEXT[tone], TONE_BORDER[tone], className)}>
      {children}
    </span>
  );
}

/** Marks sample data. Honors the demoLabels flag. */
export function DemoTag({ children }: { children: ReactNode }) {
  return <span className="rounded-[4px] border border-dashed border-dash px-2 py-1 font-mono text-[11px] tracking-[0.12em] text-fg2">{children}</span>;
}

export function SegmentedTabs<T extends string>({
  label,
  value,
  onChange,
  options,
  size = 'md',
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  size?: 'sm' | 'md';
}) {
  return (
    <div role="tablist" aria-label={label} className={cx('inline-flex gap-1 border border-hair bg-surface p-1', size === 'sm' ? 'gap-[3px] rounded-lg p-[3px]' : 'rounded-[10px]')}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            className={cx(
              'cursor-pointer border-none font-medium transition-colors duration-150',
              size === 'sm' ? 'rounded-[5px] px-3 py-[7px] text-[12px]' : 'rounded-[7px] px-4 py-[10px] text-[14px]',
              on ? 'bg-gold text-canvas' : 'bg-transparent text-fg2',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

type BtnProps = { children: ReactNode; onClick?: () => void; href?: string; variant?: 'gold' | 'outline' | 'ghost' | 'approve'; disabled?: boolean; className?: string; pressed?: boolean; size?: 'md' | 'lg' };

export function Button({ children, onClick, href, variant = 'outline', disabled, className, pressed, size = 'md' }: BtnProps) {
  const base = cx(
    'inline-flex items-center justify-center rounded-lg transition-colors duration-150',
    size === 'lg' ? 'px-[22px] py-[15px] text-[15px]' : 'px-4 py-[11px] text-[14px]',
    disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
  );
  const v = {
    gold: 'border border-transparent bg-gold font-semibold text-canvas hover:bg-gold2 hover:text-canvas',
    outline: 'border border-hair bg-transparent font-medium text-fg hover:border-ti hover:text-fg',
    ghost: 'border border-hair bg-transparent text-fg2 hover:text-fg',
    approve: 'border border-pass bg-transparent text-pass',
  }[variant];
  const cls = cx(base, v, className);
  if (href) return <a href={href} className={cls}>{children}</a>;
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-pressed={pressed} className={cls}>
      {children}
    </button>
  );
}

/** Label/value rows, `dl` semantics. Stacks label over value on phones. */
export function KV({ k, v, kw = 'minmax(120px,180px)', mono, tone }: { k: string; v: ReactNode; kw?: string; mono?: boolean; tone?: Tone }) {
  return (
    <div className="grid gap-1 border-b border-div px-5 py-[12px] sm:gap-4 sm:[grid-template-columns:var(--kw)_minmax(0,1fr)]" style={{ '--kw': kw } as CSSProperties}>
      <dt className="pt-0.5 font-mono text-[11px] tracking-[0.08em] text-mute">{k}</dt>
      <dd className={cx('m-0 break-words leading-[1.5]', mono ? 'font-mono text-[12.5px]' : 'text-[14px]', tone ? TONE_TEXT[tone] : 'text-fg')}>{v}</dd>
    </div>
  );
}

export function CodeBlock({ children, className, max }: { children: string; className?: string; max?: string }) {
  return (
    <pre className={cx('m-0 overflow-auto whitespace-pre bg-inset2 p-5 font-mono text-[12.5px] leading-[1.6] text-fg', max, className)}>{children}</pre>
  );
}

export { TONE_TEXT, TONE_BORDER };
