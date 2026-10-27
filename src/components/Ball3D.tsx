"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type Pose = { x: number; y: number; s: number };

// Ball pose per scroll stop (x/y in viewport fractions, s = scale)
const POSES: Pose[] = [
  { x: 0.18, y: -0.02, s: 1.15 },
  { x: -0.26, y: 0.0, s: 0.8 },
  { x: 0.28, y: 0.05, s: 0.7 },
  { x: -0.22, y: 0.0, s: 0.85 },
  { x: 0.0, y: 0.08, s: 1.25 },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function Ball3D({ ready }: { ready: boolean }) {
  const mount = useRef<HTMLDivElement>(null);
  const readyRef = useRef(ready);
  readyRef.current = ready;

  useEffect(() => {
    const el = mount.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(30, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 10);

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 5, 6);
    const rim = new THREE.DirectionalLight(0xffb27a, 3);
    rim.position.set(-6, -2, -4);
    scene.add(key, rim, new THREE.AmbientLight(0xffe2cc, 0.4));

    // Pivot = scroll-driven position; spinner = scroll-driven rotation
    const pivot = new THREE.Group();
    const spinner = new THREE.Group();
    pivot.add(spinner);
    scene.add(pivot);

    // Contact shadow
    const shadowTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const g = c.getContext("2d")!;
      const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grd.addColorStop(0, "rgba(18,10,6,0.55)");
      grd.addColorStop(1, "rgba(18,10,6,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    })();
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 0.7),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }),
    );
    shadow.position.set(0, -1.25, -0.5);
    pivot.add(shadow);

    new GLTFLoader().load("/models/ball.glb", (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      const wrap = new THREE.Group();
      wrap.add(model);
      wrap.scale.setScalar(2 / (size / Math.sqrt(3)));
      spinner.add(wrap);
    });

    const target = { rx: 0, ry: 0, x: 0, y: 0, s: 1 };
    const cur = { rx: 0, ry: 0, x: 0, y: 0, s: 0, intro: 0 };
    const mouse = { x: 0, y: 0 };

    const viewSize = () => {
      const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      return { w: h * camera.aspect, h };
    };

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      // Scroll drives rotation: ~3 full turns forward, 1.25 sideways over the page
      target.rx = p * Math.PI * 6;
      target.ry = p * Math.PI * 2.5;
      const seg = p * (POSES.length - 1);
      const i = Math.min(Math.floor(seg), POSES.length - 2);
      const t = ease(seg - i);
      const a = POSES[i], b = POSES[i + 1];
      const mobile = window.innerWidth < 768;
      const v = viewSize();
      target.x = lerp(a.x, b.x, t) * v.w * (mobile ? 0.35 : 1);
      target.y = lerp(a.y, b.y, t) * v.h + (mobile ? -v.h * 0.18 : 0);
      target.s = lerp(a.s, b.s, t) * (mobile ? 0.7 : 1);
    };
    const onMouse = (e: PointerEvent) => {
      mouse.x = e.clientX / window.innerWidth - 0.5;
      mouse.y = e.clientY / window.innerHeight - 0.5;
    };
    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
      onScroll();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMouse);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const k = 1 - Math.pow(0.0015, dt);
      cur.intro = lerp(cur.intro, readyRef.current ? 1 : 0, 1 - Math.pow(0.02, dt));
      cur.rx = lerp(cur.rx, target.rx, k);
      cur.ry = lerp(cur.ry, target.ry, k);
      cur.x = lerp(cur.x, target.x, k);
      cur.y = lerp(cur.y, target.y, k);
      cur.s = lerp(cur.s, target.s, k);

      const t = clock.elapsedTime;
      spinner.rotation.x = cur.rx + mouse.y * 0.4 + (1 - cur.intro) * 4;
      spinner.rotation.y = cur.ry + mouse.x * 0.6;
      spinner.rotation.z = Math.sin(t * 0.6) * 0.08;
      pivot.position.set(cur.x, cur.y + Math.sin(t * 1.2) * 0.04 - (1 - cur.intro) * 3, 0);
      pivot.scale.setScalar(cur.s * cur.intro);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMouse);
      renderer.dispose();
      pmrem.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mount} className="pointer-events-none fixed inset-0 z-20" aria-hidden />;
}
