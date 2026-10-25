"use client";

import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  ContactShadows,
  Environment,
  Lightformer,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";

/**
 * Hero 3D — "Precision instrument".
 * A single deliberate composition: the user-supplied Rod of Asclepius
 * (GLB) rebuilt as two material groups — a polished GOLD staff and a
 * glossy WHITE serpent with YELLOW eyes on its own head — height-
 * normalized and centred on a showcase turntable with a vitals pulse,
 * held inside a machined orbit ring with a small satellite, flanked by
 * two frosted-glass capsules. On narrow viewports the instrument scales
 * down and hugs the right edge so it peeks into the hero without
 * covering the headline.
 */

const STEEL = "#b9cec2";
const ICE = "#b9e2cc";

/** User-uploaded Rod of Asclepius model, served from /public/models. */
const GLB_URL = "/models/medical-symbol.glb";
useGLTF.preload(GLB_URL);

/* ---- model rebuild: the GLB is one merged texture-baked mesh, so it is
   split at load time into gold (staff) / white (serpent) triangles by
   radial distance from the staff axis, plus yellow eyes on the head. ---- */
const SNAKE_CUT = 0.042; // staff surface ≈ 0.031, serpent coils ≥ 0.05
const SNAKE_Y = 0.86;    // above this height everything is serpent (head ball sits on the axis)

const GOLD_MAT = new THREE.MeshPhysicalMaterial({
  color: "#d9b24a",
  metalness: 1,
  roughness: 0.24,
  clearcoat: 0.5,
  clearcoatRoughness: 0.25,
  envMapIntensity: 1.7,
});
const SNAKE_MAT = new THREE.MeshPhysicalMaterial({
  color: "#f6f8f5",
  metalness: 0.02,
  roughness: 0.3,
  clearcoat: 0.9,
  clearcoatRoughness: 0.22,
  envMapIntensity: 1.1,
  emissive: "#e8efe9",
  emissiveIntensity: 0.05,
});
const EYE_MAT = new THREE.MeshStandardMaterial({
  color: "#ffd21f",
  emissive: "#ffb300",
  emissiveIntensity: 0.6,
  roughness: 0.25,
});
const EYE_GEO = new THREE.SphereGeometry(0.0125, 20, 14);
// the serpent's sculpted eye bumps sit on the upper sides of its head
// (just below the finial collar) — positions are the bilateral relief
// clusters found by Laplacian protrusion detection, verified with
// probe-sphere renders from six angles
const EYE_OFFSETS: [number, number, number][] = [
  [-0.008, 0.834, 0.064],
  [-0.006, 0.839, -0.052],
];

/** Tracks the pointer on the window so the 3D rig works even when the
 *  canvas sits under overlay text with pointer-events disabled. */
function usePointer() {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return pointer;
}

/** Gentle parallax rig — the whole composition leans towards the cursor. */
function Rig({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const pointer = usePointer();
  useFrame((_, delta) => {
    if (!ref.current) return;
    const t = pointer.current;
    ref.current.rotation.y = THREE.MathUtils.damp(
      ref.current.rotation.y,
      t.x * 0.16,
      1.8,
      delta
    );
    ref.current.rotation.x = THREE.MathUtils.damp(
      ref.current.rotation.x,
      -t.y * 0.09,
      1.8,
      delta
    );
  });
  return <group ref={ref}>{children}</group>;
}

/** The rod + ring assembly, slowly presenting itself. */
function Instrument() {
  const spin = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);
  const satellite = useRef<THREE.Mesh>(null);
  const isNarrow = useThree((s) => s.size.width) < 768;

  const { scene } = useGLTF(GLB_URL);
  const rodModel = useMemo(() => {
    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];
    scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
    });
    const src = meshes[0];
    if (src) {
      const geo = src.geometry;
      const pos = geo.attributes.position as THREE.BufferAttribute;
      const index = geo.index;
      const triCount = index ? index.count / 3 : pos.count / 3;
      const rodTris: number[] = [];
      const snakeTris: number[] = [];
      const rAt = (vi: number) => Math.hypot(pos.getX(vi), pos.getZ(vi));
      for (let t = 0; t < triCount; t++) {
        const a = index ? index.getX(t * 3) : t * 3;
        const b = index ? index.getX(t * 3 + 1) : t * 3 + 1;
        const c = index ? index.getX(t * 3 + 2) : t * 3 + 2;
        const r = (rAt(a) + rAt(b) + rAt(c)) / 3;
        const snake = pos.getY(a) > SNAKE_Y || r >= SNAKE_CUT;
        (snake ? snakeTris : rodTris).push(a, b, c);
      }
      const buildGeo = (tris: number[]) => {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", pos);
        if (geo.attributes.normal) g.setAttribute("normal", geo.attributes.normal);
        if (geo.attributes.uv) g.setAttribute("uv", geo.attributes.uv);
        g.setIndex(tris);
        return g;
      };
      group.add(
        new THREE.Mesh(buildGeo(rodTris), GOLD_MAT),
        new THREE.Mesh(buildGeo(snakeTris), SNAKE_MAT)
      );
      // yellow eyes on the serpent's actual head (not the rod finial)
      for (const p of EYE_OFFSETS) {
        const eye = new THREE.Mesh(EYE_GEO, EYE_MAT);
        eye.position.set(p[0], p[1], p[2]);
        group.add(eye);
      }
    }
    // normalize: 4 world units tall, centred on the spin pivot
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = 4.0 / (size.y || 1);
    group.scale.setScalar(s);
    group.position.copy(center).multiplyScalar(-s);
    return group;
  }, [scene]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (spin.current) {
      // showcase turntable — a full slow spin lets the model read from
      // every angle, with a gentle tilt drift so it never feels mechanical
      spin.current.rotation.y = t * 0.3;
      spin.current.rotation.x = 0.05 + Math.sin(t * 0.16) * 0.055;
      spin.current.rotation.z = Math.sin(t * 0.11) * 0.03;
      // vitals pulse — soft double-thump every ~4.8s (lub-dub)
      const p = t % 4.8;
      const thump =
        (p < 0.24 ? Math.sin((p / 0.24) * Math.PI) * 0.05 : 0) +
        (p > 0.34 && p < 0.58 ? Math.sin(((p - 0.34) / 0.24) * Math.PI) * 0.03 : 0);
      spin.current.scale.setScalar(1 + thump);
      spin.current.position.y = Math.sin(t * 0.55) * 0.09 + thump * 0.07;
    }
    if (ring.current) {
      ring.current.rotation.z += delta * 0.14;
    }
    if (satellite.current) {
      const a = t * 0.5;
      satellite.current.position.set(Math.cos(a) * 2.35, Math.sin(a) * 2.35, 0);
    }
  });

  return (
    <group
      position={isNarrow ? [1.22, 0.1, 0] : [2.15, 0.15, 0]}
      scale={isNarrow ? 0.58 : 1}
    >
      {/* orbit rings — machined steel gimbal pair, tilted like a gyroscope */}
      <group ref={ring} rotation={[1.18, 0.28, 0.32]}>
        <mesh>
          <torusGeometry args={[2.35, 0.042, 20, 128]} />
          <meshStandardMaterial
            color={STEEL}
            metalness={0.88}
            roughness={0.16}
            envMapIntensity={1.5}
          />
        </mesh>
        <mesh rotation={[0.22, 0, 0]}>
          <torusGeometry args={[2.68, 0.016, 16, 128]} />
          <meshStandardMaterial
            color="#90c9ad"
            metalness={0.85}
            roughness={0.24}
            envMapIntensity={1.4}
          />
        </mesh>
        {/* satellite rides the ring plane */}
        <mesh ref={satellite}>
          <sphereGeometry args={[0.13, 32, 32]} />
          <meshPhysicalMaterial
            color="#35b06a"
            emissive="#1d7a44"
            emissiveIntensity={0.3}
            roughness={0.12}
            metalness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.08}
            envMapIntensity={1.7}
          />
        </mesh>
      </group>

      {/* the rod — user-supplied Rod of Asclepius GLB, height-normalized
          and centred so the turntable spins it around its own axis */}
      <group ref={spin}>
        <Suspense fallback={null}>
          <primitive object={rodModel} />
        </Suspense>
      </group>
    </group>
  );
}

/** Frosted glass capsule — quiet, premium, counter-phased bobbing. */
function GlassCapsule({
  position,
  scale = 1,
  phase = 0,
}: {
  position: [number, number, number];
  scale?: number;
  phase?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      ref.current.position.y = position[1] + Math.sin(t * 0.6 + phase) * 0.12;
      ref.current.rotation.z = 0.62 + Math.sin(t * 0.3 + phase) * 0.06;
    }
  });
  return (
    <mesh ref={ref} position={position} rotation={[0.12, 0.4, 0.62]} scale={scale}>
      {/* frosted shell */}
      <capsuleGeometry args={[0.26, 0.85, 12, 32]} />
      <meshPhysicalMaterial
        color={ICE}
        transmission={0.72}
        thickness={0.9}
        roughness={0.2}
        ior={1.4}
        envMapIntensity={1.55}
      />
      {/* tinted fill core — reads as a filled pill */}
      <mesh scale={0.62}>
        <capsuleGeometry args={[0.26, 0.85, 12, 32]} />
        <meshPhysicalMaterial
          color="#5cab8a"
          roughness={0.35}
          clearcoat={0.6}
          clearcoatRoughness={0.25}
          envMapIntensity={0.9}
        />
      </mesh>
      {/* frosted cap shell */}
      <mesh position={[0, 0.66, 0]} scale={1.005}>
        <sphereGeometry args={[0.26, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#9ed4b6"
          transmission={0.6}
          thickness={0.5}
          roughness={0.3}
          ior={1.4}
        />
      </mesh>
    </mesh>
  );
}

/** Small machined spheres for depth — steel or jade, sparse and intentional. */
function SteelBearing({
  position,
  scale = 1,
  variant = "steel",
}: {
  position: [number, number, number];
  scale?: number;
  variant?: "steel" | "jade";
}) {
  return (
    <Float speed={1.1} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh position={position} scale={scale}>
        <sphereGeometry args={[0.3, 40, 40]} />
        {variant === "steel" ? (
          <meshStandardMaterial color="#e2efe6" metalness={0.85} roughness={0.15} envMapIntensity={2.1} />
        ) : (
          <meshPhysicalMaterial
            color="#37a05f"
            emissive="#175a34"
            emissiveIntensity={0.25}
            roughness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.12}
            envMapIntensity={1.2}
          />
        )}
      </mesh>
    </Float>
  );
}

/** Ambient dust — sparse, slow, barely there. */
function DustField() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const N = 130;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 4 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.55;
      arr[i * 3 + 2] = r * Math.cos(phi) - 2.5;
    }
    return arr;
  }, []);
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.018;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
    }
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#4fae7f"
        transparent
        opacity={0.45}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function Scene() {
  return (
    <>
      {/* three-point studio lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 7, 4]} intensity={1.35} color="#ffffff" />
      <directionalLight position={[-6, 3, -4]} intensity={0.5} color="#c0e2d0" />
      <pointLight position={[4.5, -3.5, 3]} intensity={7} color="#f0e8d8" />

      <Rig>
        <Instrument />
        <GlassCapsule position={[0.95, 2.1, -1.5]} scale={0.85} phase={0} />
        <GlassCapsule position={[4.3, -1.6, -0.8]} scale={0.8} phase={Math.PI} />
        <SteelBearing position={[0.45, -1.95, -1.2]} scale={0.72} />
        <SteelBearing position={[4.5, 1.7, -2.6]} scale={0.5} variant="jade" />
        <DustField />
        <ContactShadows
          position={[2.1, -2.75, 0]}
          opacity={0.22}
          scale={15}
          blur={2.8}
          far={4.5}
          color="#0a261b"
        />
      </Rig>

      {/* Offline-safe studio lighting for reflections — key strip, ring
          catchlight, cool/warm side strips and a front soft card. A soft sage
          base sphere keeps metal reflections luminous between the strips (no
          dark bands at higher env resolution), and the ring lightformer is
          what makes the clearcoat lacquer pop. */}
      <Environment resolution={256}>
        <mesh scale={60}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshBasicMaterial color="#55705f" side={THREE.BackSide} />
        </mesh>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="rect" intensity={5} position={[0, 5, -9]} scale={[6, 1.4]} />
          <Lightformer form="ring" intensity={3.4} position={[0, 1.2, -5]} scale={2.4} color="#eaf6ee" />
          <Lightformer intensity={2.6} position={[-5, 1, -1]} scale={[3.5, 0.9]} color="#dcefe4" />
          <Lightformer intensity={2.2} position={[5, -1, 0]} scale={[3.5, 0.9]} color="#f0e8d8" />
          <Lightformer intensity={1.4} position={[0, -5, 2]} scale={[4, 0.9]} color="#c2e0d0" />
          <Lightformer form="rect" intensity={1.8} position={[-4.5, 4, 2]} scale={[1.2, 3.2]} color="#ffffff" />
          <Lightformer form="rect" intensity={1.2} position={[4.5, 3.5, 1]} scale={[1, 2.6]} color="#dcefe4" />
        </group>
      </Environment>
    </>
  );
}

/** Error boundary so a missing/failed WebGL context never breaks the page. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export default function HeroScene() {
  return (
    <SceneBoundary>
      <div className="absolute inset-0" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0.3, 9.5], fov: 38 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          style={{ background: "transparent" }}
        >
          <Scene />
        </Canvas>
      </div>
    </SceneBoundary>
  );
}
