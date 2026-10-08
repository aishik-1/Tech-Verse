import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Layers, Activity, Eye, Zap, RefreshCw } from 'lucide-react';

export type VisualMode = 'matrix' | 'neural' | 'quantum';

interface ThreeHeroCanvasProps {
  className?: string;
  interactive?: boolean;
  onNodeHover?: (nodeName: string | null) => void;
}

export const ThreeHeroCanvas: React.FC<ThreeHeroCanvasProps> = ({
  className = '',
  interactive = true,
  onNodeHover,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [currentMode, setCurrentMode] = useState<VisualMode>('matrix');
  const [wireframeOnly, setWireframeOnly] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // References to communicate with ThreeJS animation loop
  const modeRef = useRef<VisualMode>('matrix');
  const wireframeRef = useRef(false);
  const isPausedRef = useRef(false);
  const pulseTriggerRef = useRef<number>(0);

  modeRef.current = currentMode;
  wireframeRef.current = wireframeOnly;
  isPausedRef.current = isPaused;

  const triggerPulse = useCallback(() => {
    pulseTriggerRef.current = 1.0;
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL
    let gl: WebGLRenderingContext | null = null;
    try {
      const testCanvas = document.createElement('canvas');
      gl = (testCanvas.getContext('webgl') ||
        testCanvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (!gl) return;
    } catch {
      return;
    }

    // 1. Scene, Camera, Fog Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06080d, 0.028);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 9.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Master World Group for Parallax
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // -------------------------------------------------------------
    // Perspective Cyber Grid Floor (Fades into horizon fog)
    // -------------------------------------------------------------
    const gridHelper = new THREE.GridHelper(30, 40, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -3.2;
    // Set material opacity
    const gridMat = gridHelper.material as THREE.LineBasicMaterial;
    gridMat.transparent = true;
    gridMat.opacity = 0.25;
    scene.add(gridHelper);

    // -------------------------------------------------------------
    // Mode 1: Cyber Matrix Core (Faceted Polyhedron + Rings)
    // -------------------------------------------------------------
    const matrixGroup = new THREE.Group();
    worldGroup.add(matrixGroup);

    // Core solid faceted mesh
    const coreGeom = new THREE.IcosahedronGeometry(2.0, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x07111e,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.2,
      roughness: 0.12,
      metalness: 0.88,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.95,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    matrixGroup.add(coreMesh);

    // Wireframe glowing exoskeleton
    const exoGeom = new THREE.IcosahedronGeometry(2.06, 1);
    const exoMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const exoMesh = new THREE.Mesh(exoGeom, exoMat);
    matrixGroup.add(exoMesh);

    // Double Orbital Gyroscope Rings
    const ringGeom1 = new THREE.TorusGeometry(3.1, 0.022, 16, 120);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.7,
    });
    const ringMesh1 = new THREE.Mesh(ringGeom1, ringMat1);
    ringMesh1.rotation.x = Math.PI / 3;
    ringMesh1.rotation.y = Math.PI / 6;
    matrixGroup.add(ringMesh1);

    const ringGeom2 = new THREE.TorusGeometry(3.6, 0.018, 16, 120);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5,
    });
    const ringMesh2 = new THREE.Mesh(ringGeom2, ringMat2);
    ringMesh2.rotation.x = -Math.PI / 4;
    ringMesh2.rotation.z = Math.PI / 4;
    matrixGroup.add(ringMesh2);

    // -------------------------------------------------------------
    // Mode 2: Neural Synapse Lattice (Nodes + Dynamic Connecting Lines)
    // -------------------------------------------------------------
    const neuralGroup = new THREE.Group();
    neuralGroup.visible = false;
    worldGroup.add(neuralGroup);

    const neuralNodeCount = 42;
    const neuralPositions: THREE.Vector3[] = [];
    const neuralMeshObjects: THREE.Mesh[] = [];

    const nodeSphereGeom = new THREE.SphereGeometry(0.09, 12, 12);
    const nodeSphereMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.9,
    });

    for (let i = 0; i < neuralNodeCount; i++) {
      const radius = 1.4 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const pos = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
      neuralPositions.push(pos);

      const nodeMesh = new THREE.Mesh(nodeSphereGeom, nodeSphereMat);
      nodeMesh.position.copy(pos);
      neuralGroup.add(nodeMesh);
      neuralMeshObjects.push(nodeMesh);
    }

    // Connect close neighbors with dynamic line segments
    const lineIndices: number[] = [];
    const maxConnectionDist = 1.75;
    for (let i = 0; i < neuralNodeCount; i++) {
      for (let j = i + 1; j < neuralNodeCount; j++) {
        if (neuralPositions[i].distanceTo(neuralPositions[j]) < maxConnectionDist) {
          lineIndices.push(i, j);
        }
      }
    }

    const linePositions = new Float32Array(lineIndices.length * 3);
    for (let i = 0; i < lineIndices.length; i++) {
      const p = neuralPositions[lineIndices[i]];
      linePositions[i * 3] = p.x;
      linePositions[i * 3 + 1] = p.y;
      linePositions[i * 3 + 2] = p.z;
    }

    const neuralLinesGeom = new THREE.BufferGeometry();
    neuralLinesGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const neuralLinesMat = new THREE.LineBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.45,
    });
    const neuralLines = new THREE.LineSegments(neuralLinesGeom, neuralLinesMat);
    neuralGroup.add(neuralLines);

    // -------------------------------------------------------------
    // Mode 3: Quantum Wave Torus (Undulating Surface with dynamic vertices)
    // -------------------------------------------------------------
    const quantumGroup = new THREE.Group();
    quantumGroup.visible = false;
    worldGroup.add(quantumGroup);

    const quantumGeom = new THREE.TorusKnotGeometry(1.6, 0.45, 128, 32);
    const quantumMat = new THREE.MeshPhysicalMaterial({
      color: 0x091427,
      emissive: 0xa855f7,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false,
      clearcoat: 0.9,
    });
    const quantumMesh = new THREE.Mesh(quantumGeom, quantumMat);
    quantumGroup.add(quantumMesh);

    const quantumWireMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const quantumWireMesh = new THREE.Mesh(quantumGeom, quantumWireMat);
    quantumGroup.add(quantumWireMesh);

    // -------------------------------------------------------------
    // Orbiting Satellite Tech Polyhedra with Interactive Raycasting
    // -------------------------------------------------------------
    const satelliteNodes: Array<{
      mesh: THREE.Mesh;
      angle: number;
      radius: number;
      speed: number;
      name: string;
      baseScale: number;
    }> = [];

    const nodeLabels = [
      'BST::HACKTOBERFEST_2026',
      'BST::AI_SYSTEMS',
      'BST::WEB3_VAULT',
      'BST::CLOUD_NATIVE',
      'BST::CYBERSEC_LAB',
      'BST::ROBOTICS_CORE',
    ];

    const satGeom = new THREE.OctahedronGeometry(0.3, 0);
    const satBaseMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.1,
    });

    nodeLabels.forEach((label, i) => {
      const angle = (i / nodeLabels.length) * Math.PI * 2;
      const mesh = new THREE.Mesh(satGeom, satBaseMat.clone());
      mesh.name = label;
      worldGroup.add(mesh);

      satelliteNodes.push({
        mesh,
        angle,
        radius: 3.3 + (i % 2) * 0.6,
        speed: 0.25 + (i % 3) * 0.08,
        name: label,
        baseScale: 1.0,
      });
    });

    // -------------------------------------------------------------
    // Particle Starfield / Space Dust
    // -------------------------------------------------------------
    const particleCount = 380;
    const particleGeom = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const r = 3.5 + Math.random() * 9.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPositions[i * 3 + 2] = r * Math.cos(phi);

      if (i % 2 === 0) {
        pColors[i * 3] = 0.02;
        pColors[i * 3 + 1] = 0.71;
        pColors[i * 3 + 2] = 0.83; // Cyan #06B6D4
      } else {
        pColors[i * 3] = 0.65;
        pColors[i * 3 + 1] = 0.33;
        pColors[i * 3 + 2] = 0.96; // Purple #A855F7
      }
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    particleGeom.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeom, particleMat);
    worldGroup.add(particles);

    // -------------------------------------------------------------
    // Expanding Shockwave Energy Ring on Click
    // -------------------------------------------------------------
    const shockwaveGeom = new THREE.RingGeometry(0.1, 0.16, 64);
    const shockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
    });
    const shockwaveMesh = new THREE.Mesh(shockwaveGeom, shockwaveMat);
    shockwaveMesh.rotation.x = -Math.PI / 2;
    shockwaveMesh.position.y = -0.5;
    worldGroup.add(shockwaveMesh);

    // -------------------------------------------------------------
    // Lighting: Three-Point Studio Lighting
    // -------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0x091424, 2.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x06b6d4, 4.5);
    keyLight.position.set(5, 5, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 5.2);
    rimLight.position.set(-6, -3, -5);
    scene.add(rimLight);

    const topFill = new THREE.PointLight(0x38bdf8, 2.5, 20);
    topFill.position.set(0, 6, 3);
    scene.add(topFill);

    // -------------------------------------------------------------
    // Mouse Interaction with Raycasting & Damping
    // -------------------------------------------------------------
    const mouse = new THREE.Vector2(-999, -999);
    const raycaster = new THREE.Raycaster();
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      mouse.x = x;
      mouse.y = y;

      targetRotationY = x * 0.45;
      targetRotationX = -y * 0.35;
    };

    const handlePointerDown = () => {
      pulseTriggerRef.current = 1.0;
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

    // Visibility Handling (save GPU when backgrounded)
    let isTabVisible = true;
    const handleVisibility = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // -------------------------------------------------------------
    // Animation Loop
    // -------------------------------------------------------------
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let shockwaveScale = 0;
    let shockwaveOpacity = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isTabVisible || isPausedRef.current) {
        return;
      }

      const elapsed = clock.getElapsedTime();
      const activeMode = modeRef.current;
      const isWire = wireframeRef.current;

      // Visibility toggles based on active visual mode
      matrixGroup.visible = activeMode === 'matrix';
      neuralGroup.visible = activeMode === 'neural';
      quantumGroup.visible = activeMode === 'quantum';

      coreMesh.visible = !isWire;
      quantumMesh.visible = !isWire;

      // Handle Energy Shockwave Pulse
      if (pulseTriggerRef.current > 0) {
        shockwaveScale = 0.5;
        shockwaveOpacity = 0.9;
        pulseTriggerRef.current = 0;
      }

      if (shockwaveOpacity > 0.01) {
        shockwaveScale += 0.08;
        shockwaveOpacity *= 0.94;
        shockwaveMesh.scale.set(shockwaveScale, shockwaveScale, shockwaveScale);
        shockwaveMat.opacity = shockwaveOpacity;
      } else {
        shockwaveMat.opacity = 0;
      }

      // 1. Matrix Mode Animations
      if (activeMode === 'matrix') {
        const pulse = Math.sin(elapsed * 2.0) * 0.03;
        coreMesh.rotation.y = elapsed * 0.22;
        coreMesh.rotation.x = Math.sin(elapsed * 0.15) * 0.2;
        coreMesh.scale.set(1 + pulse, 1 + pulse, 1 + pulse);

        exoMesh.rotation.y = elapsed * 0.22;
        exoMesh.rotation.x = Math.sin(elapsed * 0.15) * 0.2;
        exoMesh.scale.set(1.03 + pulse, 1.03 + pulse, 1.03 + pulse);

        ringMesh1.rotation.z = elapsed * 0.2;
        ringMesh2.rotation.z = -elapsed * 0.16;
      }

      // 2. Neural Mode Animations
      if (activeMode === 'neural') {
        neuralGroup.rotation.y = elapsed * 0.15;
        neuralGroup.rotation.x = Math.cos(elapsed * 0.1) * 0.1;
      }

      // 3. Quantum Mode Animations
      if (activeMode === 'quantum') {
        quantumMesh.rotation.x = elapsed * 0.25;
        quantumMesh.rotation.y = elapsed * 0.35;
        quantumWireMesh.rotation.x = elapsed * 0.25;
        quantumWireMesh.rotation.y = elapsed * 0.35;
      }

      // Animate Orbiting Satellites
      satelliteNodes.forEach((node, i) => {
        const a = node.angle + elapsed * node.speed;
        node.mesh.position.set(
          Math.cos(a) * node.radius,
          Math.sin(a) * (node.radius * 0.4) + Math.sin(elapsed * 2 + i) * 0.3,
          Math.sin(a) * 1.6
        );
        node.mesh.rotation.x += 0.02;
        node.mesh.rotation.y += 0.03;
      });

      // Raycasting Hover for Satellites
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        satelliteNodes.map((n) => n.mesh)
      );

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const matched = satelliteNodes.find((n) => n.mesh === hitMesh);
        if (matched) {
          hitMesh.scale.set(1.5, 1.5, 1.5);
          (hitMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.8;
          setHoveredNode(matched.name);
          if (onNodeHover) onNodeHover(matched.name);
        }
      } else {
        satelliteNodes.forEach((n) => {
          n.mesh.scale.set(1, 1, 1);
          (n.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5;
        });
        setHoveredNode(null);
        if (onNodeHover) onNodeHover(null);
      }

      // Particle subtle spin
      particles.rotation.y = elapsed * 0.03;

      // Parallax Interpolation (Lerp to mouse)
      worldGroup.rotation.y += (targetRotationY - worldGroup.rotation.y) * 0.05;
      worldGroup.rotation.x += (targetRotationX - worldGroup.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('click', handlePointerDown);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animationFrameId);

      coreGeom.dispose();
      coreMat.dispose();
      exoGeom.dispose();
      exoMat.dispose();
      ringGeom1.dispose();
      ringMat1.dispose();
      ringGeom2.dispose();
      ringMat2.dispose();
      nodeSphereGeom.dispose();
      nodeSphereMat.dispose();
      neuralLinesGeom.dispose();
      neuralLinesMat.dispose();
      quantumGeom.dispose();
      quantumMat.dispose();
      quantumWireMat.dispose();
      satGeom.dispose();
      satBaseMat.dispose();
      particleGeom.dispose();
      particleMat.dispose();
      shockwaveGeom.dispose();
      shockwaveMat.dispose();
      gridHelper.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive, onNodeHover]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      aria-label="Interactive 3D Visualizer"
    >
      {/* Interactive 3D Control HUD Overlay */}
      <div className="absolute top-4 right-4 z-20 pointer-events-auto flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-2xl">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-black/40 rounded-xl">
          <button
            onClick={() => setCurrentMode('matrix')}
            className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg transition-all ${
              currentMode === 'matrix'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Cyber Matrix Core"
          >
            Matrix
          </button>
          <button
            onClick={() => setCurrentMode('neural')}
            className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg transition-all ${
              currentMode === 'neural'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Neural Synapse Lattice"
          >
            Neural
          </button>
          <button
            onClick={() => setCurrentMode('quantum')}
            className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg transition-all ${
              currentMode === 'quantum'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Quantum Wave Torus"
          >
            Quantum
          </button>
        </div>

        {/* Wireframe Toggle */}
        <button
          onClick={() => setWireframeOnly(!wireframeOnly)}
          className={`p-1.5 rounded-xl border transition-all ${
            wireframeOnly
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-black/30 text-slate-400 hover:text-white border-white/5'
          }`}
          title="Toggle Wireframe Exoskeleton"
          aria-label="Toggle wireframe"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>

        {/* Pulse Shockwave Button */}
        <button
          onClick={triggerPulse}
          className="p-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 transition-all active:scale-95"
          title="Emit Kinetic Shockwave Pulse"
          aria-label="Emit pulse"
        >
          <Zap className="w-3.5 h-3.5" />
        </button>

        {/* Pause/Play Toggle */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`p-1.5 rounded-xl border transition-all ${
            isPaused
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-black/30 text-slate-400 hover:text-white border-white/5'
          }`}
          title={isPaused ? 'Resume Rotation' : 'Freeze 3D Core'}
          aria-label="Pause or play"
        >
          <Activity className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Raycasted Node Badge Notification */}
      {hoveredNode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 backdrop-blur-md shadow-xl text-xs font-mono text-cyan-300 animate-in fade-in slide-in-from-bottom-2">
          <span>Active Node: </span>
          <span className="font-bold text-white">{hoveredNode}</span>
        </div>
      )}
    </div>
  );
};
