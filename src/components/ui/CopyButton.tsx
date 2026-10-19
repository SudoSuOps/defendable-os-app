'use client';

import { useState } from 'react';
import { cx } from '@/components/ui';

/** Copies text to the clipboard and says so. Falls back silently where the Clipboard API is unavailable. */
export function CopyButton({ text, label = 'Copy', className }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(
          () => {
            setDone(true);
            setTimeout(() => setDone(false), 1600);
          },
          () => {},
        );
      }}
      className={cx('cursor-pointer rounded-md border border-hair bg-transparent px-2.5 py-1 font-mono text-[11px] text-fg2 hover:border-ti hover:text-fg', className)}
    >
      <span aria-live="polite">{done ? 'Copied' : label}</span>
    </button>
  );
}
