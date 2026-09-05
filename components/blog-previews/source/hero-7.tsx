"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useMemo, useRef, Suspense, useEffect } from "react";
import * as THREE from "three";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const carouselVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const carouselFragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform float uBarWidth;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  float bayerDither(vec2 position) {
    int x = int(mod(position.x, 8.0));
    int y = int(mod(position.y, 8.0));

    int index = x + y * 8;
    float threshold = 0.0;

    if (index == 0) threshold = 0.0/64.0;
    else if (index == 1) threshold = 32.0/64.0;
    else if (index == 2) threshold = 8.0/64.0;
    else if (index == 3) threshold = 40.0/64.0;
    else if (index == 4) threshold = 2.0/64.0;
    else if (index == 5) threshold = 34.0/64.0;
    else if (index == 6) threshold = 10.0/64.0;
    else if (index == 7) threshold = 42.0/64.0;
    else if (index == 8) threshold = 48.0/64.0;
    else if (index == 9) threshold = 16.0/64.0;
    else if (index == 10) threshold = 56.0/64.0;
    else if (index == 11) threshold = 24.0/64.0;
    else if (index == 12) threshold = 50.0/64.0;
    else if (index == 13) threshold = 18.0/64.0;
    else if (index == 14) threshold = 58.0/64.0;
    else if (index == 15) threshold = 26.0/64.0;
    else if (index == 16) threshold = 12.0/64.0;
    else if (index == 17) threshold = 44.0/64.0;
    else if (index == 18) threshold = 4.0/64.0;
    else if (index == 19) threshold = 36.0/64.0;
    else if (index == 20) threshold = 14.0/64.0;
    else if (index == 21) threshold = 46.0/64.0;
    else if (index == 22) threshold = 6.0/64.0;
    else if (index == 23) threshold = 38.0/64.0;
    else if (index == 24) threshold = 60.0/64.0;
    else if (index == 25) threshold = 28.0/64.0;
    else if (index == 26) threshold = 52.0/64.0;
    else if (index == 27) threshold = 20.0/64.0;
    else if (index == 28) threshold = 62.0/64.0;
    else if (index == 29) threshold = 30.0/64.0;
    else if (index == 30) threshold = 54.0/64.0;
    else if (index == 31) threshold = 22.0/64.0;
    else threshold = mod(float(index) * 0.125, 1.0);

    return threshold;
  }

  float roundedRectSDF(vec2 p, vec2 b, float r) {
    vec2 d = abs(p) - b + vec2(r);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
  }

  void main() {
    vec4 texColor = texture2D(uTexture, vUv);

    float barTransition = smoothstep(-uBarWidth, uBarWidth, vWorldPosition.x);

    float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
    vec3 grayscaleColor = vec3(gray);

    vec2 pixelPos = vUv * uResolution;
    float ditherThreshold = bayerDither(pixelPos);

    float levels = 4.0;
    float quantized = floor(gray * levels + ditherThreshold) / levels;
    vec3 ditheredGray = vec3(quantized);

    vec3 finalColor = mix(ditheredGray, texColor.rgb, barTransition);

    vec2 centeredUv = vUv * 2.0 - 1.0;
    float cornerRadius = 0.1;
    float dist = roundedRectSDF(centeredUv, vec2(1.0, 1.0), cornerRadius);
    float alpha = 1.0 - smoothstep(-0.02, 0.02, dist);

    gl_FragColor = vec4(finalColor, alpha * texColor.a);
  }
`;

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

    float coreGlow = exp(-centerDist * 60.0) * 2.5;
    float midGlow = exp(-centerDist * 12.0) * 1.2;
    float outerGlow = exp(-centerDist * 4.0) * 0.5;
    float glow = coreGlow + midGlow + outerGlow;

    float pulse = sin(uTime * 1.5) * 0.08 + 0.92;
    glow *= pulse;

    float scanLine = sin(vUv.y * 60.0 + uTime * 2.0) * 0.02 + 0.98;
    glow *= scanLine;

    vec3 glowColor = vec3(1.0, 0.624, 0.988);

    float edgeDist = abs(vUv.y - 0.5) * 2.0;
    float vertFade = 1.0 - smoothstep(0.2, 0.95, edgeDist);
    glow *= vertFade;

    gl_FragColor = vec4(glowColor * glow, glow);
  }
`;

const CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
];

interface CarouselItemProps {
  texture: THREE.Texture;
  index: number;
  totalItems: number;
  rotationRef: React.RefObject<number>;
  radius: number;
}

function CarouselItem({
  texture,
  index,
  totalItems,
  rotationRef,
  radius,
}: CarouselItemProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uResolution: { value: new THREE.Vector2(400, 300) },
      uBarWidth: { value: 0.1 },
    }),
    [texture],
  );

  useFrame(() => {
    if (!meshRef.current) return;

    const anglePerItem = (Math.PI * 2) / totalItems;
    const baseAngle = index * anglePerItem;
    const currentAngle = baseAngle + rotationRef.current;

    const normalizedAngle =
      (((currentAngle % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) -
      Math.PI;

    const x = Math.sin(normalizedAngle) * radius;
    const z = -Math.cos(normalizedAngle) * radius + radius * 0.1;

    meshRef.current.position.set(x, 0, z);
    meshRef.current.rotation.y = -normalizedAngle;

    const isBehind = Math.abs(normalizedAngle) > Math.PI * 0.7;
    meshRef.current.visible = !isBehind;
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[3.0, 2.0]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={carouselVertexShader}
        fragmentShader={carouselFragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function GlowParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 80;
  const fadeDistance = 0.4;

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
  }, [positions]);

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
          gl_PointSize = 20.0 * (1.0 / -mvPosition.z);
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

          gl_FragColor = vec4(uColor, alpha * fade * vOpacity * 0.8);
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

function GlowBar() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    [],
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group position={[0, 0, 2]}>
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

function ResizeHandler() {
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const { gl, camera } = useThree();

  useEffect(() => {
    glRef.current = gl;
    cameraRef.current = camera;
  }, [gl, camera]);

  useEffect(() => {
    const canvas = gl.domElement;
    const parent = canvas.parentElement;
    if (!parent) return;

    const updateSize = () => {
      const currentGl = glRef.current;
      const currentCamera = cameraRef.current;
      if (!currentGl || !currentCamera) return;

      const width = parent.clientWidth;
      const height = parent.clientHeight;
      if (width > 0 && height > 0) {
        currentGl.setSize(width, height);
        if (currentCamera instanceof THREE.PerspectiveCamera) {
          currentCamera.aspect = width / height;
          currentCamera.updateProjectionMatrix();
        }
      }
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(parent);

    const interval = setInterval(updateSize, 500);
    setTimeout(updateSize, 100);
    setTimeout(updateSize, 300);
    setTimeout(updateSize, 1000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [gl]);

  return null;
}

function CarouselScene() {
  const textures = useTexture(CAROUSEL_IMAGES);
  const rotationRef = useRef(0);
  const radius = 4.5;

  useFrame((state) => {
    rotationRef.current = state.clock.elapsedTime * 0.15;
  });

  return (
    <group>
      {textures.map((texture, index) => (
        <CarouselItem
          key={index}
          texture={texture}
          index={index}
          totalItems={textures.length}
          rotationRef={rotationRef}
          radius={radius}
        />
      ))}
      <GlowBar />
    </group>
  );
}

function Scene() {
  return (
    <group scale={1}>
      <CarouselScene />
    </group>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <meshBasicMaterial color="#1a1a1a" />
    </mesh>
  );
}

export function Hero7() {
  return (
    <section className="relative w-full min-h-screen bg-white dark:bg-neutral-950 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-20 flex flex-col items-start sm:items-center text-left sm:text-center pt-12 sm:pt-16 md:pt-20 px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-neutral-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl"
        >
          Transform Your Vision
          <br />
          Into Reality
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed"
        >
          Bring your creative ideas to life with powerful tools.
          <br className="hidden sm:block" />
          No experience required, just imagination.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto mt-6 sm:mt-8 px-5 sm:px-6 py-2.5 sm:py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 rounded-full text-neutral-900 dark:text-white text-sm sm:text-base font-medium flex items-center justify-center sm:justify-start gap-2 transition-colors cursor-pointer"
        >
          Get Started
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="absolute inset-0 z-10 translate-y-[50px] sm:translate-y-[150px] xl:translate-y-[100px]">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 45 }}
          dpr={[1, 2]}
          frameloop="always"
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
          style={{ background: "transparent" }}
        >
          <ResizeHandler />
          <Suspense fallback={<LoadingFallback />}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
}

export default Hero7;
