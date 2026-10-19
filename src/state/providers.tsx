'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { runFlightsheet, type FsRun } from '@/lib/demo/flightsheet';
import { canon } from '@/lib/provenance/canon';
import { sha256 } from '@/lib/provenance/hash';
import type { VerificationReceipt } from '@/lib/schemas';

interface DemoState {
  dscr: string;
  setDscr: (v: string) => void;
  run: FsRun | null;
  tampered: boolean;
  toggleTamper: () => void;
  /** The receipt as currently displayed (tampered copy when the field was edited). */
  shown: VerificationReceipt | null;
  check: { hash: string; ok: boolean } | null;
  recompute: () => Promise<void>;
}

const DemoCtx = createContext<DemoState | null>(null);
export const useDemo = () => {
  const c = useContext(DemoCtx);
  if (!c) throw new Error('useDemo outside Providers');
  return c;
};

interface DialState {
  open: boolean;
  openDial: () => void;
  closeDial: () => void;
}
const DialCtx = createContext<DialState | null>(null);
export const useDial = () => {
  const c = useContext(DialCtx);
  if (!c) throw new Error('useDial outside Providers');
  return c;
};

/** True when the visitor prefers reduced motion. Updates live. */
export function useReducedMotion(): boolean {
  const [rm, setRm] = useState(false);
  useEffect(() => {
    const q = window.matchMedia('(prefers-reduced-motion: reduce)');
    setRm(q.matches);
    const on = (e: MediaQueryListEvent) => setRm(e.matches);
    q.addEventListener('change', on);
    return () => q.removeEventListener('change', on);
  }, []);
  return rm;
}

export function Providers({ children }: { children: ReactNode }) {
  const [dscr, setDscrRaw] = useState('2.07');
  const [run, setRun] = useState<FsRun | null>(null);
  const [tampered, setTampered] = useState(false);
  const [check, setCheck] = useState<DemoState['check']>(null);
  const seq = useRef(0);

  const exec = useCallback(async (v: string) => {
    const my = ++seq.current;
    const r = await runFlightsheet(v);
    if (my === seq.current) {
      setRun(r);
      setCheck(null);
    }
  }, []);

  useEffect(() => {
    void exec('2.07');
  }, [exec]);

  const setDscr = useCallback(
    (v: string) => {
      setDscrRaw(v);
      setTampered(false);
      void exec(v);
    },
    [exec],
  );

  const shown = useMemo<VerificationReceipt | null>(() => {
    if (!run) return null;
    return tampered ? { ...run.body, outcome: run.body.outcome === 'PASS' ? 'FAIL' : 'PASS' } : run.body;
  }, [run, tampered]);

  const recompute = useCallback(async () => {
    if (!shown || !run) return;
    const hash = await sha256(canon(shown));
    setCheck({ hash, ok: hash === run.hash });
  }, [shown, run]);

  const demo = useMemo<DemoState>(
    () => ({ dscr, setDscr, run, tampered, toggleTamper: () => { setTampered((t) => !t); setCheck(null); }, shown, check, recompute }),
    [dscr, setDscr, run, tampered, shown, check, recompute],
  );

  const [open, setOpen] = useState(false);
  const dial = useMemo<DialState>(() => ({ open, openDial: () => setOpen(true), closeDial: () => setOpen(false) }), [open]);

  return (
    <DemoCtx.Provider value={demo}>
      <DialCtx.Provider value={dial}>{children}</DialCtx.Provider>
    </DemoCtx.Provider>
  );
}
