"use client";

import React, { Suspense, useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// ── ReadyPlayer.Me Avatar Model ──────────────────────────────────────────
// Default female Indian avatar URL — replace with your custom RPM avatar
const DEFAULT_AVATAR_URL = "https://models.readyplayer.me/6460d95f9ae1c45d525a1ca2.glb";

interface AvatarModelProps {
  url: string;
  isSpeaking: boolean;
  mood: string;
}

function AvatarModel({ url, isSpeaking, mood }: AvatarModelProps) {
  const { scene, nodes } = useGLTF(url) as any;
  const modelRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  // Clone scene so we can manipulate it
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // Find head bone for lip sync
  const headBone = useMemo(() => {
    let head: THREE.Bone | null = null;
    clonedScene.traverse((child: any) => {
      if (child.isBone && (child.name === "Head" || child.name === "head")) {
        head = child;
      }
    });
    return head;
  }, [clonedScene]);

  // Find morph targets for expressions
  const morphMesh = useMemo(() => {
    let mesh: THREE.SkinnedMesh | null = null;
    clonedScene.traverse((child: any) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        mesh = child;
      }
    });
    return mesh;
  }, [clonedScene]);

  useFrame((state, delta) => {
    if (!modelRef.current) return;

    // Subtle idle breathing animation
    const t = state.clock.elapsedTime;
    modelRef.current.position.y = Math.sin(t * 0.8) * 0.005;

    // Lip sync — morph target animation when speaking
    if (morphMesh && (morphMesh as any).morphTargetDictionary) {
      const dict = (morphMesh as any).morphTargetDictionary;
      const influences = (morphMesh as any).morphTargetInfluences;

      if (influences) {
        // Mouth open/close for speaking
        const mouthOpenIdx = dict["mouthOpen"] ?? dict["jawOpen"] ?? dict["viseme_aa"] ?? -1;
        const mouthSmileIdx = dict["mouthSmile"] ?? dict["mouthSmileLeft"] ?? -1;

        if (mouthOpenIdx >= 0) {
          if (isSpeaking) {
            // Animated mouth movement simulating speech
            const mouthValue = (Math.sin(t * 12) * 0.3 + Math.sin(t * 8.3) * 0.2 + Math.sin(t * 15.7) * 0.15);
            influences[mouthOpenIdx] = Math.max(0, Math.min(0.7, mouthValue + 0.2));
          } else {
            // Smoothly close mouth
            influences[mouthOpenIdx] *= 0.9;
          }
        }

        // Smile based on mood
        if (mouthSmileIdx >= 0) {
          const targetSmile = mood === "greeting" ? 0.6 : mood === "speaking" ? 0.3 : 0.15;
          influences[mouthSmileIdx] += (targetSmile - influences[mouthSmileIdx]) * 0.05;
        }

        // Blink animation
        const blinkLIdx = dict["eyeBlinkLeft"] ?? dict["eyeBlink_L"] ?? -1;
        const blinkRIdx = dict["eyeBlinkRight"] ?? dict["eyeBlink_R"] ?? -1;
        if (blinkLIdx >= 0 && blinkRIdx >= 0) {
          const blinkCycle = t % 4;
          const blinkValue = blinkCycle > 3.85 ? Math.sin((blinkCycle - 3.85) / 0.15 * Math.PI) : 0;
          influences[blinkLIdx] = blinkValue;
          influences[blinkRIdx] = blinkValue;
        }
      }
    }

    // Head subtle movement when speaking
    if (headBone && isSpeaking) {
      (headBone as THREE.Bone).rotation.y = Math.sin(t * 1.5) * 0.04;
      (headBone as THREE.Bone).rotation.x = Math.sin(t * 2.1) * 0.02;
    }
  });

  return (
    <group ref={modelRef}>
      <primitive
        object={clonedScene}
        scale={1.8}
        position={[0, -1.7, 0]}
        rotation={[0.05, 0, 0]}
      />
    </group>
  );
}

// ── Main 3D Canvas ───────────────────────────────────────────────────────
interface Avatar3DProps {
  isSpeaking: boolean;
  mood: string;
  avatarUrl?: string;
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#7c3aed" wireframe />
    </mesh>
  );
}

export default function Avatar3D({ isSpeaking, mood, avatarUrl }: Avatar3DProps) {
  const url = avatarUrl || DEFAULT_AVATAR_URL;

  return (
    <div className="w-full h-full" style={{ minHeight: "350px" }}>
      <Canvas
        camera={{ position: [0, 0.2, 1.8], fov: 30 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
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

// Preload the default avatar
useGLTF.preload(DEFAULT_AVATAR_URL);
