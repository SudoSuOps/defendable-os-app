'use client';

import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { CONTACT_EMAIL, DIAL_OPTIONS } from '@/lib/demo/content';
import { cx } from '@/components/ui';
import { useDial } from '@/state/providers';

const Request = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  org: z.string().trim(),
  msg: z.string().trim(),
});

const FOCUSABLE = 'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])';

export default function DialModal() {
  const { open, closeDial } = useDial();
  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>{open && <Dialog key="dial" close={closeDial} />}</AnimatePresence>
    </MotionConfig>
  );
}

function Dialog({ close }: { close: () => void }) {
  const [type, setType] = useState(0);
  const [f, setF] = useState({ name: '', email: '', org: '', msg: '' });
  const [stage, setStage] = useState<'form' | 'done'>('form');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  // Focus management: move focus in, trap Tab, restore on close, lock page scroll.
  useEffect(() => {
    opener.current = document.activeElement;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('input')?.focus();
    return () => {
      document.body.style.overflow = prev;
      if (opener.current instanceof HTMLElement) opener.current.focus();
    };
  }, []);

  // Listen on the document, not the dialog: when the form swaps for the confirmation, the focused button unmounts and
  // focus falls to <body>, which would silently kill Escape and the Tab trap if they were bound to the dialog element.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return close();
      if (e.key !== 'Tab' || !panel.current) return;
      const els = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = els[0];
      const last = els[els.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;
      if (!panel.current.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  // Keep focus inside the dialog when its contents change.
  useEffect(() => {
    if (stage === 'done') panel.current?.querySelector<HTMLElement>('button:not([aria-label])')?.focus();
  }, [stage]);

  const parsed = Request.safeParse(f);
  const typeLabel = DIAL_OPTIONS[type]?.title ?? '';
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setF((x) => ({ ...x, [k]: e.target.value }));
    setError('');
  };

  const submit = () => {
    if (!parsed.success) return setError('Enter your name and a valid email address.');
    const d = parsed.data;
    const body = `Name: ${d.name}\nEmail: ${d.email}\nOrganization: ${d.org || '-'}\n\n${d.msg}`;
    // A temporary anchor opens the mail client the same way a link would, and unlike assigning location.href it can be intercepted.
    const a = document.createElement('a');
    a.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Make the Dial: ' + typeLabel)}&body=${encodeURIComponent(body)}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setStage('done');
    setCopied(false);
  };

  const summary = JSON.stringify(
    { type: typeLabel, name: f.name.trim(), email: f.email.trim(), organization: f.org.trim() || null, message: f.msg.trim() || null },
    null,
    2,
  );
  const copy = () => navigator.clipboard?.writeText(summary).then(() => setCopied(true), () => {});

  const badName = !!error && !f.name.trim();
  const badEmail = !!error && !(parsed.success || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
      onClick={close}
      className="fixed inset-0 z-[200] grid place-items-center overflow-y-auto bg-[rgba(4,5,7,0.78)] p-4 backdrop-blur-[8px]"
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dial-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[720px] overflow-hidden rounded-2xl border border-hair bg-surface shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]"
      >
        <div className="flex items-start justify-between gap-4 px-7 pt-7">
          <div>
            <div className="font-mono text-[11px] tracking-[0.16em] text-gold">CONTACT</div>
            <h2 id="dial-title" className="mt-2.5 font-display text-[36px] font-bold tracking-[-0.025em]">
              Make the Dial.
            </h2>
            <p className="m-0 mt-2 text-[15px] text-fg2">Real conversations. No sales funnel theater.</p>
          </div>
          <button type="button" onClick={close} aria-label="Close" className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-hair bg-transparent text-[18px] text-fg2 hover:text-fg">
            ×
          </button>
        </div>

        {stage === 'form' ? (
          <div className="grid gap-5 px-7 pb-7 pt-6">
            <div role="radiogroup" aria-label="Conversation type" className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
              {DIAL_OPTIONS.map((o, i) => (
                <button
                  key={o.title}
                  type="button"
                  role="radio"
                  aria-checked={i === type}
                  onClick={() => setType(i)}
                  className={cx('grid cursor-pointer gap-1.5 rounded-[10px] border p-3.5 text-left text-fg', i === type ? 'border-gold bg-[rgba(214,170,84,0.10)]' : 'border-hair bg-inset')}
                >
                  <span className="font-display text-[15px] font-semibold">{o.title}</span>
                  <span className="text-[13px] leading-[1.45] text-fg2">{o.desc}</span>
                </button>
              ))}
            </div>
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
              <label className="grid gap-1.5 text-[13px] text-fg2">
                Name
                <input value={f.name} onChange={set('name')} autoComplete="name" aria-invalid={badName} className={cx('rounded-lg border bg-canvas p-3 text-[15px] text-fg', badName ? 'border-fail' : 'border-hair')} />
              </label>
              <label className="grid gap-1.5 text-[13px] text-fg2">
                Work email
                <input type="email" value={f.email} onChange={set('email')} autoComplete="email" aria-invalid={badEmail} className={cx('rounded-lg border bg-canvas p-3 text-[15px] text-fg', badEmail ? 'border-fail' : 'border-hair')} />
              </label>
            </div>
            <label className="grid gap-1.5 text-[13px] text-fg2">
              Organization
              <input value={f.org} onChange={set('org')} autoComplete="organization" className="rounded-lg border border-hair bg-canvas p-3 text-[15px] text-fg" />
            </label>
            <label className="grid gap-1.5 text-[13px] text-fg2">
              What do you need verified?
              <textarea value={f.msg} onChange={set('msg')} rows={3} className="resize-y rounded-lg border border-hair bg-canvas p-3 text-[15px] text-fg" />
            </label>
            {error && (
              <div role="alert" className="text-[13px] text-fail">
                {error}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="max-w-[340px] text-[12px] text-mute">Opens your email app addressed to {CONTACT_EMAIL}. Nothing is sent until you press send.</span>
              <button type="button" onClick={submit} className="cursor-pointer rounded-lg border-none bg-gold px-5 py-[13px] text-[15px] font-semibold text-canvas hover:bg-gold2">
                Compose email
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 px-7 pb-7 pt-6">
            <div className="font-mono text-[12px] font-semibold text-pass">EMAIL DRAFT OPENED · SEND IT FROM YOUR MAIL APP</div>
            <div className="text-[14px] text-fg2">
              If nothing opened, copy the request and send it to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </div>
            <pre className="m-0 overflow-auto whitespace-pre-wrap rounded-lg border border-hair bg-canvas p-4 font-mono text-[12px] leading-[1.6] text-fg">{summary}</pre>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copy} className="cursor-pointer rounded-lg border-none bg-gold px-4 py-[11px] text-[14px] font-semibold text-canvas">
                {copied ? 'Copied' : 'Copy request'}
              </button>
              <button type="button" onClick={() => setStage('form')} className="cursor-pointer rounded-lg border border-hair bg-transparent px-4 py-2.5 text-[14px] text-fg">
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
