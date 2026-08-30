"use client";

import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { Image as DreiImage } from "@react-three/drei";
import * as THREE from "three";
import {
  useSpring,
  useMotionValue,
  motion,
  type MotionValue,
} from "motion/react";

interface ShowcaseItem {
  id: number;
  title: string;
  category: string;
  image: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 1,
    title: "Nothing Great Comes Alive Alone",
    category: "Brand Identity",
    image:
      "https://cdn.dribbble.com/userupload/46030284/file/8dfdc9a8b09fdbd99b010c1dcb279841.jpg?resize=1024x1693&vertical=center",
  },
  {
    id: 2,
    title: "Lost in the Abstract",
    category: "Art Direction",
    image:
      "https://cdn.dribbble.com/userupload/46029941/file/f3b0e906d38980bf48e008f5542a58b5.jpg?resize=1024x1693&vertical=center",
  },
  {
    id: 3,
    title: "Geometric Perspectives",
    category: "Digital Art",
    image:
      "https://cdn.dribbble.com/userupload/45777759/file/acf14657b38cd25e64bb16b4f201bef8.jpg?resize=1024x1529&vertical=center",
  },
];

const CARD_WIDTH = 4;
const CARD_HEIGHT = 5.6;
const RADIUS = 2.5;

const START_RADIUS = 0;
const FINAL_RADIUS = 2.5;

function CarouselCard({
  item,
  index,
  count,
  introSpring,
}: {
  item: ShowcaseItem;
  index: number;
  count: number;
  introSpring: MotionValue<number>;
}) {
  const angle = (index / count) * Math.PI * 2;
  const group = useRef<THREE.Group>(null);
  const imageRef = useRef<
    THREE.Mesh & { material: THREE.Material & { opacity: number } }
  >(null);

  useFrame(() => {
    if (!group.current || !imageRef.current) return;
    const progress = introSpring.get();

    const currentRadius = THREE.MathUtils.lerp(
      START_RADIUS,
      FINAL_RADIUS,
      progress,
    );
    group.current.position.z = currentRadius;

    const currentScale = THREE.MathUtils.lerp(0.5, 1, progress);
    group.current.scale.setScalar(currentScale);

    imageRef.current.material.opacity = progress;

    const currentY = THREE.MathUtils.lerp(-2, 0, progress);
    group.current.position.y = currentY;
  });

  return (
    <group rotation={[0, angle, 0]}>
      <group ref={group} position={[0, 0, FINAL_RADIUS]}>
        <DreiImage
          ref={imageRef}
          url={item.image}
          transparent
          side={THREE.DoubleSide}
          toneMapped={false}
          scale={[CARD_WIDTH, CARD_HEIGHT] as [number, number]}
        />
      </group>
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

function Rig({
  onActiveIndexChange,
}: {
  onActiveIndexChange: (index: number) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const dragX = useMotionValue(0);
  const rotation = useSpring(dragX, {
    stiffness: 260,
    damping: 20,
    mass: 1,
  });

  const introSpring = useSpring(0, {
    stiffness: 50,
    damping: 15,
  });

  useEffect(() => {
    setTimeout(() => introSpring.set(1), 200);
  }, [introSpring]);

  const { viewport } = useThree();

  const isMobile = viewport.width < 10;
  const baseScale = isMobile ? 0.7 : 1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const segment = (Math.PI * 2) / 3;
      const currentTarget = dragX.get();
      const currentIndex = Math.round(currentTarget / segment);

      if (e.key === "ArrowLeft") {
        dragX.set((currentIndex - 1) * segment);
        const newIndex = ((-(currentIndex - 1) % 3) + 3) % 3;
        onActiveIndexChange(newIndex);
      } else if (e.key === "ArrowRight") {
        dragX.set((currentIndex + 1) * segment);
        const newIndex = ((-(currentIndex + 1) % 3) + 3) % 3;
        onActiveIndexChange(newIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dragX, onActiveIndexChange]);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    setIsDragging(true);
    setStartX(e.nativeEvent.clientX);
    (e.nativeEvent.target as Element).setPointerCapture(
      e.nativeEvent.pointerId,
    );
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    const deltaX = e.nativeEvent.clientX - startX;
    setStartX(e.nativeEvent.clientX);
    const rotateSpeed = 0.005;
    dragX.set(dragX.get() + deltaX * rotateSpeed);
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    setIsDragging(false);
    (e.nativeEvent.target as Element).releasePointerCapture(
      e.nativeEvent.pointerId,
    );

    const segment = (Math.PI * 2) / 3;
    const currentLogicalIndex = dragX.get() / segment;
    const velocity = rotation.getVelocity();
    const velocityThreshold = 0.2;

    let snapIndex = Math.round(currentLogicalIndex);

    if (Math.abs(velocity) > velocityThreshold) {
      const direction = Math.sign(velocity);
      const currentVisualIndex = Math.round(rotation.get() / segment);
      snapIndex = currentVisualIndex + direction;
    }

    const snapTarget = snapIndex * segment;
    dragX.set(snapTarget);

    const normIndex = ((-snapIndex % 3) + 3) % 3;
    onActiveIndexChange(normIndex);
  };

  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y = rotation.get();
  });

  return (
    <>
      <mesh
        position={[0, 0, RADIUS]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
      </mesh>

      <group ref={group} scale={baseScale}>
        {SHOWCASE_ITEMS.map((item, i) => (
          <CarouselCard
            key={item.id}
            item={item}
            index={i}
            count={SHOWCASE_ITEMS.length}
            introSpring={introSpring}
          />
        ))}
      </group>
    </>
  );
}

export function Showcase3() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const checkReady = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setIsReady(true);
        } else {
          requestAnimationFrame(checkReady);
        }
      }
    };
    checkReady();
  }, []);

  return (
    <section className="w-full py-12 bg-white dark:bg-neutral-950 overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-neutral-900 dark:text-white mb-4"
          >
            Case Studies
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400"
          >
            See others we&apos;ve helped with this program
          </motion.p>
        </div>

        <div className="flex flex-col items-center justify-center w-full relative">
          <div
            ref={containerRef}
            className="h-[300px] sm:h-[400px] w-full cursor-grab active:cursor-grabbing"
          >
            {isReady && (
              <Canvas
                camera={{ position: [0, 0, 11], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 2]}
                frameloop="always"
              >
                <ResizeHandler />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <Rig onActiveIndexChange={setActiveIndex} />
              </Canvas>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="w-full text-center mt-8 pointer-events-none"
          >
            <div className="inline-block transition-all duration-500 transform translate-y-0 opacity-100">
              <span className="block text-sm font-medium text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wider">
                {SHOWCASE_ITEMS[activeIndex].category}
              </span>
              <h3 className="text-2xl font-medium tracking-tight text-neutral-900 dark:text-white">
                {SHOWCASE_ITEMS[activeIndex].title}
              </h3>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default Showcase3;
