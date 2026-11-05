// Animated 3D construction site (Three.js).
// The building rises floor by floor, driven by a "progress" value from 0 to 1:
//   0.00  land & site marking    0.12  foundation      0.25-0.70  superstructure
//   0.72  masonry walls          0.88  glass/finishing 0.97       handover
// Call setProgress(p) to animate to any stage (the timeline and slider use this).
import * as THREE from "three";

export const STAGES = [
  { p: 0.08, name: "Land & approvals" },
  { p: 0.22, name: "Foundation & basement" },
  { p: 0.70, name: "Superstructure" },
  { p: 0.84, name: "Masonry & MEP" },
  { p: 0.95, name: "Finishing & amenities" },
  { p: 1.00, name: "Handover" },
];

export function stageFor(p) {
  if (p < 0.12) return STAGES[0];
  if (p < 0.25) return STAGES[1];
  if (p < 0.72) return STAGES[2];
  if (p < 0.88) return STAGES[3];
  if (p < 0.975) return STAGES[4];
  return STAGES[5];
}

export function mountConstruction(canvas, {
  progress = 0.84, interactive = true, speed = 0.22, radius: startRadius = 46,
  landscape = false,   // trees grow during the build, lawn, lamps and solar panels at handover
  effects = false,     // dust while building, sparkle burst on completion, fireflies at night
  theme = "day",       // "day" | "night"
  view = {},           // { theta, phi, look: [x, y, z] }
} = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x8a7a66, 1.1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.4);
  sun.position.set(12, 22, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 60 });
  sun.shadow.bias = -0.0005;
  scene.add(sun);

  // ---------- materials ----------
  const M = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...extra });
  const raw = new THREE.Color(0xb9b4ab), painted = new THREE.Color(0xf1ece4);
  const concrete = M(0xb9b4ab);
  const slabMat = M(0xc9c4bb);
  const baseSide = M(0xd3cdc2);
  const sand = M(0xd9c6a0, { roughness: 1 });
  const block = M(0xa8927a);
  const glass = M(0x6d93bd, { roughness: 0.15, metalness: 0.5 });
  const scaffoldPost = M(0xe8a33a, { roughness: 0.5, metalness: 0.3 });
  const scaffoldRail = M(0xd4572a, { roughness: 0.5, metalness: 0.3 });
  const plank = M(0x9c7a4f);
  const steel = M(0x3a3f47, { roughness: 0.5, metalness: 0.6 });
  const yellow = M(0xf2b134, { roughness: 0.55 });
  const red = M(0xd2452f, { roughness: 0.55 });
  const dark = M(0x2a2f36);
  const vest = M(0xff7a1a);
  const skin = M(0xc68b5e);
  const leaf = M(0x5c9a52);
  const brick = M(0xb4583c);
  const tape = M(0xf5c518, { emissive: 0x3a2c00 });
  const glassLit = M(0x6d93bd, { roughness: 0.15, metalness: 0.5, emissive: 0xffbe6a, emissiveIntensity: 0 });
  const led = M(0xc9c4bb, { emissive: 0xffd28a, emissiveIntensity: 0 });
  const bulb = M(0xfff4dc, { emissive: 0xffd9a0, emissiveIntensity: 0.2 });
  const beacon = M(0x7a1a12, { emissive: 0xff2a1a, emissiveIntensity: 0 });
  const lawn = new THREE.Color(0x86b06a), sandCol = new THREE.Color(0xd9c6a0);

  const shadow = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };
  const box = (w, h, d, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };
  // box whose origin is at its bottom face (used for things that "grow" upward)
  const post = (w, h, d, mat, x = 0, y = 0, z = 0) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(0, h / 2, 0); const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); return m; };
  // thin beam between two points
  const up = new THREE.Vector3(0, 1, 0);
  function beam(a, b, t, mat) {
    const dir = new THREE.Vector3().subVectors(b, a);
    const m = new THREE.Mesh(new THREE.BoxGeometry(t, dir.length(), t), mat);
    m.position.copy(a).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(up, dir.normalize());
    return m;
  }
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  // ---------- animation registry ----------
  // mode: "grow" (scale y from 0), "drop" (falls into place), "pop" (scale all axes)
  const anim = [];
  function track(obj, t0, { t1 = null, mode = "grow", dur = 0.05 } = {}) {
    obj.userData.anim = { t0, t1, mode, dur, y: obj.position.y };
    anim.push(obj);
    scene.add(shadow(obj));
    return obj;
  }

  // ---------- site base (diorama) ----------
  const base = new THREE.Group();
  base.add(box(20, 0.8, 17, baseSide, 0, -0.4, 0));
  base.add(box(19.2, 0.06, 16.2, sand, 0, 0.03, 0));
  [[0, 8.2, 20, 0.5], [0, -8.2, 20, 0.5]].forEach(([x, z, w, d]) => base.add(box(w, 0.35, d, baseSide, x, 0.17, z)));
  [[9.8, 0], [-9.8, 0]].forEach(([x, z]) => base.add(box(0.5, 0.35, 17, baseSide, x, 0.17, z)));
  // debris and gravel
  for (let i = 0; i < 26; i++) {
    const s = 0.12 + Math.random() * 0.2;
    base.add(box(s, s * 0.5, s, i % 3 ? baseSide : plank, -9 + Math.random() * 18, 0.08, 4.5 + Math.random() * 3));
  }
  scene.add(shadow(base));

  // ---------- building ----------
  const H = 1.4, FLOORS = 5, footY = 0.45;
  const cx = [-3.7, -1.5, 0.7, 2.9], cz = [-2.7, 0, 2.7];
  const slabW = 7.4, slabD = 6.2, slabX = -0.4;

  // site marking strings (land stage)
  const marks = new THREE.Group();
  const corners = [V(-4.3, 0.1, -3.3), V(3.5, 0.1, -3.3), V(3.5, 0.1, 3.3), V(-4.3, 0.1, 3.3)];
  corners.forEach((c, i) => {
    marks.add(beam(c, corners[(i + 1) % 4], 0.04, tape));
    marks.add(post(0.1, 0.5, 0.1, plank, c.x, 0, c.z));
  });
  track(marks, 0.0, { t1: 0.16, mode: "pop" });

  // raft foundation
  track(post(slabW + 0.6, footY, slabD + 0.6, concrete, slabX, 0, 0), 0.12);

  const floorStart = (i) => 0.25 + i * 0.09;
  for (let i = 0; i < FLOORS; i++) {
    const y0 = footY + i * H;
    // columns
    const cols = new THREE.Group();
    cols.position.y = y0;
    cx.forEach((x) => cz.forEach((z) => cols.add(post(0.38, H - 0.22, 0.38, concrete, x, 0, z))));
    track(cols, floorStart(i));
    // slab (roof slab has an opening like a light well)
    const slab = new THREE.Group();
    slab.position.y = y0 + H - 0.22;
    if (i < FLOORS - 1) slab.add(post(slabW, 0.22, slabD, slabMat, slabX, 0, 0));
    else {
      slab.add(post(slabW, 0.22, 1.8, slabMat, slabX, 0, -2.2));
      slab.add(post(slabW, 0.22, 1.8, slabMat, slabX, 0, 2.2));
      slab.add(post(2.6, 0.22, 2.6, slabMat, slabX - 2.4, 0, 0));
      slab.add(post(2.6, 0.22, 2.6, slabMat, slabX + 2.4, 0, 0));
    }
    slab.add(post(slabW + 0.04, 0.07, 0.05, led, slabX, 0.075, slabD / 2 + 0.005));
    slab.add(post(slabW + 0.04, 0.07, 0.05, led, slabX, 0.075, -slabD / 2 - 0.005));
    slab.add(post(0.05, 0.07, slabD, led, slabX + slabW / 2 + 0.005, 0.075, 0));
    slab.add(post(0.05, 0.07, slabD, led, slabX - slabW / 2 - 0.005, 0.075, 0));
    track(slab, floorStart(i) + 0.045, { mode: "drop" });
  }
  const roofY = footY + FLOORS * H;

  // column stubs + rebar on the roof (next pour), removed at finishing
  const rebar = new THREE.Group();
  rebar.position.y = roofY;
  cx.forEach((x) => cz.forEach((z) => {
    rebar.add(post(0.38, 0.45, 0.38, concrete, x, 0, z));
    [[-0.1, -0.1], [0.1, -0.1], [-0.1, 0.1], [0.1, 0.1]].forEach(([dx, dz]) => rebar.add(post(0.035, 1.0, 0.035, steel, x + dx, 0, z + dz)));
  }));
  track(rebar, 0.70, { t1: 0.9 });

  // masonry infill with window openings, then glass
  const bays = [];
  for (let b = 0; b < 3; b++) {
    const x = (cx[b] + cx[b + 1]) / 2, w = cx[b + 1] - cx[b] - 0.38;
    bays.push({ x, z: cz[2], w, rot: 0 }, { x, z: cz[0], w, rot: 0 });
  }
  for (let b = 0; b < 2; b++) {
    const z = (cz[b] + cz[b + 1]) / 2, w = cz[b + 1] - cz[b] - 0.38;
    bays.push({ x: cx[0], z, w, rot: Math.PI / 2 }, { x: cx[3], z, w, rot: Math.PI / 2 });
  }
  for (let i = 0; i < FLOORS; i++) {
    const walls = new THREE.Group(), panes = new THREE.Group();
    walls.position.y = panes.position.y = footY + i * H;
    const h = H - 0.22;
    bays.forEach(({ x, z, w, rot }) => {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot;
      g.add(post(w, 0.42, 0.2, block, 0, 0, 0));
      g.add(post(w, 0.22, 0.2, block, 0, h - 0.22, 0));
      g.add(post(0.25, h, 0.2, block, -w / 2 + 0.125, 0, 0));
      g.add(post(0.25, h, 0.2, block, w / 2 - 0.125, 0, 0));
      walls.add(g);
      const p = new THREE.Group(); p.position.set(x, 0, z); p.rotation.y = rot;
      p.add(post(w - 0.5, h - 0.64, 0.06, Math.random() < 0.62 ? glassLit : glass, 0, 0.42, 0));
      panes.add(p);
    });
    track(walls, 0.72 + i * 0.028);
    track(panes, 0.88 + i * 0.016, { mode: "pop" });
  }

  // scaffolding on the front and right faces, one group per level
  function scaffoldLevel(i) {
    const g = new THREE.Group();
    g.position.y = footY + i * H;
    const front = [], right = [];
    for (let x = -4.4; x <= 3.6; x += 1.6) front.push(x);
    for (let z = -3.2; z <= 3.3; z += 1.3) right.push(z);
    const faces = [
      { pts: front.map((x) => [V(x, 0, 3.55), V(x, 0, 4.15)]) },
      { pts: right.map((z) => [V(3.75, 0, z), V(4.35, 0, z)]) },
    ];
    faces.forEach(({ pts }) => {
      pts.forEach(([a, b]) => {
        g.add(beam(a, V(a.x, H, a.z), 0.06, scaffoldPost));
        g.add(beam(b, V(b.x, H, b.z), 0.06, scaffoldPost));
      });
      for (let k = 0; k < pts.length - 1; k++) {
        const [a1, b1] = pts[k], [a2, b2] = pts[k + 1];
        [0.55, H].forEach((y) => g.add(beam(V(b1.x, y, b1.z), V(b2.x, y, b2.z), 0.05, scaffoldRail)));
        g.add(beam(V(a1.x, H, a1.z), V(a2.x, H, a2.z), 0.05, scaffoldRail));
        const mid = V((a1.x + b1.x + a2.x + b2.x) / 4, 0.03, (a1.z + b1.z + a2.z + b2.z) / 4);
        const len = a1.distanceTo(a2) + 0.05, along = Math.abs(a2.x - a1.x) > 0.01;
        g.add(box(along ? len : 0.55, 0.05, along ? 0.55 : len, plank, mid.x, mid.y, mid.z));
        if (k % 2 === 0) g.add(beam(V(b1.x, 0, b1.z), V(b2.x, H, b2.z), 0.04, scaffoldPost));
      }
    });
    return g;
  }
  for (let i = 0; i < FLOORS; i++) track(scaffoldLevel(i), floorStart(i) + 0.06, { t1: 0.9 + i * 0.008 });

  // ---------- tower crane ----------
  const crane = new THREE.Group();
  crane.position.set(6.2, 0, -5.4);
  const MAST = 11, S = 0.7;
  crane.add(box(1.6, 0.4, 1.6, concrete, 0, 0.2, 0));
  for (let y = 0.4; y < MAST; y += S) {
    const c = [V(-S / 2, y, -S / 2), V(S / 2, y, -S / 2), V(S / 2, y, S / 2), V(-S / 2, y, S / 2)];
    c.forEach((p, k) => {
      crane.add(beam(p, V(p.x, y + S, p.z), 0.07, red));
      const n = c[(k + 1) % 4];
      crane.add(beam(p, n, 0.04, red));
      crane.add(beam(p, V(n.x, y + S, n.z), 0.035, red));
    });
  }
  const slew = new THREE.Group();
  slew.position.y = MAST + 0.4;
  crane.add(slew);
  slew.add(box(0.9, 0.7, 0.8, yellow, 0.4, 0.1, 0.65));                 // cab
  slew.add(box(0.7, 0.5, 0.06, glass, 0.4, 0.15, 1.06));
  // jib (triangular truss) and counter-jib
  const JIB = 10;
  for (let x = -3.5; x < JIB; x += 0.8) {
    const a = V(x, 0, -0.25), b = V(x, 0, 0.25), t = V(x + 0.4, 0.55, 0);
    slew.add(beam(a, b, 0.04, yellow));
    slew.add(beam(a, t, 0.04, yellow)); slew.add(beam(b, t, 0.04, yellow));
  }
  slew.add(beam(V(-3.5, 0, -0.25), V(JIB, 0, -0.25), 0.07, yellow));
  slew.add(beam(V(-3.5, 0, 0.25), V(JIB, 0, 0.25), 0.07, yellow));
  slew.add(beam(V(-3.1, 0.55, 0), V(JIB, 0.55, 0), 0.06, yellow));
  slew.add(beam(V(0, 0, 0), V(0, 2.2, 0), 0.12, yellow));               // apex
  slew.add(beam(V(0, 2.2, 0), V(JIB * 0.7, 0.55, 0), 0.03, steel));
  slew.add(beam(V(0, 2.2, 0), V(-3.2, 0.3, 0), 0.03, steel));
  slew.add(box(1.0, 0.9, 0.9, concrete, -3.0, -0.35, 0));               // counterweight
  const beaconLamp = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), beacon);
  beaconLamp.position.set(0, 2.35, 0); slew.add(beaconLamp);
  const tipLamp = beaconLamp.clone(); tipLamp.position.set(JIB, 0.2, 0); slew.add(tipLamp);
  const trolley = box(0.4, 0.2, 0.6, dark, 5, -0.12, 0);
  slew.add(trolley);
  const cableGeo = new THREE.BoxGeometry(0.025, 1, 0.025); cableGeo.translate(0, -0.5, 0);
  const cable = new THREE.Mesh(cableGeo, steel);
  trolley.add(cable);
  const hook = new THREE.Group();
  hook.add(box(0.2, 0.25, 0.2, yellow, 0, 0, 0));
  hook.add(beam(V(0, -0.1, 0), V(-0.6, -0.6, 0), 0.02, steel), beam(V(0, -0.1, 0), V(0.6, -0.6, 0), 0.02, steel));
  for (let k = 0; k < 3; k++) hook.add(box(1.6, 0.1, 0.1, steel, 0, -0.65, -0.12 + k * 0.12));
  trolley.add(hook);
  track(crane, 0.10, { t1: 0.935, mode: "grow", dur: 0.05 });

  // ---------- excavator ----------
  const exc = new THREE.Group();
  exc.position.set(-6.4, 0.06, 4.6);
  exc.rotation.y = 0.5;
  exc.add(box(1.8, 0.35, 0.4, dark, 0, 0.18, -0.55), box(1.8, 0.35, 0.4, dark, 0, 0.18, 0.55));
  const house = new THREE.Group(); house.position.y = 0.4; exc.add(house);
  house.add(box(1.5, 0.55, 1.2, yellow, -0.15, 0.3, 0));
  house.add(box(0.6, 0.65, 0.55, yellow, 0.35, 0.85, 0.3));
  house.add(box(0.5, 0.45, 0.02, glass, 0.35, 0.9, 0.58));
  const boom = new THREE.Group(); boom.position.set(0.55, 0.5, -0.2); house.add(boom);
  const boomGeo = new THREE.BoxGeometry(1.9, 0.22, 0.22); boomGeo.translate(0.95, 0, 0);
  boom.add(new THREE.Mesh(boomGeo, yellow));
  const stick = new THREE.Group(); stick.position.x = 1.9; boom.add(stick);
  const stickGeo = new THREE.BoxGeometry(0.18, 1.3, 0.18); stickGeo.translate(0, -0.65, 0);
  stick.add(new THREE.Mesh(stickGeo, yellow));
  stick.add(box(0.45, 0.35, 0.4, dark, 0.1, -1.35, 0));
  track(exc, -1, { t1: 0.93, mode: "pop" });
  // dirt pile
  const pile = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.7, 14), M(0x9b7b55, { roughness: 1 }));
  pile.position.set(-8.1, 0.35, 2.4);
  track(pile, -1, { t1: 0.93, mode: "pop" });

  // ---------- truck ----------
  const truck = new THREE.Group();
  truck.position.set(-3.6, 0.06, 6.3);
  truck.add(box(0.9, 0.8, 1.0, M(0xe9e4da), 1.1, 0.6, 0), box(1.9, 0.5, 1.05, dark, -0.4, 0.55, 0));
  truck.add(box(0.05, 0.4, 0.8, glass, 1.56, 0.75, 0));
  [[-1, 0.5], [-1, -0.5], [1.1, 0.5], [1.1, -0.5]].forEach(([x, z]) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.18, 14), dark);
    w.rotation.x = Math.PI / 2; w.position.set(x, 0.22, z); truck.add(w);
  });
  for (let k = 0; k < 4; k++) truck.add(box(1.7, 0.1, 0.12, steel, -0.4, 0.86 + (k % 2) * 0.1, -0.3 + k * 0.18));
  track(truck, -1, { t1: 0.93, mode: "pop" });

  // ---------- materials yard ----------
  const yard = new THREE.Group();
  [[6.2, 4.6], [7.3, 4.6], [6.2, 5.8]].forEach(([x, z]) => { yard.add(box(0.9, 0.12, 0.9, plank, x, 0.12, z), box(0.8, 0.5, 0.8, brick, x, 0.43, z)); });
  for (let k = 0; k < 6; k++) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.2, 10), M(0x8f98a3, { metalness: 0.4 }));
    p.rotation.z = Math.PI / 2; p.position.set(7.0, 0.12 + (k > 2 ? 0.17 : 0), 7.0 + (k % 3) * 0.19); yard.add(p);
  }
  for (let k = 0; k < 5; k++) yard.add(box(2.4, 0.08, 0.25, plank, -0.5, 0.06 + k * 0.08, 6.6));
  // safety tape along the front
  for (let x = -8.5; x <= 8.6; x += 2.8) yard.add(post(0.06, 0.6, 0.06, scaffoldRail, x, 0, 7.6));
  yard.add(beam(V(-8.5, 0.55, 7.6), V(8.5, 0.55, 7.6), 0.03, tape));
  track(yard, -1, { t1: 0.93, mode: "pop" });

  // ---------- workers ----------
  function worker(x, z) {
    const g = new THREE.Group();
    g.position.set(x, 0.06, z);
    g.add(post(0.08, 0.3, 0.08, dark, -0.06, 0, 0), post(0.08, 0.3, 0.08, dark, 0.06, 0, 0));
    g.add(post(0.26, 0.32, 0.16, vest, 0, 0.3, 0));
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), skin); head.position.y = 0.72; g.add(head);
    const hat = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), yellow); hat.position.y = 0.75; g.add(hat);
    track(g, -1, { t1: 0.93, mode: "pop" });
    return g;
  }
  const walkers = [worker(-1.5, 5.2), worker(2.4, 5.6)];
  worker(-4.8, 5.4); worker(5.6, 5.2); worker(-5.2, 3.0);

  // ---------- landscaping ----------
  const trees = [], lamps = [];
  if (landscape) buildLandscape();
  function buildLandscape() {
    // trees: ones away from machinery grow while the building rises, the rest after the site is cleared
    const busy = [[-6.4, 4.6], [-3.6, 6.3], [6.6, 5.6], [-8.1, 2.4], [6.2, -5.4], [7.0, 7.2], [-0.5, 6.6]];
    const spots = [];
    for (let z = -6; z <= 6.1; z += 2.4) spots.push([-8.4, z], [8.4, z]);
    for (let x = -5.6; x <= 5.7; x += 2.8) spots.push([x, -7.0]);
    [-7.2, -4.6, 3.6, 6.4].forEach((x) => spots.push([x, 6.9]));
    const leafCols = [0x5c9a52, 0x6aa85a, 0x4f8a4b, 0x7cb15f];
    spots.forEach(([x, z], k) => {
      const clash = busy.some(([bx, bz]) => Math.hypot(bx - x, bz - z) < 2.0);
      const t0 = clash ? 0.935 + Math.random() * 0.04 : 0.14 + Math.random() * 0.74;
      const g = new THREE.Group();
      g.position.set(x + (Math.random() - 0.5) * 0.5, 0.06, z + (Math.random() - 0.5) * 0.5);
      const s = 0.8 + Math.random() * 0.5;
      const lm = M(leafCols[k % leafCols.length]);
      g.add(post(0.14, 0.7 * s, 0.14, plank, 0, 0, 0));
      if (k % 3 === 0) {
        const c = new THREE.Mesh(new THREE.ConeGeometry(0.6 * s, 1.7 * s, 10), lm); c.position.y = 1.3 * s; g.add(c);
      } else {
        const a = new THREE.Mesh(new THREE.SphereGeometry(0.65 * s, 14, 10), lm); a.position.y = 1.15 * s; g.add(a);
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.42 * s, 12, 8), lm); b.position.set(0.3 * s, 1.55 * s, 0.1); g.add(b);
      }
      g.userData.phase = Math.random() * 6;
      track(g, t0, { mode: "tree", dur: 0.06 });
      trees.push(g);
    });
    // entrance path, hedges, street lamps and rooftop solar panels at handover
    const pave = M(0xdcd6ca);
    track(post(1.4, 0.05, 4.6, pave, slabX, 0.03, 5.6), 0.94, { mode: "pop" });
    const hedge = M(0x4e8746);
    [-1.6, 0.8].forEach((x) => track(post(0.5, 0.35, 3.6, hedge, x, 0.05, 5.6), 0.95, { mode: "grow" }));
    [[-5.5, 4.6], [-2.4, 4.6], [1.6, 4.6], [4.8, 4.6], [5.0, -4.2], [-6.0, -4.2]].forEach(([x, z]) => {
      const g = new THREE.Group(); g.position.set(x, 0.05, z);
      g.add(post(0.08, 1.6, 0.08, dark, 0, 0, 0));
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), bulb); b.position.y = 1.7; g.add(b);
      const light = new THREE.PointLight(0xffc98a, 0, 7, 2); light.position.y = 1.6; g.add(light);
      track(g, 0.95, { mode: "grow" });
      lamps.push(light);
    });
    const pv = M(0x22344f, { roughness: 0.3, metalness: 0.6 });
    const solar = new THREE.Group(); solar.position.y = roofY + 0.22;
    for (let k = 0; k < 5; k++) [-2.3, 2.3].forEach((z) => {
      const panel = box(1.15, 0.05, 1.1, pv, slabX - 2.9 + k * 1.3, 0.35, z); panel.rotation.x = z > 0 ? 0.35 : -0.35;
      solar.add(panel, post(0.06, 0.3, 0.06, steel, slabX - 2.9 + k * 1.3, 0, z));
    });
    track(solar, 0.955, { mode: "pop" });
  }

  // ---------- effects: dust, completion sparkles, fireflies ----------
  const dotTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.4, "rgba(255,255,255,.6)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  function points(n, color, size, additive) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const mat = new THREE.PointsMaterial({ color, size, map: dotTex, transparent: true, opacity: 0, depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending });
    const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; scene.add(pts);
    return pts;
  }
  const fx = effects ? {
    dust: points(90, 0xcdb68e, 0.35, false),
    spark: points(220, 0xffcf6b, 0.32, true),
    flies: points(60, 0xd9ff8a, 0.28, true),
    seeds: Array.from({ length: 220 }, () => [Math.random(), Math.random(), Math.random()]),
    burst: -1, fired: false,
  } : null;

  const garden = new THREE.Group();
  [[-7.5, -5], [-7.5, -2], [-7.5, 1], [7.8, 1], [7.8, -2], [-2, 6.2], [2.5, 6.2]].forEach(([x, z]) => {
    garden.add(post(0.1, 0.5, 0.1, plank, x, 0, z));
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.6, 14, 10), leaf); c.position.set(x, 0.95, z); garden.add(c);
  });
  if (!landscape) track(garden, 0.94, { mode: "pop" });

  // ---------- progress driving ----------
  let target = progress, cur = 0;
  const listeners = [];
  const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  function apply(p) {
    anim.forEach((o) => {
      const a = o.userData.anim;
      let f = ease((p - a.t0) / a.dur);
      if (a.t1 !== null) f *= 1 - ease((p - a.t1) / a.dur);
      o.visible = f > 0.002;
      if (!o.visible) return;
      const removing = a.t1 !== null && p > a.t1;
      if (a.mode === "grow") removing ? o.scale.setScalar(f) : o.scale.set(1, f, 1);
      else if (a.mode === "pop") o.scale.setScalar(f);
      else if (a.mode === "tree") { const k = f - 1; o.scale.setScalar(Math.max(0.001, 1 + 2.70158 * k * k * k + 1.70158 * k * k)); }
      else { o.position.y = a.y + (1 - f) * 2.5; o.scale.setScalar(1); }
    });
    // raw concrete gets painted during finishing
    const paint = ease((p - 0.9) / 0.06);
    concrete.color.lerpColors(raw, painted, paint);
    slabMat.color.lerpColors(raw, painted, paint);
    led.color.copy(slabMat.color);
    if (landscape) sand.color.lerpColors(sandCol, lawn, ease((p - 0.93) / 0.06));
  }

  // ---------- day / night ----------
  let night = theme === "night" ? 1 : 0, nightTarget = night;
  const C = (h) => new THREE.Color(h);
  const DAY = { sky: C(0xffffff), ground: C(0x8a7a66), hemi: 1.1, sun: C(0xfff1dc), sunI: 2.4, pos: V(12, 22, 9) };
  const NIGHT = { sky: C(0x7f92cf), ground: C(0x1a2133), hemi: 0.5, sun: C(0x9fb2ff), sunI: 0.5, pos: V(-14, 18, 6) };
  function applyTheme(m) {
    hemi.color.lerpColors(DAY.sky, NIGHT.sky, m);
    hemi.groundColor.lerpColors(DAY.ground, NIGHT.ground, m);
    hemi.intensity = DAY.hemi + (NIGHT.hemi - DAY.hemi) * m;
    sun.color.lerpColors(DAY.sun, NIGHT.sun, m);
    sun.intensity = DAY.sunI + (NIGHT.sunI - DAY.sunI) * m;
    sun.position.lerpVectors(DAY.pos, NIGHT.pos, m);
    glassLit.emissiveIntensity = m * 1.5;
    bulb.emissiveIntensity = 0.2 + m * 2.2;
    led.emissiveIntensity = m * 2.2 * ease((cur - 0.9) / 0.06);
    lamps.forEach((l) => (l.intensity = m * 14));
  }

  // ---------- camera + controls ----------
  let theta = view.theta ?? 0.62, phi = view.phi ?? 1.05, radius = startRadius;
  const look = view.look ? V(...view.look) : V(0.4, 2.6, 0.4);
  let dragging = false, lastX = 0, lastY = 0, idle = 999;
  // every listener goes through `on` so dispose() can remove it (React mounts/unmounts components)
  const cleanups = [];
  const on = (target, type, fn, opts) => { target.addEventListener(type, fn, opts); cleanups.push(() => target.removeEventListener(type, fn, opts)); };
  if (interactive) {
    canvas.style.cursor = "grab";
    on(canvas, "pointerdown", (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.style.cursor = "grabbing"; });
    on(window, "pointerup", () => { dragging = false; canvas.style.cursor = "grab"; });
    on(window, "pointermove", (e) => {
      if (!dragging) return;
      theta -= (e.clientX - lastX) * 0.006;
      phi = Math.min(1.4, Math.max(0.55, phi - (e.clientY - lastY) * 0.004));
      lastX = e.clientX; lastY = e.clientY; idle = 0;
    });
    // zoom only with Ctrl/⌘ + wheel so normal page scrolling is never hijacked
    on(canvas, "wheel", (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault(); radius = Math.min(70, Math.max(24, radius + e.deltaY * 0.02));
    }, { passive: false });
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  resize();

  // only render while visible on screen (saves battery on phones)
  let onScreen = true;
  const visibilityObserver = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
  visibilityObserver.observe(canvas);
  // respect "reduce motion": jump straight to the target instead of animating the build
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const frameListeners = [];
  const tmp = new THREE.Vector3();
  const clock = new THREE.Clock();
  let t = 0;
  let rafId = 0;
  function frame() {
    rafId = requestAnimationFrame(frame);
    const realDt = Math.min(clock.getDelta(), 0.5);
    if (!onScreen) return;
    const dt = Math.min(realDt, 0.05);
    t += dt; idle++;

    // move the displayed progress toward the target at a steady pace (real time, so slow devices keep up)
    const step = reduceMotion ? 1 : speed * realDt;
    if (Math.abs(target - cur) > 0.0005) {
      cur += Math.sign(target - cur) * Math.min(step, Math.abs(target - cur));
      apply(cur);
      listeners.forEach((fn) => fn(cur));
    }

    // crane slews, trolley travels, hook raises and lowers
    slew.rotation.y = -2.0 + Math.sin(t * 0.3) * 0.7;
    trolley.position.x = 5.2 + Math.sin(t * 0.45) * 2.6;
    const drop = 3.2 + Math.sin(t * 0.7) * 1.6;
    cable.scale.y = drop;
    hook.position.y = -drop;
    // excavator digs
    house.rotation.y = Math.sin(t * 0.35) * 0.6;
    boom.rotation.z = 0.35 + Math.sin(t * 1.1) * 0.22;
    stick.rotation.z = -0.5 + Math.sin(t * 1.1 + 1.2) * 0.35;
    // workers walk back and forth
    walkers[0].position.x = -1.5 + Math.sin(t * 0.5) * 2.2;
    walkers[0].rotation.y = Math.cos(t * 0.5) > 0 ? Math.PI / 2 : -Math.PI / 2;
    walkers[1].position.z = 5.6 + Math.sin(t * 0.4 + 1) * 0.9;

    // day/night crossfade
    night += (nightTarget - night) * Math.min(1, realDt * 2.5);
    applyTheme(night);
    const blink = (Math.sin(t * 4) > 0.6 ? 1 : 0.15);
    beacon.emissiveIntensity = (0.3 + night * 2.5) * blink;
    // trees sway a little in the breeze
    trees.forEach((g) => { g.rotation.z = Math.sin(t * 1.3 + g.userData.phase) * 0.025; });
    if (fx) updateEffects(realDt);

    if (!dragging && idle > 180) theta += dt * 0.08;
    camera.position.set(
      look.x + radius * Math.sin(phi) * Math.sin(theta),
      look.y + radius * Math.cos(phi),
      look.z + radius * Math.sin(phi) * Math.cos(theta)
    );
    camera.lookAt(look);
    renderer.render(scene, camera);
    frameListeners.forEach((fn) => fn(cur));
  }

  function updateEffects(dt) {
    const { dust, spark, flies, seeds } = fx;
    // dust drifts up around the rising frame while work is happening
    const active = ease((cur - 0.12) / 0.04) * (1 - ease((cur - 0.88) / 0.05));
    dust.material.opacity = active * (0.55 - night * 0.3);
    const top = footY + Math.min(FLOORS, Math.max(0.6, (cur - 0.25) / 0.09 + 0.6)) * H;
    const dp = dust.geometry.attributes.position;
    for (let i = 0; i < dp.count; i++) {
      const [a, b, c] = seeds[i], k = (c + t * 0.12) % 1;
      const side = i % 4, u = a * 8 - 4.4;
      const x = side === 0 ? u : side === 1 ? 4.0 : side === 2 ? u : -4.9;
      const z = side === 0 ? 3.9 : side === 1 ? b * 7 - 3.5 : side === 2 ? -3.7 : b * 7 - 3.5;
      dp.setXYZ(i, x + Math.sin(t + i) * 0.3, k * top, z + Math.cos(t * 0.8 + i) * 0.3);
    }
    dp.needsUpdate = true;
    // golden sparkle burst from the roof when the building is completed
    if (cur >= 0.975 && !fx.fired) { fx.fired = true; fx.burst = 0; }
    if (cur < 0.9) fx.fired = false;
    const sp = spark.geometry.attributes.position;
    if (fx.burst >= 0) {
      fx.burst += dt;
      const T = fx.burst;
      for (let i = 0; i < sp.count; i++) {
        const [a, b, c] = seeds[i], ang = a * Math.PI * 2, out = 1.5 + b * 4.5;
        sp.setXYZ(i, slabX + Math.cos(ang) * out * T, roofY + 0.5 + (4 + c * 6) * T - 4.9 * T * T, Math.sin(ang) * out * T);
      }
      sp.needsUpdate = true;
      spark.material.opacity = Math.max(0, 1 - T / 2.2);
      if (T > 2.2) fx.burst = -1;
    } else spark.material.opacity = 0;
    // fireflies drift around the trees at night once landscaping is in
    const fp = flies.geometry.attributes.position;
    for (let i = 0; i < fp.count; i++) {
      const [a, b, c] = seeds[i];
      const side = i % 3;
      const bx = side === 0 ? -8.0 + b : side === 1 ? 8.0 - b : a * 14 - 7;
      const bz = side === 2 ? -6.4 - b : a * 13 - 6.5;
      fp.setXYZ(i, bx + Math.sin(t * 0.7 + i) * 0.8, 0.6 + c * 2 + Math.sin(t * 1.3 + i * 2) * 0.3, bz + Math.cos(t * 0.5 + i) * 0.8);
    }
    fp.needsUpdate = true;
    flies.material.opacity = night * ease((cur - 0.2) / 0.1) * (0.65 + Math.sin(t * 3) * 0.25);
  }
  apply(0);
  frame();

  return {
    // free GPU memory and stop everything; call when the React component unmounts
    dispose() {
      cancelAnimationFrame(rafId);
      cleanups.forEach((fn) => fn());
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      scene.traverse((o) => {
        o.geometry?.dispose();
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m?.dispose());
      });
      dotTex.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      listeners.length = 0; frameListeners.length = 0;
    },
    setProgress(p) { target = Math.max(0, Math.min(1, p)); },
    replay() { if (target < 0.05) target = 1; cur = 0; apply(0); },
    jump(p) { target = cur = p; apply(p); listeners.forEach((fn) => fn(cur)); },
    // subscribe to progress / per-frame updates; each returns an unsubscribe function
    onProgress(fn) { listeners.push(fn); return () => listeners.splice(listeners.indexOf(fn) >>> 0, 1); },
    onFrame(fn) { frameListeners.push(fn); return () => frameListeners.splice(frameListeners.indexOf(fn) >>> 0, 1); },
    setTheme(name, instant = false) { nightTarget = name === "night" ? 1 : 0; if (instant) { night = nightTarget; applyTheme(night); } },
    // world point -> pixel position inside the canvas (for HTML labels that follow the 3D model)
    project([x, y, z]) {
      tmp.set(x, y, z).project(camera);
      return { x: (tmp.x + 1) / 2 * canvas.clientWidth, y: (1 - tmp.y) / 2 * canvas.clientHeight, behind: tmp.z > 1 };
    },
    get progress() { return cur; },
  };
}
