import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Html, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useMissionStore } from '@/store/missionStore';
import type { Target, Hazard, RouteData, Vec3 } from '@/types';

// === Disaster scene elements ===

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#1a2335" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

function GridHelper() {
  return (
    <gridHelper args={[40, 20, 0x2a3a5c, 0x1a2335]} position={[0, -1.99, 0]} />
  );
}

function CollapsedBuilding({ position, rotation = 0, scale = 1 }: { position: [number, number, number]; rotation?: number; scale?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      {/* Main collapsed structure */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[3, 1.5, 2.5]} />
        <meshStandardMaterial color="#3a4255" roughness={0.95} />
      </mesh>
      {/* Tilted slab */}
      <mesh position={[1.5, 0.5, 0.3]} rotation={[0.3, 0.2, -0.15]} castShadow>
        <boxGeometry args={[2, 0.3, 1.8]} />
        <meshStandardMaterial color="#4a5265" roughness={0.9} />
      </mesh>
      {/* Broken column */}
      <mesh position={[-1.2, 0.8, -0.5]} rotation={[0.1, 0, 0.2]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 2, 6]} />
        <meshStandardMaterial color="#3a4255" roughness={0.95} />
      </mesh>
      {/* Rubble pile */}
      <mesh position={[0.5, -0.3, 1.2]} castShadow>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#2a3245" roughness={1} flatShading />
      </mesh>
      <mesh position={[1.2, -0.5, -0.8]} castShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#3a4255" roughness={1} flatShading />
      </mesh>
    </group>
  );
}

function RubblePile({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#2a3245" roughness={1} flatShading />
      </mesh>
      <mesh position={[0.8, -0.2, 0.3]} castShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#3a4255" roughness={1} flatShading />
      </mesh>
      <mesh position={[-0.6, -0.3, 0.6]} castShadow>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#252d3d" roughness={1} flatShading />
      </mesh>
    </group>
  );
}

function ConcreteSlab({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <boxGeometry args={[4, 0.3, 2]} />
      <meshStandardMaterial color="#3a4255" roughness={0.95} />
    </mesh>
  );
}

function RoadStrip() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.95, 0]}>
      <planeGeometry args={[3, 30]} />
      <meshStandardMaterial color="#252d3d" roughness={1} />
    </mesh>
  );
}

function HazardZone({ hazard }: { hazard: Hazard }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.08 + Math.sin(state.clock.elapsedTime * 2) * 0.04;
    }
  });

  const color = hazard.severity > 0.7 ? 0xef4444 : hazard.severity > 0.5 ? 0xf59e0b : 0xfbbf24;

  return (
    <group position={[hazard.position.x, -1.9, hazard.position.z]}>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[hazard.radius, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[hazard.radius - 0.1, hazard.radius, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function TargetMarker({ target, isSelected }: { target: Target; isSelected: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const color = target.priorityTier === 'high' ? '#ef4444' : target.priorityTier === 'medium' ? '#f59e0b' : '#94a3b8';

  return (
    <group position={[target.location.x, target.location.y, target.location.z]}>
      <group ref={ref}>
        {/* Ring marker */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 16]} />
          <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.9 : 0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[0, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 16]} />
          <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.9 : 0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <ringGeometry args={[0.4, 0.5, 16]} />
          <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.9 : 0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* Center sphere */}
      <mesh>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 0.5 : 0.2} />
      </mesh>
      {/* Vertical beam */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 2, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
      {/* Label */}
      <Html position={[0, 2.5, 0]} center distanceFactor={10} occlude>
        <div className={`px-1.5 py-0.5 rounded text-[10px] font-mono whitespace-nowrap ${
          isSelected ? 'bg-cyan-500 text-white' : 'bg-navy-900 text-gray-300 border border-navy-600'
        }`}>
          {target.id} {Math.round(target.confidence * 100)}%
        </div>
      </Html>
    </group>
  );
}

function DroneMarker() {
  const ref = useRef<THREE.Group>(null);
  const { state } = useMissionStore();

  useFrame((s) => {
    if (ref.current) {
      ref.current.rotation.y = s.clock.elapsedTime * 0.3;
      const alt = state.droneTelemetry.altitude / 45 * 8;
      ref.current.position.y = 2 + alt;
    }
  });

  return (
    <group ref={ref} position={[0, 2, 0]}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.4, 0.1, 0.4]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.2} />
      </mesh>
      {/* Arms */}
      {[[-1, 0, -1], [1, 0, -1], [-1, 0, 1], [1, 0, 1]].map((pos, i) => (
        <mesh key={i} position={[pos[0] * 0.25, 0, pos[2] * 0.25]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 4]} />
          <meshStandardMaterial color="#3a4d72" />
        </mesh>
      ))}
      {/* Rotors */}
      {[[-1, 0, -1], [1, 0, -1], [-1, 0, 1], [1, 0, 1]].map((pos, i) => (
        <mesh key={i} position={[pos[0] * 0.35, 0.08, pos[2] * 0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.01, 12]} />
          <meshStandardMaterial color="#22d3ee" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function RescueTeamMarker() {
  const { state } = useMissionStore();
  if (!state.rescueTeam) return null;
  const pos = state.rescueTeam.position;

  return (
    <group position={[pos.x, -1.8, pos.z]}>
      {/* Base */}
      <mesh>
        <cylinderGeometry args={[0.3, 0.35, 0.15, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} />
      </mesh>
      {/* Antenna */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 4]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
      <Html position={[0, 1, 0]} center distanceFactor={10} occlude>
        <div className="px-1.5 py-0.5 rounded text-[10px] font-mono whitespace-nowrap bg-green-500/20 text-green-400 border border-green-500/40">
          RESCUE TEAM
        </div>
      </Html>
    </group>
  );
}

function RouteLine({ route, color, dashed }: { route: RouteData; color: string; dashed: boolean }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = route.waypoints.map((wp) => new THREE.Vector3(wp.x, -1.7, wp.z));
    return pts;
  }, [route.waypoints]);

  if (dashed) {
    return (
      <Line points={points} color={color} lineWidth={2} dashed dashScale={2} dashSize={0.3} gapSize={0.2} />
    );
  }
  return <Line points={points} color={color} lineWidth={2} />;
}

function SceneContent() {
  const { state } = useMissionStore();
  const showMap = state.pipeline.find((s) => s.id === 'reconstruct')?.status === 'complete' ||
    state.currentStage === 'reconstruct' && state.stageStatus === 'active';
  const showTargets = state.targets.length > 0;
  const showHazards = state.hazards.length > 0;
  const showRoutes = state.safeRoute || state.fastRoute;
  const showDrone = state.missionStatus !== 'standby';

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 5]} intensity={0.5} castShadow />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#22d3ee" />

      <GroundPlane />
      <GridHelper />
      <RoadStrip />

      {showMap && (
        <>
          <CollapsedBuilding position={[1, -1.2, -3]} rotation={0.1} />
          <CollapsedBuilding position={[-4, -1.5, -5]} rotation={-0.3} scale={0.8} />
          <CollapsedBuilding position={[3, -1.0, 3]} rotation={0.4} scale={0.9} />
          <RubblePile position={[-2, -1.5, 1]} />
          <RubblePile position={[5, -1.5, -1]} />
          <ConcreteSlab position={[-1, -1.5, 0]} rotation={[0.1, 0.3, -0.05]} />
          <ConcreteSlab position={[2, -1.5, -6]} rotation={[-0.1, 0, 0.15]} />
        </>
      )}

      {showHazards && state.hazards.map((h) => (
        <HazardZone key={h.id} hazard={h} />
      ))}

      {showTargets && state.targets.map((t) => (
        <TargetMarker key={t.id} target={t} isSelected={state.selectedTargetId === t.id} />
      ))}

      {showDrone && <DroneMarker />}

      {state.rescueTeam && <RescueTeamMarker />}

      {showRoutes && (
        <>
          {state.safeRoute && <RouteLine route={state.safeRoute} color="#22d3ee" dashed={false} />}
          {state.fastRoute && <RouteLine route={state.fastRoute} color="#f59e0b" dashed={true} />}
        </>
      )}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={30}
        target={[0, -1, 0]}
      />
    </>
  );
}

export function DisasterScene() {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [12, 10, 12], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}

// Empty placeholder scene for standby
export function StandbyScene() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Canvas camera={{ position: [12, 10, 12], fov: 50 }} gl={{ alpha: true }}>
        <ambientLight intensity={0.2} />
        <GridHelper />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
