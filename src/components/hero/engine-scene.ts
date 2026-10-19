// Named imports so the bundler can tree-shake Three.js down to what the scene uses.
import {
  WebGLRenderer,
  SRGBColorSpace,
  Scene,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Group,
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
  LineSegments,
  EdgesGeometry,
  LineBasicMaterial,
  MeshBasicMaterial,
  CylinderGeometry,
  BufferGeometry,
  Vector3,
  Line,
  GridHelper,
} from 'three';
import type * as THREE from 'three';

const MODS = ['INGEST', 'CURATE', 'EXECUTE', 'VERIFY', 'PROVE'] as const;
const GOLD = 0xd6aa54;
const GOLD2 = 0xf0c878;
const LINE = 0x29313b;
const ELEV = 0x181e24;
const SURF = 0x11151a;
const TI = 0x949ea9;

export interface EngineHandle {
  setStage: (n: number) => void;
  setPaused: (p: boolean) => void;
  dispose: () => void;
}

interface Slab {
  edges: THREE.LineSegments;
  strip: THREE.Mesh;
  plateEdges: THREE.LineSegments;
  body: THREE.Mesh;
  y: number;
}

/**
 * The hero engine: five slabs, titanium columns, a gold spine, falling packets and a receipt plate.
 * Deterministic: motion is a pure function of time. Renders one still frame when motion is off, the tab is hidden, or the device is low-power.
 */
export function createEngine(host: HTMLElement, opts: { reducedMotion: boolean; stage: number; paused: boolean }): EngineHandle {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:absolute;inset:0;overflow:hidden';
  host.appendChild(wrap);

  const low = (navigator.hardwareConcurrency || 8) <= 2;
  let stage = opts.stage;
  let paused = opts.paused;
  let visible = true;
  let raf: number | null = null;
  let lastT = 0;
  const t0 = performance.now();

  const r = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  r.outputColorSpace = SRGBColorSpace;
  wrap.appendChild(r.domElement);
  r.domElement.style.cssText = 'display:block;width:100%;height:100%';
  r.domElement.setAttribute('aria-hidden', 'true');

  const scene = new Scene();
  const cam = new PerspectiveCamera(30, 1, 0.1, 100);
  cam.position.set(8.2, 6.0, 10.4);
  cam.lookAt(0, -0.2, 0);
  scene.add(new AmbientLight(0xffffff, 0.35));
  const key = new DirectionalLight(0xfff1dc, 1.6);
  key.position.set(5, 9, 6);
  scene.add(key);
  const rim = new DirectionalLight(0x9fb4c8, 0.6);
  rim.position.set(-7, 3, -6);
  scene.add(rim);

  const g = new Group();
  scene.add(g);
  const slabs: Slab[] = [];
  for (let i = 0; i < 5; i++) {
    const y = 2.4 - i * 1.2;
    const s = new Group();
    s.position.y = y;
    const body = new Mesh(new BoxGeometry(4.2, 0.34, 3.0), new MeshStandardMaterial({ color: ELEV, metalness: 0.65, roughness: 0.42 }));
    const edges = new LineSegments(new EdgesGeometry(body.geometry), new LineBasicMaterial({ color: LINE }));
    const plate = new Mesh(new BoxGeometry(3.0, 0.04, 2.0), new MeshStandardMaterial({ color: SURF, metalness: 0.4, roughness: 0.7 }));
    plate.position.y = 0.19;
    const plateEdges = new LineSegments(new EdgesGeometry(plate.geometry), new LineBasicMaterial({ color: LINE }));
    plateEdges.position.y = 0.19;
    const strip = new Mesh(new BoxGeometry(3.4, 0.035, 0.02), new MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.18 }));
    strip.position.set(0, 0, 1.511);
    s.add(body, edges, plate, plateEdges, strip);
    for (let k = 0; k < 6; k++) {
      const port = new Mesh(new BoxGeometry(0.16, 0.08, 0.04), new MeshStandardMaterial({ color: TI, metalness: 0.8, roughness: 0.3 }));
      port.position.set(1.62, 0.06, -1.1 + k * 0.44);
      port.rotation.y = Math.PI / 2;
      s.add(port);
    }
    g.add(s);
    slabs.push({ edges, strip, plateEdges, body, y });
  }

  const colMat = new MeshStandardMaterial({ color: TI, metalness: 0.85, roughness: 0.3 });
  for (const [x, z] of [[-2.0, -1.4], [2.0, -1.4], [-2.0, 1.4], [2.0, 1.4]] as const) {
    const c = new Mesh(new CylinderGeometry(0.035, 0.035, 5.6, 8), colMat);
    c.position.set(x, 0, z);
    g.add(c);
  }
  const spineGeo = new BufferGeometry().setFromPoints([new Vector3(0, 3.5, 1.75), new Vector3(0, -3.0, 1.75), new Vector3(0, -3.0, 2.6)]);
  g.add(new Line(spineGeo, new LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.55 })));
  for (const s of slabs) {
    const tick = new Mesh(new BoxGeometry(0.3, 0.02, 0.24), new MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.4 }));
    tick.position.set(0, s.y, 1.63);
    g.add(tick);
  }
  const packets: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const p = new Mesh(new BoxGeometry(0.14, 0.14, 0.14), new MeshBasicMaterial({ color: GOLD2 }));
    g.add(p);
    packets.push(p);
  }
  const rc = new Group();
  rc.position.set(0, -3.02, 2.9);
  const rb = new Mesh(new BoxGeometry(1.1, 0.03, 0.75), new MeshStandardMaterial({ color: SURF, metalness: 0.3, roughness: 0.6 }));
  const rcEdges = new LineSegments(new EdgesGeometry(rb.geometry), new LineBasicMaterial({ color: GOLD }));
  rc.add(rb, rcEdges);
  g.add(rc);
  const grid = new GridHelper(16, 32, 0x1d232a, 0x14181d);
  grid.position.y = -3.06;
  scene.add(grid);

  const labels = MODS.map((m, i) => {
    const d = document.createElement('div');
    d.style.cssText = "position:absolute;left:0;top:0;pointer-events:none;font:500 12px var(--font-plex),'IBM Plex Mono',monospace;letter-spacing:.14em;white-space:nowrap;transition:color .2s";
    d.textContent = `0${i + 1}  ${m}`;
    wrap.appendChild(d);
    return d;
  });
  const rl = document.createElement('div');
  rl.style.cssText = "position:absolute;left:0;top:0;pointer-events:none;font:500 11px var(--font-plex),'IBM Plex Mono',monospace;letter-spacing:.08em;color:#9AA5B1;white-space:nowrap";
  rl.textContent = 'receipt.json';
  wrap.appendChild(rl);

  const v = new Vector3();
  function frame(t: number) {
    lastT = t;
    g.rotation.y = -0.32 + Math.sin(t * 0.00012) * 0.18;
    const span = 6.6;
    packets.forEach((p, i) => {
      const u = (t * 0.00011 + i / 4) % 1;
      p.position.set(0, 3.5 - u * span, 1.75);
      p.rotation.y = u * 6;
      p.visible = u < 0.985;
    });
    r.render(scene, cam);
    const w = host.clientWidth;
    const h = host.clientHeight;
    slabs.forEach((s, i) => {
      v.set(2.25, s.y, 1.5);
      g.localToWorld(v);
      v.project(cam);
      const el = labels[i];
      if (el) el.style.transform = `translate(${(v.x * 0.5 + 0.5) * w + 14}px, ${(-v.y * 0.5 + 0.5) * h - 8}px)`;
    });
    v.set(0.7, -3.02, 2.9);
    g.localToWorld(v);
    v.project(cam);
    rl.style.transform = `translate(${(v.x * 0.5 + 0.5) * w + 8}px, ${(-v.y * 0.5 + 0.5) * h - 7}px)`;
  }

  function applyStage() {
    slabs.forEach((s, i) => {
      const on = i === stage;
      const past = i < stage;
      (s.edges.material as THREE.LineBasicMaterial).color.setHex(on ? GOLD : LINE);
      (s.plateEdges.material as THREE.LineBasicMaterial).color.setHex(on ? GOLD2 : LINE);
      (s.strip.material as THREE.MeshBasicMaterial).opacity = on ? 1 : past ? 0.45 : 0.15;
      (s.body.material as THREE.MeshStandardMaterial).emissive.setHex(on ? 0x2a1f0a : 0x000000);
      const el = labels[i];
      if (el) el.style.color = on ? '#F0C878' : '#7E8894';
    });
    (rcEdges.material as THREE.LineBasicMaterial).color.setHex(stage === 4 ? GOLD2 : LINE);
    frame(lastT);
  }

  function kick() {
    const run = visible && !paused && !opts.reducedMotion && !low;
    if (!run) {
      if (raf !== null) cancelAnimationFrame(raf);
      raf = null;
      frame(lastT || 2400);
      return;
    }
    if (raf !== null) return;
    const loop = () => {
      frame(performance.now() - t0);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }

  function resize() {
    const w = host.clientWidth || 1;
    const h = host.clientHeight || 1;
    r.setSize(w, h, false);
    cam.aspect = w / h;
    cam.position.setLength(w / h < 0.85 ? 16.5 : 14.4);
    cam.updateProjectionMatrix();
    frame(lastT);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(host);
  const io = new IntersectionObserver((es) => {
    visible = es[0]?.isIntersecting ?? true;
    kick();
  });
  io.observe(host);
  resize();
  applyStage();
  kick();

  return {
    setStage(n) {
      stage = Math.max(0, Math.min(4, n));
      applyStage();
      kick();
    },
    setPaused(p) {
      paused = p;
      kick();
    },
    dispose() {
      if (raf !== null) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      r.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose?.();
      });
      wrap.remove();
    },
  };
}
