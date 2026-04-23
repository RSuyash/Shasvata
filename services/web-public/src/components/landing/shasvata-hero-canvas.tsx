"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshTransmissionMaterial } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group, InstancedMesh } from "three";
import * as THREE from "three";

function OrbitForm() {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.12;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.18;
  });

  return (
    <group ref={group}>
      <Float speed={1.4} rotationIntensity={0.65} floatIntensity={0.85}>
        <mesh castShadow receiveShadow rotation={[0.45, 0.25, 0.1]}>
          <torusKnotGeometry args={[1.08, 0.26, 220, 32, 3, 5]} />
          <MeshTransmissionMaterial
            backside
            thickness={0.7}
            roughness={0.12}
            transmission={1}
            chromaticAberration={0.06}
            anisotropy={0.2}
            distortion={0.14}
            distortionScale={0.35}
            temporalDistortion={0.12}
            ior={1.18}
            color="#9fd6a4"
          />
        </mesh>
      </Float>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]} receiveShadow>
        <circleGeometry args={[2.7, 64]} />
        <meshBasicMaterial color="#8ccf96" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

function ParticleField() {
  const mesh = useRef<InstancedMesh>(null);
  const points = useMemo(() => {
    const temp = [];
    for (let index = 0; index < 56; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.9 + Math.random() * 1.65;
      temp.push({
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 2.5,
          Math.sin(angle) * radius,
        ),
        scale: 0.04 + Math.random() * 0.08,
        offset: Math.random() * Math.PI * 2,
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    const dummy = new THREE.Object3D();
    points.forEach((point, index) => {
      dummy.position.copy(point.position);
      dummy.position.y += Math.sin(state.clock.elapsedTime * 0.45 + point.offset) * 0.08;
      dummy.scale.setScalar(point.scale);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(index, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, points.length]}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial color="#d7f5db" transparent opacity={0.82} />
    </instancedMesh>
  );
}

export function ShasvataHeroCanvas() {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0.1, 5.4], fov: 34 }}>
        <color attach="background" args={["#07100b"]} />
        <fog attach="fog" args={["#07100b", 4.8, 9.5]} />
        <ambientLight intensity={0.7} />
        <spotLight
          position={[3.5, 5, 4]}
          intensity={16}
          angle={0.32}
          penumbra={1}
          color="#d8ffd7"
        />
        <pointLight position={[-4, -1, -3]} intensity={14} color="#9bcf86" />
        <OrbitForm />
        <ParticleField />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
