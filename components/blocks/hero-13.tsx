"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, Suspense, useEffect } from "react";
import * as THREE from "three";
import { motion } from "motion/react";
import {
  Terminal,
  Cloud,
  Database,
  Code2,
  PlayCircle,
  Zap,
  CheckCircle2,
} from "lucide-react";

const glowVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const glowFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    float centerDist = abs(vUv.x - 0.5) * 2.0;

    float coreGlow = exp(-centerDist * 180.0) * 2.5;
    float midGlow = exp(-centerDist * 66.0) * 1.2;
    float outerGlow = exp(-centerDist * 6.0) * 0.5;
    float glow = coreGlow + midGlow + outerGlow;

    float pulse = sin(uTime * 1.5) * 0.08 + 0.92;
    glow *= pulse;

    float scanLine = sin(vUv.y * 60.0 + uTime * 2.0) * 0.02 + 0.98;
    glow *= scanLine;

    vec3 glowColor = vec3(1.0, 0.624, 0.988);

    float edgeDist = abs(vUv.y - 0.5) * 2.0;
    float vertFade = 1.0 - smoothstep(0.2, 0.95, edgeDist);
    glow *= vertFade;

    vec3 colorOut = glowColor * glow;
    float alpha = max(max(colorOut.r, colorOut.g), colorOut.b);
    vec3 normalizedColor = colorOut / max(alpha, 0.001);
    alpha = smoothstep(0.0, 1.0, alpha);

    gl_FragColor = vec4(normalizedColor, alpha);
  }
`;

const backgroundGlowFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    float centerDist = abs(vUv.x - 0.5) * 2.0;

    float wideGlow = exp(-centerDist * 3.0) * 0.8;
    float softGlow = exp(-centerDist * 1.0) * 0.4;
    float glow = wideGlow + softGlow;

    float pulse = sin(uTime * 1.2) * 0.1 + 0.9;
    glow *= pulse;

    vec3 glowColor = vec3(1.0, 0.624, 0.988);

    float edgeDistY = abs(vUv.y - 0.5) * 2.0;
    float vertFade = 1.0 - smoothstep(0.0, 1.0, edgeDistY);
    glow *= vertFade;

    float edgeDistX = abs(vUv.x - 0.5) * 2.0;
    float horizFade = 1.0 - smoothstep(0.4, 0.9, edgeDistX);
    glow *= horizFade;

    vec3 colorOut = glowColor * glow;
    float alpha = max(max(colorOut.r, colorOut.g), colorOut.b);
    vec3 normalizedColor = colorOut / max(alpha, 0.001);
    alpha = smoothstep(0.0, 1.0, alpha) * 0.6;

    gl_FragColor = vec4(normalizedColor, alpha);
  }
`;

function ResizeHandler(): null {
  const state = useThree();
  const glRef = useRef(state.gl);
  const cameraRef = useRef(state.camera);

  useEffect(
    function syncRefs() {
      glRef.current = state.gl;
      cameraRef.current = state.camera;
    },
    [state.gl, state.camera],
  );

  useEffect(
    function handleResize() {
      const canvas = state.gl.domElement;
      const parent = canvas.parentElement;
      if (!parent) return;

      const parentEl = parent;

      function updateSize() {
        const currentGl = glRef.current;
        const currentCamera = cameraRef.current;
        if (!currentGl || !currentCamera) return;

        const width = parentEl.clientWidth;
        const height = parentEl.clientHeight;
        if (width > 0 && height > 0) {
          currentGl.setSize(width, height);
          if (currentCamera instanceof THREE.PerspectiveCamera) {
            currentCamera.aspect = width / height;
            currentCamera.updateProjectionMatrix();
          }
        }
      }

      updateSize();

      const observer = new ResizeObserver(updateSize);
      observer.observe(parent);

      const interval = setInterval(updateSize, 500);
      setTimeout(updateSize, 100);
      setTimeout(updateSize, 300);
      setTimeout(updateSize, 1000);

      return function cleanup() {
        observer.disconnect();
        clearInterval(interval);
      };
    },
    [state.gl],
  );

  return null;
}

function ResponsiveGlowBar() {
  const { viewport } = useThree();

  const baseViewportWidth = 7.5;
  const scaleX = Math.min(viewport.width / baseViewportWidth, 1);

  return (
    <group scale={[scaleX, 1, 1]}>
      <GlowBar />
    </group>
  );
}

function GlowBar() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const bgMaterialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    [],
  );

  const bgUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    [],
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
    if (bgMaterialRef.current) {
      bgMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group position={[0, 0, 2]}>
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[4.0, 3.0]} />
        <shaderMaterial
          ref={bgMaterialRef}
          vertexShader={glowVertexShader}
          fragmentShader={backgroundGlowFragmentShader}
          uniforms={bgUniforms}
          transparent
          depthWrite={false}
        />
      </mesh>

      <mesh>
        <planeGeometry args={[0.7, 2.0]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={glowVertexShader}
          fragmentShader={glowFragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </mesh>
      <GlowParticles />
    </group>
  );
}

function GlowParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 40;
  const fadeDistance = 1.0;

  const velocitiesRef = useRef<Float32Array>(
    new Float32Array(particleCount * 3),
  );
  const lifetimesRef = useRef<Float32Array>(new Float32Array(particleCount));

  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const y = (i / particleCount - 0.5) * 1.2;
      positions[i * 3] = 0;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = (((i * 0.618) % 1.0) - 0.5) * 0.1;
    }

    return positions;
  }, [particleCount]);

  useEffect(() => {
    const velocities = velocitiesRef.current;
    const lifetimes = lifetimesRef.current;

    for (let i = 0; i < particleCount; i++) {
      const direction = i % 2 === 0 ? 1 : -1;
      velocities[i * 3] = direction * (((i * 0.382) % 1.0) * 0.012 + 0.004);
      velocities[i * 3 + 1] = (((i * 0.786) % 1.0) - 0.4) * 0.006;
      velocities[i * 3 + 2] = (((i * 0.214) % 1.0) - 0.5) * 0.003;

      lifetimes[i] = (i * 0.123) % 1.0;
    }
  }, [particleCount]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const opacities = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      opacities[i] = 1.0;
    }
    geo.setAttribute("aOpacity", new THREE.BufferAttribute(opacities, 1));
    return geo;
  }, [positions, particleCount]);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color("#FF9FFC") },
        uFadeDistance: { value: fadeDistance },
      },
      vertexShader: `
        attribute float aOpacity;
        varying float vOpacity;
        varying float vDistance;

        void main() {
          vOpacity = aOpacity;
          vDistance = abs(position.x);

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 7.0 * (1.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uFadeDistance;
        varying float vOpacity;
        varying float vDistance;

        void main() {
          float fade = 1.0 - smoothstep(0.0, uFadeDistance, vDistance);

          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

          float finalAlpha = alpha * fade * vOpacity * 1.5;
          gl_FragColor = vec4(uColor * 1.3, finalAlpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [fadeDistance]);

  useFrame((state) => {
    if (!particlesRef.current) return;

    const positionAttr = particlesRef.current.geometry.attributes.position;
    const opacityAttr = particlesRef.current.geometry.attributes.aOpacity;
    const posArray = positionAttr.array as Float32Array;
    const opacityArray = opacityAttr.array as Float32Array;
    const velocities = velocitiesRef.current;
    const lifetimes = lifetimesRef.current;

    for (let i = 0; i < particleCount; i++) {
      const currentLifetime = lifetimes[i] + 0.012;
      const newLifetime = currentLifetime > 1 ? 0 : currentLifetime;
      lifetimes[i] = newLifetime;

      if (currentLifetime > 1) {
        posArray[i * 3] = 0;
        posArray[i * 3 + 1] =
          (((i + state.clock.elapsedTime * 10) % particleCount) /
            particleCount -
            0.5) *
          1.2;
        posArray[i * 3 + 2] =
          (((i * 0.618 + state.clock.elapsedTime) % 1.0) - 0.5) * 0.1;

        const direction = i % 2 === 0 ? 1 : -1;
        velocities[i * 3] =
          direction *
          ((((i + state.clock.elapsedTime) * 0.382) % 1.0) * 0.012 + 0.004);
        velocities[i * 3 + 1] =
          ((((i + state.clock.elapsedTime) * 0.786) % 1.0) - 0.4) * 0.006;
      }

      posArray[i * 3] += velocities[i * 3];
      posArray[i * 3 + 1] +=
        velocities[i * 3 + 1] +
        Math.sin(state.clock.elapsedTime * 2 + i * 0.5) * 0.0008;
      posArray[i * 3 + 2] += velocities[i * 3 + 2];

      const dist = Math.abs(posArray[i * 3]);
      opacityArray[i] = Math.max(0, 1.0 - dist / fadeDistance);
    }

    positionAttr.needsUpdate = true;
    opacityAttr.needsUpdate = true;
  });

  return (
    <points ref={particlesRef} geometry={geometry} material={shaderMaterial} />
  );
}

function FloatingIcons() {
  const icons = [
    {
      Icon: Terminal,
      color: "text-neutral-900 dark:text-white",
      bg: "bg-white dark:bg-neutral-800",
      x: "65%",
      xMob: "20%",
      y: "25%",
      delay: 0,
    },
    {
      Icon: Cloud,
      color: "text-neutral-900 dark:text-white",
      bg: "bg-white dark:bg-neutral-800",
      x: "80%",
      xMob: "25%",
      y: "45%",
      delay: 0.2,
    },
    {
      Icon: Database,
      color: "text-neutral-900 dark:text-white",
      bg: "bg-white dark:bg-neutral-800",
      x: "60%",
      xMob: "15%",
      y: "60%",
      delay: 0.4,
    },
    {
      Icon: Code2,
      color: "text-neutral-900 dark:text-white",
      bg: "bg-white dark:bg-neutral-800",
      x: "45%",
      xMob: "10%",
      y: "40%",
      delay: 0.3,
    },
  ];

  return (
    <div className="absolute inset-y-0 left-0 w-full sm:w-1/2 pointer-events-none overflow-hidden">
      {icons.map((item, i) => (
        <motion.div
          key={i}
          className={`absolute p-4 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 ${item.bg} left-(--x-mob) sm:left-(--x-desk)`}
          style={
            {
              top: item.y,
              "--x-mob": item.xMob,
              "--x-desk": item.x,
            } as React.CSSProperties
          }
          animate={{
            y: [0, -8, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: item.delay,
          }}
        >
          <item.Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
        </motion.div>
      ))}
    </div>
  );
}

function ContentCards() {
  return (
    <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none flex items-center pl-8 sm:pl-12">
      <div className="relative w-full max-w-sm space-y-3">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 pointer-events-auto scale-90 sm:scale-100 origin-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 min-w-6 bg-neutral-200 dark:bg-neutral-700 rounded-md">
              <Zap className="w-4 h-4 text-neutral-900 dark:text-white" />
            </div>
            <span className="text-xs font-semibold text-neutral-800 dark:text-white truncate">
              API Response Time Optimization
            </span>
          </div>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-2 line-clamp-2">
            Reduced latency by 47% using edge caching and query optimization.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 pointer-events-auto ml-4 sm:ml-6 scale-90 sm:scale-100 origin-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 min-w-6 bg-neutral-200 dark:bg-neutral-700 rounded-md">
              <CheckCircle2 className="w-4 h-4 text-neutral-900 dark:text-white" />
            </div>
            <span className="text-xs font-semibold text-neutral-800 dark:text-white truncate">
              System Health Check
            </span>
          </div>
          <ul className="space-y-1 mb-2">
            <li className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-neutral-300" /> All
              services operational
            </li>
            <li className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-neutral-300" /> 99.9%
              uptime
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

export function Hero13() {
  return (
    <section className="w-full flex items-start lg:items-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <div className="max-w-[1400px] mx-auto w-full py-12">
        <div className="relative w-full flex flex-col items-center justify-start overflow-hidden">
          <div className="relative z-20 text-left sm:text-center max-w-3xl px-4 mb-12 pointer-events-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-6xl md:text-6xl text-neutral-900 dark:text-white mb-4 tracking-tight"
            >
              Ship faster, build better.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base tracking-tight sm:text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-lg mx-0 sm:mx-auto"
            >
              Transform your development workflow with intelligent automation
              and real-time insights that help teams deploy with confidence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-start sm:justify-center gap-4 w-full"
            >
              <button className="flex items-center gap-2 text-neutral-900 dark:text-white font-medium hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors text-sm sm:text-base cursor-pointer">
                View Demo <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 rounded-full font-medium shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-sm sm:text-base cursor-pointer">
                Start Building
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 flex items-center justify-start sm:justify-center gap-2"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white dark:border-neutral-950 bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center"
                  >
                    <span className="text-[8px] sm:text-xs text-neutral-600 dark:text-neutral-400">
                      {i}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                <span className="text-yellow-500">★★★★★</span> trusted by 5,000+
                developers
              </div>
            </motion.div>
          </div>

          <div className="relative w-full max-w-5xl mx-auto h-[400px] sm:h-[500px] -mt-10 sm:-mt-[60px]">
            <div className="absolute inset-0 z-20 pointer-events-none">
              <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ResizeHandler />
                <Suspense fallback={null}>
                  <ResponsiveGlowBar />
                </Suspense>
              </Canvas>
            </div>

            <div className="absolute inset-0 z-10 pointer-events-none">
              <FloatingIcons />
              <ContentCards />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white dark:from-neutral-950 to-transparent z-30 sm:hidden" />
        </div>
      </div>
    </section>
  );
}

export default Hero13;
