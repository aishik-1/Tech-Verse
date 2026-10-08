import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type ByotoneGeometry = 'knot' | 'sphere' | 'crystal';

interface ByotoneWebglShapeProps {
  className?: string;
  energy?: number; // 0..100 from slider
  isPlayingSound?: boolean;
  geometryType?: ByotoneGeometry;
}

export const ByotoneWebglShape: React.FC<ByotoneWebglShapeProps> = ({
  className = '',
  energy = 50,
  isPlayingSound = false,
  geometryType = 'knot',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const energyRef = useRef(energy);
  const isPlayingRef = useRef(isPlayingSound);
  const geomTypeRef = useRef(geometryType);

  energyRef.current = energy;
  isPlayingRef.current = isPlayingSound;
  geomTypeRef.current = geometryType;

  // Scene references to allow hot-swapping geometry
  const sceneRef = useRef<THREE.Scene | null>(null);
  const worldGroupRef = useRef<THREE.Group | null>(null);
  const shapeMeshRef = useRef<THREE.Mesh | null>(null);
  const wireframeMeshRef = useRef<THREE.Mesh | null>(null);
  const currentPositionsRef = useRef<Float32Array | null>(null);
  const originalPositionsRef = useRef<Float32Array | null>(null);
  const currentGeomRef = useRef<THREE.BufferGeometry | null>(null);

  // Helper to build geometries
  const createGeometry = (type: ByotoneGeometry): THREE.BufferGeometry => {
    if (type === 'sphere') {
      // High-res sphere for organic fluid waves (Byotone somatic sound bubble)
      return new THREE.SphereGeometry(1.8, 64, 64);
    }
    if (type === 'crystal') {
      // Precision crystalline icosahedron with detail
      return new THREE.IcosahedronGeometry(1.85, 2);
    }
    // Default: Signature fluid Torus Knot
    return new THREE.TorusKnotGeometry(1.65, 0.5, 140, 36, 2, 3);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) return;
    } catch {
      return;
    }

    // 1. Scene, Camera, Fog Setup (Matching Byotone #131418 tone)
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x131418, 0.035);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.15, 8.4);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x131418, 0); // Transparent blend
    container.appendChild(renderer.domElement);

    const worldGroup = new THREE.Group();
    worldGroupRef.current = worldGroup;
    scene.add(worldGroup);

    // -------------------------------------------------------------
    // Core Geometry & Materials (Titanium + Byotone Mint & Lavender Rim)
    // -------------------------------------------------------------
    let shapeGeometry = createGeometry(geomTypeRef.current);
    currentGeomRef.current = shapeGeometry;
    let posAttr = shapeGeometry.attributes.position;
    originalPositionsRef.current = new Float32Array(posAttr.array);

    const shapeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x191a1e,
      emissive: 0x0f241a, // subtle mint undertone
      emissiveIntensity: 0.4,
      roughness: 0.16,
      metalness: 0.88,
      clearcoat: 1.0,
      clearcoatRoughness: 0.12,
      reflectivity: 0.95,
      wireframe: false,
    });
    const shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial);
    shapeMeshRef.current = shapeMesh;
    worldGroup.add(shapeMesh);

    // Delicate Wireframe Shroud (Byotone hallmark)
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xacffce,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const wireframeMesh = new THREE.Mesh(shapeGeometry, wireframeMaterial);
    wireframeMesh.scale.set(1.018, 1.018, 1.018);
    wireframeMeshRef.current = wireframeMesh;
    worldGroup.add(wireframeMesh);

    // Outer Harmonic Resonance Ring (Pale Cyan)
    const outerRingGeom = new THREE.TorusGeometry(3.1, 0.014, 16, 120);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0x89eefa,
      transparent: true,
      opacity: 0.32,
    });
    const outerRing = new THREE.Mesh(outerRingGeom, outerRingMat);
    outerRing.rotation.x = Math.PI / 2.7;
    worldGroup.add(outerRing);

    // Secondary Lavender Ring (Opposite incline)
    const innerRingGeom = new THREE.TorusGeometry(2.5, 0.012, 16, 100);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xa2a7ff,
      transparent: true,
      opacity: 0.25,
    });
    const innerRing = new THREE.Mesh(innerRingGeom, innerRingMat);
    innerRing.rotation.x = -Math.PI / 3.2;
    innerRing.rotation.y = Math.PI / 4;
    worldGroup.add(innerRing);

    // -------------------------------------------------------------
    // Ambient Somatic Particles
    // -------------------------------------------------------------
    const particleCount = 240;
    const particleGeom = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const r = 2.6 + Math.random() * 6.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPositions[i * 3 + 2] = r * Math.cos(phi);

      // Byotone refined palette
      if (i % 3 === 0) {
        // Mint (#ACFFCE)
        pColors[i * 3] = 0.67;
        pColors[i * 3 + 1] = 1.0;
        pColors[i * 3 + 2] = 0.81;
      } else if (i % 3 === 1) {
        // Lavender (#A2A7FF)
        pColors[i * 3] = 0.635;
        pColors[i * 3 + 1] = 0.655;
        pColors[i * 3 + 2] = 1.0;
      } else {
        // Pale Cyan (#89EEFA)
        pColors[i * 3] = 0.537;
        pColors[i * 3 + 1] = 0.933;
        pColors[i * 3 + 2] = 0.98;
      }
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    particleGeom.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    worldGroup.add(particles);

    // Ripple click shockwave ring
    const rippleGeom = new THREE.RingGeometry(0.1, 0.18, 64);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0xacffce,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
    });
    const rippleMesh = new THREE.Mesh(rippleGeom, rippleMat);
    rippleMesh.rotation.x = -Math.PI / 2.5;
    worldGroup.add(rippleMesh);

    // -------------------------------------------------------------
    // Lighting setup
    // -------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0x191a1e, 3.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xacffce, 3.8);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa2a7ff, 3.6);
    rimLight.position.set(-5, -3, -4);
    scene.add(rimLight);

    const topLight = new THREE.PointLight(0x89eefa, 2.2, 16);
    topLight.position.set(0, 5, 2);
    scene.add(topLight);

    // -------------------------------------------------------------
    // Mouse Interaction (Damped Parallax)
    // -------------------------------------------------------------
    let targetRotY = 0;
    let targetRotX = 0;
    let rippleScale = 0;
    let rippleOpacity = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      targetRotY = x * 0.42;
      targetRotX = -y * 0.32;
    };

    const handlePointerDown = () => {
      rippleScale = 0.35;
      rippleOpacity = 0.9;
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('click', handlePointerDown);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    let isVisible = true;
    const handleVis = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVis);

    // -------------------------------------------------------------
    // Render loop with fluid wave displacement
    // -------------------------------------------------------------
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const elapsed = clock.getElapsedTime();
      const currentEnergy = energyRef.current; // 0..100
      const soundBoost = isPlayingRef.current ? 1.45 : 1.0;

      // Base rotation
      const rotSpeed = (0.16 + (currentEnergy / 100) * 0.28) * soundBoost;
      if (shapeMeshRef.current) {
        shapeMeshRef.current.rotation.y = elapsed * rotSpeed;
        shapeMeshRef.current.rotation.x = Math.sin(elapsed * (rotSpeed * 0.75)) * 0.22;
        if (wireframeMeshRef.current) {
          wireframeMeshRef.current.rotation.copy(shapeMeshRef.current.rotation);
        }
      }

      outerRing.rotation.z = -elapsed * (rotSpeed * 0.5);
      innerRing.rotation.z = elapsed * (rotSpeed * 0.35);

      // Realtime Vertex Wave Deformation
      if (currentGeomRef.current && originalPositionsRef.current) {
        const posAttrCurr = currentGeomRef.current.attributes.position;
        const posArray = posAttrCurr.array as Float32Array;
        const origArray = originalPositionsRef.current;
        const waveFreq = 2.2 + (currentEnergy / 100) * 3.8;
        const waveAmp = (0.045 + (currentEnergy / 100) * 0.085) * soundBoost;

        for (let i = 0; i < posArray.length; i += 3) {
          const ox = origArray[i];
          const oy = origArray[i + 1];
          const oz = origArray[i + 2];

          const displacement =
            Math.sin(ox * waveFreq + elapsed * 2.3) *
            Math.cos(oy * waveFreq + elapsed * 1.9) *
            waveAmp;

          posArray[i] = ox + ox * displacement;
          posArray[i + 1] = oy + oy * displacement;
          posArray[i + 2] = oz + oz * displacement;
        }
        posAttrCurr.needsUpdate = true;
        currentGeomRef.current.computeVertexNormals();
      }

      // Click Ripple Ring Animation
      if (rippleOpacity > 0.01) {
        rippleScale += 0.08;
        rippleOpacity *= 0.93;
        rippleMesh.scale.set(rippleScale, rippleScale, rippleScale);
        rippleMat.opacity = rippleOpacity;
      } else {
        rippleMat.opacity = 0;
      }

      // Parallax Interpolation (Smooth Lerp to mouse cursor)
      worldGroup.rotation.y += (targetRotY - worldGroup.rotation.y) * 0.055;
      worldGroup.rotation.x += (targetRotX - worldGroup.rotation.x) * 0.055;

      // Particle rotation
      particles.rotation.y = elapsed * 0.025;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('click', handlePointerDown);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVis);
      cancelAnimationFrame(animationId);

      shapeGeometry.dispose();
      shapeMaterial.dispose();
      wireframeMaterial.dispose();
      outerRingGeom.dispose();
      outerRingMat.dispose();
      innerRingGeom.dispose();
      innerRingMat.dispose();
      particleGeom.dispose();
      particleMat.dispose();
      rippleGeom.dispose();
      rippleMat.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Hot-swap geometry if user switches model
  useEffect(() => {
    if (!shapeMeshRef.current || !wireframeMeshRef.current || !worldGroupRef.current) return;

    const newGeom = createGeometry(geometryType);
    shapeMeshRef.current.geometry.dispose();
    wireframeMeshRef.current.geometry.dispose();

    shapeMeshRef.current.geometry = newGeom;
    wireframeMeshRef.current.geometry = newGeom;
    currentGeomRef.current = newGeom;
    originalPositionsRef.current = new Float32Array(newGeom.attributes.position.array);
  }, [geometryType]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
};
