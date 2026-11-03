import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, RoundedBox } from '@react-three/drei';

const AUBERGINE = '#3A0F34';
const MARIGOLD = '#EAAA00';

// Eases the whole group toward the pointer for a gentle parallax.
// Pointer is tracked on window so it works even though the canvas ignores mouse events.
function Rig({ children }) {
  const group = useRef();
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => {
      pointer.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);

  useFrame(() => {
    const g = group.current;
    g.rotation.y += (pointer.current.x * 0.45 - g.rotation.y) * 0.05;
    g.rotation.x += (pointer.current.y * 0.28 - g.rotation.x) * 0.05;
  });
  return <group ref={group}>{children}</group>;
}

const glossy = (color) => ({ color, roughness: 0.22, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0.12 });

function Scene() {
  return (
    <Rig>
      <Float speed={1.5} rotationIntensity={0.7} floatIntensity={1.1}>
        <mesh>
          <torusKnotGeometry args={[1, 0.34, 220, 32]} />
          <meshPhysicalMaterial {...glossy(AUBERGINE)} />
        </mesh>
      </Float>

      <Float speed={2} rotationIntensity={1} floatIntensity={1.6}>
        <mesh position={[2.1, 1.25, -0.4]}>
          <icosahedronGeometry args={[0.5, 4]} />
          <MeshDistortMaterial color={MARIGOLD} distort={0.32} speed={2} roughness={0.2} metalness={0.2} />
        </mesh>
      </Float>

      <Float speed={1.8} rotationIntensity={1.2} floatIntensity={1.3}>
        <RoundedBox args={[0.7, 0.7, 0.7]} radius={0.14} smoothness={6} position={[-2.2, -1.05, 0.3]}>
          <meshPhysicalMaterial {...glossy(MARIGOLD)} />
        </RoundedBox>
      </Float>

      <Float speed={1.4} floatIntensity={1.8}>
        <mesh position={[-1.7, 1.55, -1]}>
          <sphereGeometry args={[0.3, 48, 48]} />
          <meshPhysicalMaterial {...glossy(AUBERGINE)} />
        </mesh>
      </Float>

      <Float speed={2.2} rotationIntensity={1.4} floatIntensity={1.2}>
        <mesh position={[2.05, -1.45, 0.4]} rotation={[0.9, 0.3, 0]}>
          <torusGeometry args={[0.46, 0.15, 32, 72]} />
          <meshPhysicalMaterial {...glossy(MARIGOLD)} />
        </mesh>
      </Float>
    </Rig>
  );
}

export default function Hero3D() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6.2], fov: 42 }}
      gl={{ alpha: true, antialias: true }}  // transparent, so it blends into the silver page
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 5, 5]} intensity={2.4} />
      <directionalLight position={[-5, -2, -3]} intensity={1} color={MARIGOLD} /> {/* warm rim light */}
      <Scene />
    </Canvas>
  );
}