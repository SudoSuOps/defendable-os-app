'use client';

import { useEffect, useRef, useState } from 'react';
import { HERO_MODULES } from '@/lib/demo/content';
import type { EngineHandle } from './engine-scene';

/**
 * Loads Three.js lazily, once the browser is idle after hydration, so it never blocks first paint or early input. If the import or WebGL fails,
 * a plain list of the five modules is shown instead.
 */
export default function EngineCanvas({ stage, paused, reducedMotion }: { stage: number; paused: boolean; reducedMotion: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const handle = useRef<EngineHandle | null>(null);
  const [fallback, setFallback] = useState(false);
  const latest = useRef({ stage, paused, reducedMotion });
  latest.current = { stage, paused, reducedMotion };

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        // Let first paint and input handling finish before parsing ~700 KB of Three.js and building the scene.
        await new Promise<void>((resolve) => {
          if ('requestIdleCallback' in window) window.requestIdleCallback(() => resolve(), { timeout: 2500 });
          else setTimeout(resolve, 400);
        });
        if (dead) return;
        const probe = document.createElement('canvas');
        if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) throw new Error('no webgl');
        if (dead || !host.current) return;
        const { createEngine } = await import('./engine-scene');
        handle.current = createEngine(host.current, latest.current);
      } catch {
        if (!dead) setFallback(true);
      }
    })();
    return () => {
      dead = true;
      handle.current?.dispose();
      handle.current = null;
    };
  }, []);

  useEffect(() => handle.current?.setStage(stage), [stage]);
  useEffect(() => handle.current?.setPaused(paused), [paused]);

  if (fallback) {
    return (
      <div className="grid h-full content-center gap-2.5 p-6">
        {HERO_MODULES.map(([m], i) => (
          <div
            key={m}
            className={`rounded-lg border bg-surface px-4 py-3.5 font-mono text-[13px] font-medium tracking-[0.12em] ${i === stage ? 'border-gold text-gold2' : 'border-hair text-fg2'}`}
          >
            0{i + 1} {m}
          </div>
        ))}
      </div>
    );
  }
  return <div ref={host} className="relative h-full w-full" />;
}
