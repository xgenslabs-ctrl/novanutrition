// The page's 3D layer: one fixed, full-screen WebGL canvas.
//
// MAIN TUB: follows a chain of "anchor" elements ([data-tub]) down the page and
//   glides between them as you scroll (hero → spin → range lineup → sizes).
// FOLLOWERS: side tubs pinned to a single element ([data-side]).
//   They scroll with that element and never travel, so in the range lineup the
//   two side tubs stay behind while the main tub moves on to "Choose your size".
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { drawLabel } from './label.js';

const BODY_H = 2.3;
const TUB_H = 3.2; // body + lid, plus room for the tilt so the tub stays inside its anchor box
const FOV = 28;
const CAM_Z = 12;

const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => t * t * (3 - 2 * t);
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function createTub({ canvas, images, reducedMotion }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, CAM_Z);

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 4, 6);
  const rim = new THREE.DirectionalLight(0x3d8bff, 5);
  rim.position.set(-5, 2, -3);
  const rim2 = new THREE.DirectionalLight(0x3d8bff, 3);
  rim2.position.set(5, -1, -4);
  scene.add(key, rim, rim2);

  // ---------- shared materials ----------
  const black = new THREE.MeshPhysicalMaterial({ color: 0x08090b, roughness: 0.3, metalness: 0.4, clearcoat: 1, clearcoatRoughness: 0.15 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xdfe3e8, roughness: 0.16, metalness: 1 });

  // ---------- tub factory ----------
  const ridgeGeo = new THREE.BoxGeometry(0.03, 0.34, 0.05);
  function makeTub() {
    const labelCanvas = document.createElement('canvas');
    const tex = new THREE.CanvasTexture(labelCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAniso;

    const group = new THREE.Group();
    const spinner = new THREE.Group();
    group.add(spinner);

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 0.95, BODY_H, 128, 1, true, -Math.PI, Math.PI * 2),
      new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.42, metalness: 0.15, clearcoat: 0.7, clearcoatRoughness: 0.25 })
    );
    body.position.y = -0.21;
    const lidY = BODY_H / 2;
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.42, 128), black);
    lid.position.y = lidY;
    const lidTop = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 1.05, 0.04, 128), black);
    lidTop.position.y = lidY + 0.23;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.03, 0.03, 16, 128), chromeMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = BODY_H / 2 - 0.22;
    const ring2 = ring.clone();
    ring2.position.y = lidY + 0.19;
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.95, 64), black);
    bottom.rotation.x = Math.PI / 2;
    bottom.position.y = -BODY_H / 2 - 0.21;
    const ridges = new THREE.InstancedMesh(ridgeGeo, black, 72);
    const m = new THREE.Matrix4();
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      m.makeRotationY(-a).setPosition(Math.sin(a) * 1.06, lidY, Math.cos(a) * 1.06);
      ridges.setMatrixAt(i, m);
    }
    spinner.add(body, lid, lidTop, ring, ring2, bottom, ridges);
    return {
      group, spinner,
      setLabel(product, size) { drawLabel(labelCanvas, product, size, images); tex.needsUpdate = true; },
    };
  }

  // ---------- objects ----------
  const main = makeTub();
  scene.add(main.group);
  const sides = [makeTub(), makeTub()];
  sides.forEach((s) => { s.group.visible = false; scene.add(s.group); });

  // ---------- state ----------
  const s = {
    x: 0, y: 0, scale: 0.001, rot: 0, tiltX: 0, tiltY: 0,
    extraRot: 0, sideRot: 0, sizeMul: 1, bodyScale: 1, intro: 0,
    pointerX: 0, pointerY: 0,
  };
  const sideScale = [1, 1];
  let anchors = [];
  let spinEl = null;
  let followers = []; // { el, obj, worldH, scaleRef, rotY, rotX }
  let w = 0, h = 0, k = 1;

  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    k = (2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) / h;
  }
  resize();
  window.addEventListener('resize', resize);

  function setAnchors(list, spinSection) { anchors = list; spinEl = spinSection; }

  function setFollowers({ sideEls = [] }) {
    followers = [];
    sideEls.forEach((el, i) => followers.push({ el, obj: sides[i], worldH: TUB_H, scale: () => sideScale[i], side: i }));
  }

  function setLabel(product, size) { main.setLabel(product, size); }
  function setSides(products) {
    products.forEach((p, i) => { sides[i].setLabel(p, p.sizes[1]); sideScale[i] = p.bodyScale; });
  }
  function setAccent(hex) {
    const c = new THREE.Color(hex);
    rim.color.copy(c); rim2.color.copy(c);
  }

  function target() {
    if (!anchors.length) return null;
    const c = h / 2;
    const pts = anchors.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height, rot: parseFloat(el.dataset.rot || 0) };
    });
    let a = pts[0], b = pts[0], t = 0;
    if (c >= pts[pts.length - 1].y) { a = b = pts[pts.length - 1]; }
    else if (c > pts[0].y) {
      for (let i = 0; i < pts.length - 1; i++) {
        if (c >= pts[i].y && c < pts[i + 1].y) {
          a = pts[i]; b = pts[i + 1];
          t = ease(clamp((c - a.y) / (b.y - a.y)));
          break;
        }
      }
    }
    let spin = 0;
    if (spinEl) {
      const r = spinEl.getBoundingClientRect();
      spin = clamp(-r.top / (r.height - h));
    }
    return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), hpx: lerp(a.h, b.h, t), rot: lerp(a.rot, b.rot, t) + ease(spin) * Math.PI * 2 };
  }

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    s.pointerX = (e.clientX / w) * 2 - 1;
    s.pointerY = (e.clientY / h) * 2 - 1;
  });

  const clock = new THREE.Clock();
  let first = true;
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const tg = target();
    if (tg) {
      const goal = { x: (tg.x - w / 2) * k, y: -(tg.y - h / 2) * k, scale: (tg.hpx * k) / TUB_H, rot: tg.rot };
      const damp = first || reducedMotion ? 1 : 1 - Math.exp(-dt * 7);
      s.x = lerp(s.x, goal.x, damp);
      s.y = lerp(s.y, goal.y, damp);
      s.scale = lerp(s.scale, goal.scale, damp);
      s.rot = lerp(s.rot, goal.rot, damp);
      first = false;
    }
    const tdamp = 1 - Math.exp(-dt * 4);
    s.tiltX = lerp(s.tiltX, reducedMotion ? 0 : s.pointerY * 0.08, tdamp);
    s.tiltY = lerp(s.tiltY, reducedMotion ? 0 : s.pointerX * 0.25, tdamp);

    const bob = reducedMotion ? 0 : Math.sin(t * 1.1) * 0.05;
    main.group.position.set(s.x, s.y + bob + (1 - s.intro) * 1.2, 0);
    main.group.scale.setScalar(Math.max(s.scale * s.sizeMul * s.bodyScale * (0.6 + 0.4 * s.intro), 0.0001));
    main.group.rotation.set(0.12 + s.tiltX, 0, -0.06 + Math.sin(t * 0.7) * (reducedMotion ? 0 : 0.015));
    main.spinner.rotation.y = s.rot + s.extraRot + s.tiltY + (1 - s.intro) * -1.6;

    // followers sit exactly on their element (they scroll with the page)
    for (const f of followers) {
      const r = f.el.getBoundingClientRect();
      const onScreen = r.bottom > -h * 0.2 && r.top < h * 1.2 && r.height > 0;
      f.obj.group.visible = onScreen && s.intro > 0.99;
      if (!f.obj.group.visible) continue;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const drift = (cy - h / 2) / h; // -0.5..0.5 while passing through the viewport
      f.obj.group.position.set((cx - w / 2) * k, -(cy - h / 2) * k + (reducedMotion ? 0 : Math.sin(t * 1.1 + (f.side || 0) * 2) * 0.04), -0.5);
      f.obj.group.scale.setScalar(((r.height * k) / f.worldH) * f.scale());
      const baseRot = parseFloat(f.el.dataset.rot || 0);
      f.obj.group.rotation.set(0.12 + s.tiltX, 0, parseFloat(f.el.dataset.lean || 0));
      f.obj.spinner.rotation.y = baseRot + s.sideRot + drift * 0.4 + s.tiltY * 0.5;
    }

    canvas.style.opacity = s.intro;
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return { state: s, setAnchors, setFollowers, setLabel, setSides, setAccent };
}
