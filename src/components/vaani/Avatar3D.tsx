"use client";

import React, { Suspense, useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// ── Realistic female Indian avatar (ReadyPlayer.Me) ──────────────────────
// Using morphTargets query for lip sync + expressions support
const DEFAULT_AVATAR_URL =
  "https://models.readyplayer.me/6460d95f9ae1c45d525a1ca2.glb?morphTargets=ARKit,Oculus+Visemes&textureAtlas=1024";

interface AvatarModelProps {
  url: string;
  isSpeaking: boolean;
  mood: string;
}

function AvatarModel({ url, isSpeaking, mood }: AvatarModelProps) {
  const { scene } = useGLTF(url) as any;
  const modelRef = useRef<THREE.Group>(null);

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // Find morph target mesh and head bone
  const { morphMesh, headBone } = useMemo(() => {
    let mesh: any = null;
    let head: any = null;
    clonedScene.traverse((child: any) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary && !mesh) mesh = child;
      if (child.isBone && (child.name === "Head" || child.name === "head") && !head) head = child;
    });
    return { morphMesh: mesh, headBone: head };
  }, [clonedScene]);

  useFrame((state) => {
    if (!modelRef.current) return;
    const t = state.clock.elapsedTime;

    // Subtle breathing
    modelRef.current.position.y = Math.sin(t * 0.8) * 0.003;

    if (morphMesh?.morphTargetDictionary && morphMesh.morphTargetInfluences) {
      const dict = morphMesh.morphTargetDictionary;
      const inf = morphMesh.morphTargetInfluences;

      // ── Lip sync ──
      const mouthIdx = dict["mouthOpen"] ?? dict["jawOpen"] ?? dict["viseme_aa"] ?? -1;
      if (mouthIdx >= 0) {
        if (isSpeaking) {
          const v = Math.sin(t * 12) * 0.3 + Math.sin(t * 8.3) * 0.2 + Math.sin(t * 15.7) * 0.15 + 0.2;
          inf[mouthIdx] = Math.max(0, Math.min(0.7, v));
        } else {
          inf[mouthIdx] *= 0.9;
        }
      }

      // ── Smile per mood ──
      const smileIdx = dict["mouthSmile"] ?? dict["mouthSmileLeft"] ?? -1;
      if (smileIdx >= 0) {
        const target = mood === "greeting" ? 0.6 : mood === "speaking" ? 0.3 : 0.15;
        inf[smileIdx] += (target - inf[smileIdx]) * 0.05;
      }

      // ── Eye blink ──
      const blinkL = dict["eyeBlinkLeft"] ?? dict["eyeBlink_L"] ?? -1;
      const blinkR = dict["eyeBlinkRight"] ?? dict["eyeBlink_R"] ?? -1;
      if (blinkL >= 0 && blinkR >= 0) {
        const cycle = t % 4;
        const val = cycle > 3.85 ? Math.sin((cycle - 3.85) / 0.15 * Math.PI) : 0;
        inf[blinkL] = val;
        inf[blinkR] = val;
      }

      // ── Eyebrow raise when listening ──
      const browUp = dict["browInnerUp"] ?? -1;
      if (browUp >= 0) {
        const target = mood === "listening" ? 0.4 : mood === "thinking" ? 0.25 : 0;
        inf[browUp] += (target - inf[browUp]) * 0.05;
      }
    }

    // Head movement when speaking
    if (headBone && isSpeaking) {
      headBone.rotation.y = Math.sin(t * 1.5) * 0.04;
      headBone.rotation.x = Math.sin(t * 2.1) * 0.02;
    }
  });

  return (
    <group ref={modelRef}>
      <primitive object={clonedScene} scale={1.8} position={[0, -1.7, 0]} rotation={[0.05, 0, 0]} />
    </group>
  );
}

// ── Loading fallback ─────────────────────────────────────────────────────
function LoadingFallback() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) meshRef.current.rotation.y = state.clock.elapsedTime;
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#7c3aed" wireframe transparent opacity={0.6} />
    </mesh>
  );
}

// ── Main export ──────────────────────────────────────────────────────────
interface Avatar3DProps {
  isSpeaking: boolean;
  mood: string;
  avatarUrl?: string;
}

export default function Avatar3D({ isSpeaking, mood, avatarUrl }: Avatar3DProps) {
  const url = avatarUrl || DEFAULT_AVATAR_URL;
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
        3D Avatar load failed. Check network.
      </div>
    );
  }

  return (
    <div className="w-full h-full" style={{ minHeight: "350px" }}>
      <Canvas
        camera={{ position: [0, 0.2, 1.8], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        onError={() => setHasError(true)}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <directionalLight position={[-3, 3, 2]} intensity={0.3} color="#a78bfa" />
        <spotLight
          position={[0, 5, 0]}
          intensity={0.4}
          angle={0.5}
          penumbra={1}
          color={isSpeaking ? "#4ade80" : "#7c3aed"}
        />

        <Suspense fallback={<LoadingFallback />}>
          <AvatarModel url={url} isSpeaking={isSpeaking} mood={mood} />
          <Environment preset="studio" />
        </Suspense>

        <ContactShadows position={[0, -1.7, 0]} opacity={0.3} blur={2} scale={4} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
