import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type TplhTheme = 'gold' | 'cyan' | 'purple' | 'matrix';

interface TplhWebglSceneProps {
  className?: string;
  interactive?: boolean;
  colorScheme?: TplhTheme;
  particleCount?: number;
  isWarping?: boolean;
  onWarpComplete?: () => void;
}

export const TplhWebglScene: React.FC<TplhWebglSceneProps> = ({
  className = '',
  interactive = true,
  colorScheme = 'gold',
  particleCount = 550,
  isWarping = false,
  onWarpComplete,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const warpingRef = useRef(isWarping);
  warpingRef.current = isWarping;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL support
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) return;
    } catch {
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera setup (Matching tplh.net depth & perspective)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x131215, 0.038);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x131215, 0);
    container.appendChild(renderer.domElement);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // -------------------------------------------------------------
    // 2. The Core Low-Poly Cybernetic Sculpture (tplh.net signature)
    // -------------------------------------------------------------
    const headGroup = new THREE.Group();
    rootGroup.add(headGroup);

    // Procedural faceted low-poly cranial core (Yoichi Kobayashi dodecahedron mask)
    const craniumGeom = new THREE.DodecahedronGeometry(1.42, 1);
    const pos = craniumGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      // Taper bottom for jaw, elongate top for cranium
      const jawTaper = y < 0 ? 0.72 + (y + 1.4) * 0.19 : 1.05;
      pos.setXYZ(i, x * jawTaper, y * 1.25, z * (z > 0 ? 1.18 : 0.94));
    }
    craniumGeom.computeVertexNormals();

    // Material with flat shading for distinct low-poly facets
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1a181e,
      emissive: 0x24150b,
      emissiveIntensity: 0.55,
      roughness: 0.2,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.15,
      flatShading: true,
      reflectivity: 0.95,
    });
    const coreMesh = new THREE.Mesh(craniumGeom, coreMaterial);
    headGroup.add(coreMesh);

    // Wireframe Aura Overlay (tplh.net delicate wire matrix)
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: colorScheme === 'cyan' ? 0x89eefa : colorScheme === 'purple' ? 0xc084fc : 0xffd166,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });
    const wireMesh = new THREE.Mesh(craniumGeom, wireMaterial);
    wireMesh.scale.set(1.025, 1.025, 1.025);
    headGroup.add(wireMesh);

    // Inner glowing core sphere (inner power engine)
    const innerGlowGeom = new THREE.IcosahedronGeometry(0.85, 2);
    const innerGlowMat = new THREE.MeshBasicMaterial({
      color: 0x06d6a0,
      wireframe: true,
      transparent: true,
      opacity: 0.48,
    });
    const innerGlowMesh = new THREE.Mesh(innerGlowGeom, innerGlowMat);
    headGroup.add(innerGlowMesh);

    // -------------------------------------------------------------
    // 3. Falling & Orbiting Petals / Cyber Shards (tplh.net PetalGroup)
    // -------------------------------------------------------------
    const petalCount = 48;
    const petalGroup = new THREE.Group();
    rootGroup.add(petalGroup);

    const petalGeom = new THREE.BufferGeometry();
    const petalVertices = new Float32Array([
      -0.08, -0.16, 0.0,
       0.08, -0.16, 0.0,
       0.0,   0.22, 0.05,
    ]);
    petalGeom.setAttribute('position', new THREE.BufferAttribute(petalVertices, 3));
    petalGeom.computeVertexNormals();

    const petalMat = new THREE.MeshPhysicalMaterial({
      color: 0xffe29f,
      emissive: 0xdd6b20,
      emissiveIntensity: 0.35,
      roughness: 0.28,
      metalness: 0.65,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.78,
    });

    interface PetalData {
      mesh: THREE.Mesh;
      baseRadius: number;
      speed: number;
      angle: number;
      y: number;
      rotSpeedX: number;
      rotSpeedY: number;
      rotSpeedZ: number;
    }
    const petalsData: PetalData[] = [];

    for (let i = 0; i < petalCount; i++) {
      const pMesh = new THREE.Mesh(petalGeom, petalMat.clone());
      const baseRadius = 2.0 + Math.random() * 3.8;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 6.5;

      pMesh.position.set(
        Math.cos(angle) * baseRadius,
        y,
        Math.sin(angle) * baseRadius
      );
      const scale = 0.6 + Math.random() * 1.4;
      pMesh.scale.set(scale, scale, scale);

      petalGroup.add(pMesh);
      petalsData.push({
        mesh: pMesh,
        baseRadius,
        speed: 0.008 + Math.random() * 0.018,
        angle,
        y,
        rotSpeedX: (Math.random() - 0.5) * 0.06,
        rotSpeedY: (Math.random() - 0.5) * 0.08,
        rotSpeedZ: (Math.random() - 0.5) * 0.05,
      });
    }

    // -------------------------------------------------------------
    // 4. Swirling Particle Aura (tplh.net SkullPoints & Aura)
    // -------------------------------------------------------------
    const pGeom = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);
    const pVelocities: {
      radius: number;
      baseRadius: number;
      theta: number;
      phi: number;
      speedTheta: number;
      speedPhi: number;
      warpZ: number;
      impulseRadius: number;
    }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.6 + Math.random() * 5.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pPos[i * 3 + 2] = radius * Math.cos(phi);

      pVelocities.push({
        radius,
        baseRadius: radius,
        theta,
        phi,
        speedTheta: (Math.random() - 0.5) * 0.02,
        speedPhi: (Math.random() - 0.5) * 0.015,
        warpZ: 0,
        impulseRadius: 0,
      });

      // Warm ember gold, mint green, and pale ice cyan
      if (i % 3 === 0) {
        pColors[i * 3] = 1.0; // Amber Gold #FFD166
        pColors[i * 3 + 1] = 0.82;
        pColors[i * 3 + 2] = 0.4;
      } else if (i % 3 === 1) {
        pColors[i * 3] = 0.02; // Mint #06D6A0
        pColors[i * 3 + 1] = 0.84;
        pColors[i * 3 + 2] = 0.63;
      } else {
        pColors[i * 3] = 0.54; // Pale Ice Cyan #89EEFA
        pColors[i * 3 + 1] = 0.93;
        pColors[i * 3 + 2] = 0.98;
      }
    }

    pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeom.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.048,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeom, pMat);
    rootGroup.add(particles);

    // -------------------------------------------------------------
    // 5. Studio Lighting
    // -------------------------------------------------------------
    const ambLight = new THREE.AmbientLight(0x19181c, 3.5);
    scene.add(ambLight);

    const warmKey = new THREE.DirectionalLight(0xffbe53, 4.4);
    warmKey.position.set(4, 5, 5);
    scene.add(warmKey);

    const mintRim = new THREE.DirectionalLight(0x06d6a0, 3.8);
    mintRim.position.set(-5, -3, -4);
    scene.add(mintRim);

    const topCyan = new THREE.PointLight(0x89eefa, 2.8, 18);
    topCyan.position.set(0, 5, 2);
    scene.add(topCyan);

    // -------------------------------------------------------------
    // 6. Mouse Parallax & Dynamic Ripple Impulse
    // -------------------------------------------------------------
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let clickImpulse = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      targetX = x * 0.55;
      targetY = -y * 0.42;
    };

    const handlePointerDown = () => {
      if (!interactive) return;
      clickImpulse = 1.0;
    };

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('resize', handleResize);

    // -------------------------------------------------------------
    // 7. Render Loop with Warp / Hyperdrive Progression
    // -------------------------------------------------------------
    let animId: number;
    const clock = new THREE.Clock();
    let warpProgress = 0; // 0 to 1

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Check warp state
      if (warpingRef.current) {
        warpProgress = Math.min(1.0, warpProgress + 0.016);
      } else {
        warpProgress = Math.max(0, warpProgress - 0.025);
      }

      // Camera position interpolation during warp (tplh.net vortex plunge)
      const targetCamZ = 8.2 - warpProgress * 6.5; // plunges from 8.2 down to 1.7
      camera.position.z += (targetCamZ - camera.position.z) * 0.08;

      // Click shockwave decay
      if (clickImpulse > 0) {
        clickImpulse = Math.max(0, clickImpulse - 0.035);
      }

      // Smooth camera / head inertia damping (lookMouse easing)
      currentX += (targetX - currentX) * 0.045;
      currentY += (targetY - currentY) * 0.045;

      const warpSpin = warpProgress * 4.5;
      headGroup.rotation.y = currentX + Math.sin(elapsed * 0.4) * 0.12 + warpSpin;
      headGroup.rotation.x = currentY + Math.cos(elapsed * 0.35) * 0.08;

      // Glow intensity ramp during warp
      wireMaterial.opacity = 0.32 + warpProgress * 0.65;
      coreMaterial.emissiveIntensity = 0.55 + warpProgress * 2.2;
      innerGlowMesh.scale.setScalar(1.0 + warpProgress * 0.8);

      // Inner core counter-rotation
      innerGlowMesh.rotation.y = -elapsed * (0.6 + warpProgress * 3.0);
      innerGlowMesh.rotation.x = elapsed * (0.35 + warpProgress * 2.0);

      // Tumbling petals around center
      const petalSpeedMultiplier = 1.0 + warpProgress * 6.0;
      petalsData.forEach((p) => {
        p.angle += p.speed * petalSpeedMultiplier;
        p.y -= 0.008 * petalSpeedMultiplier;
        if (p.y < -3.2) p.y = 3.2;

        const dynamicRad = p.baseRadius + warpProgress * 2.5 + clickImpulse * 0.5;
        p.mesh.position.x = Math.cos(p.angle) * dynamicRad;
        p.mesh.position.z = Math.sin(p.angle) * dynamicRad;
        p.mesh.position.y = p.y + Math.sin(elapsed * 1.5 + p.angle) * 0.15;

        p.mesh.rotation.x += p.rotSpeedX * petalSpeedMultiplier;
        p.mesh.rotation.y += p.rotSpeedY * petalSpeedMultiplier;
        p.mesh.rotation.z += p.rotSpeedZ * petalSpeedMultiplier;
      });

      // Swirling particle aura update + warp starfield stretch
      const posArr = pGeom.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const vel = pVelocities[i];
        vel.theta += vel.speedTheta * (1.0 + warpProgress * 4.0);
        vel.phi += vel.speedPhi * (1.0 + warpProgress * 4.0);

        const currentRad = vel.baseRadius + clickImpulse * 1.2 + warpProgress * 3.0;

        let posX = currentRad * Math.sin(vel.phi) * Math.cos(vel.theta);
        let posY = currentRad * Math.sin(vel.phi) * Math.sin(vel.theta) + Math.sin(elapsed + i) * 0.05;
        let posZ = currentRad * Math.cos(vel.phi);

        // During warp, stretch particles along Z toward the camera
        if (warpProgress > 0) {
          posZ += Math.sin(i * 12.3 + elapsed * 5.0) * warpProgress * 4.0;
        }

        posArr[i * 3] = posX;
        posArr[i * 3 + 1] = posY;
        posArr[i * 3 + 2] = posZ;
      }
      pGeom.attributes.position.needsUpdate = true;

      // Group breathing float
      rootGroup.position.y = Math.sin(elapsed * 0.7) * (0.08 * (1.0 - warpProgress));

      renderer.render(scene, camera);

      if (warpProgress >= 0.98 && warpingRef.current && onWarpComplete) {
        onWarpComplete();
      }
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);

      craniumGeom.dispose();
      coreMaterial.dispose();
      wireMaterial.dispose();
      innerGlowGeom.dispose();
      innerGlowMat.dispose();
      petalGeom.dispose();
      petalMat.dispose();
      pGeom.dispose();
      pMat.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive, particleCount, colorScheme, onWarpComplete]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
};
