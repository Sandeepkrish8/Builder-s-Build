// Interactive 3D apartment tower built with Three.js.
// Drag to rotate, hover/click a floor to highlight it.
import * as THREE from "./vendor/three.module.min.js";

export function mountScene(canvas, { autoRotate = true } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x1a2638, 38, 80);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 200);

  // ---- Lights ----
  scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x2a3240, 0.9));
  const sun = new THREE.DirectionalLight(0xffe2b0, 2.2);
  sun.position.set(14, 26, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22 });
  scene.add(sun);

  // ---- Ground ----
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(30, 64),
    new THREE.MeshStandardMaterial({ color: 0x2c3a2f, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const plaza = new THREE.Mesh(
    new THREE.BoxGeometry(16, 0.12, 12),
    new THREE.MeshStandardMaterial({ color: 0xd9d2c5, roughness: 0.9 })
  );
  plaza.position.y = 0.06;
  plaza.receiveShadow = true;
  scene.add(plaza);

  // ---- Materials ----
  const concrete = new THREE.MeshStandardMaterial({ color: 0xf1ece4, roughness: 0.8 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x5f86b3, roughness: 0.15, metalness: 0.6, emissive: 0x0c1a2c });
  const litGlass = new THREE.MeshStandardMaterial({ color: 0xffd38a, roughness: 0.3, emissive: 0x8a5a14, emissiveIntensity: 0.6 });
  const highlight = new THREE.MeshStandardMaterial({ color: 0xe0a43a, roughness: 0.4, emissive: 0x7a4e0a, emissiveIntensity: 0.9 });
  const rail = new THREE.MeshStandardMaterial({ color: 0x2a3749, roughness: 0.5, metalness: 0.4 });

  // ---- Tower builder ----
  const floors = [];
  function tower(x, z, levels, w, d, name) {
    const group = new THREE.Group();
    group.position.set(x, 0.12, z);
    const h = 0.9;
    for (let i = 0; i < levels; i++) {
      const floor = new THREE.Group();
      floor.position.y = i * h;
      const slab = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.14, d + 0.3), concrete);
      slab.position.y = h - 0.07;
      slab.castShadow = true; slab.receiveShadow = true;
      floor.add(slab);
      const lit = Math.random() > 0.72;
      const core = new THREE.Mesh(new THREE.BoxGeometry(w, h - 0.14, d), lit ? litGlass : glass);
      core.position.y = (h - 0.14) / 2;
      core.castShadow = true;
      floor.add(core);
      // vertical fins
      for (let f = -w / 2; f <= w / 2 + 0.01; f += w / 4) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, h - 0.14, d + 0.12), concrete);
        fin.position.set(f, (h - 0.14) / 2, 0);
        fin.castShadow = true;
        floor.add(fin);
      }
      // balcony rail
      const r = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.22, 0.04), rail);
      r.position.set(0, 0.11, d / 2 + 0.15);
      floor.add(r);
      floor.userData = { tower: name, level: i + 1, core, base: core.material };
      group.add(floor);
      floors.push(floor);
    }
    // roof crown
    const crown = new THREE.Mesh(new THREE.BoxGeometry(w * 0.6, 0.6, d * 0.6), concrete);
    crown.position.y = levels * h + 0.3;
    crown.castShadow = true;
    group.add(crown);
    scene.add(group);
    return group;
  }

  tower(-3.2, -0.8, 18, 3.4, 3.4, "Tower A");
  tower(2.6, 0.6, 14, 3.0, 3.0, "Tower B");
  tower(6.6, -2.8, 9, 2.6, 2.6, "Tower C");

  // ---- Trees ----
  const leaf = new THREE.MeshStandardMaterial({ color: 0x4f8a4b, roughness: 0.9 });
  const trunk = new THREE.MeshStandardMaterial({ color: 0x5b4636 });
  [[-7.5, 4], [-6, 5.2], [-1, 5.4], [1.2, 5.6], [6, 4.4], [8.5, 2.5], [-8.5, -1], [-7.5, -4.5]].forEach(([x, z]) => {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.7), trunk);
    t.position.set(x, 0.35, z);
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), leaf);
    c.position.set(x, 1.0, z);
    c.castShadow = t.castShadow = true;
    scene.add(t, c);
  });

  // ---- Tower crane (construction in progress) ----
  const yellow = new THREE.MeshStandardMaterial({ color: 0xf2b134, roughness: 0.6 });
  const crane = new THREE.Group();
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.25, 12, 0.25), yellow);
  mast.position.y = 6;
  const jib = new THREE.Mesh(new THREE.BoxGeometry(7, 0.22, 0.22), yellow);
  jib.position.set(1.6, 12, 0);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.5), yellow);
  cab.position.set(0, 11.6, 0);
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 3), rail);
  cable.position.set(4, 10.5, 0);
  crane.add(mast, jib, cab, cable);
  crane.children.forEach((m) => (m.castShadow = true));
  crane.position.set(9.5, 0, -5.5);
  crane.rotation.y = 0.6;
  scene.add(crane);

  // ---- Interaction: orbit by drag + floor picking ----
  let theta = 0.75, phi = 1.12, radius = 34;
  const target = new THREE.Vector3(1.5, 6.5, 0);
  let dragging = false, lastX = 0, lastY = 0, idle = 0;

  canvas.addEventListener("pointerdown", (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; });
  window.addEventListener("pointerup", () => (dragging = false));
  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    theta -= (e.clientX - lastX) * 0.006;
    phi = Math.min(1.45, Math.max(0.6, phi - (e.clientY - lastY) * 0.004));
    lastX = e.clientX; lastY = e.clientY; idle = 0;
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let selected = null;
  // Glowing band that wraps the selected floor so it stands out from every angle
  const band = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xf3c56b, transparent: true, opacity: 0.55, depthWrite: false })
  );
  band.visible = false;
  scene.add(band);
  function select(floor) {
    if (selected) selected.userData.core.material = selected.userData.base;
    selected = floor;
    band.visible = !!floor;
    if (floor) {
      floor.userData.core.material = highlight;
      const box = new THREE.Box3().setFromObject(floor);
      box.getCenter(band.position);
      const size = box.getSize(new THREE.Vector3());
      band.scale.set(size.x + 0.25, size.y + 0.05, size.z + 0.25);
    }
    canvas.dispatchEvent(new CustomEvent("floorselect", { detail: floor ? floor.userData : null }));
  }
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(floors, true)[0];
    let obj = hit && hit.object;
    while (obj && !obj.userData.level) obj = obj.parent;
    select(obj || null);
  });

  // Default selection for the preview: Tower B, floor 12
  scene.updateMatrixWorld(true);
  select(floors.find((f) => f.userData.tower === "Tower B" && f.userData.level === 12));

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  function frame() {
    idle++;
    if (autoRotate && !dragging && idle > 120) theta += 0.0015;
    camera.position.set(
      target.x + radius * Math.sin(phi) * Math.sin(theta),
      target.y + radius * Math.cos(phi),
      target.z + radius * Math.sin(phi) * Math.cos(theta)
    );
    camera.lookAt(target);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  frame();

  return { select };
}
