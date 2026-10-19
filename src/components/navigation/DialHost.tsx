'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useDial } from '@/state/providers';

// The modal (with Motion and Zod) is only needed after a click, so it stays out of the initial bundle.
const load = () => import('./DialModal');
const DialModal = dynamic(load, { ssr: false });

export function DialHost() {
  const { open } = useDial();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (open) setArmed(true);
  }, [open]);

  // Warm the chunk once the browser is idle so the first click is instant.
  useEffect(() => {
    const warm = () => void load();
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(warm, { timeout: 6000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(warm, 3000);
    return () => clearTimeout(t);
  }, []);

  return armed ? <DialModal /> : null;
}
