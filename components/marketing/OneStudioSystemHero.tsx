"use client";

import { motion } from "motion/react";
import { useEffect, useState, type CSSProperties } from "react";
import styles from "./OneStudioSystemHero.module.css";
import { HERO_PLAYBACK_DURATION, HERO_STORY_DURATION, HERO_TIMELINE } from "./oneStudioHeroTimeline";

type IconName = "website" | "bookings" | "clients" | "payments" | "calendar" | "documents" | "notifications" | "analytics" | "automations" | "ssl";
type NodeDetail = "counterOrbit" | "emittedArrows" | "movingRays" | "lightStreaks" | "emittedLight";
type Point = readonly [number, number];

const CYCLE = HERO_STORY_DURATION;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const NETWORK_CONVERGENCE_START = HERO_TIMELINE.networkConvergence.start;
const NETWORK_CONVERGENCE_END = HERO_TIMELINE.networkConvergence.end;
const PRIMARY_COMPLETE_AT = HERO_TIMELINE.primaryPage.completeAt;
const MULTI_PAGE_START = HERO_TIMELINE.multiPage.start;
const FINAL_FORMED_AT = HERO_TIMELINE.multiPage.formedAt;
const FINAL_SHRINK_START = HERO_TIMELINE.finalExit.shrinkStart;
const CLEAN_RESET_AT = HERO_TIMELINE.finalExit.resetAt;
const PUCK_SHRINK_START = HERO_TIMELINE.puck.shrinkStart;
const PUCK_SHRINK_END = HERO_TIMELINE.puck.shrinkEnd;
const PRIMARY_PAIR_REDUCE_START = HERO_TIMELINE.pairSettle.reduceStart;
const PRIMARY_PAIR_REDUCED_AT = HERO_TIMELINE.pairSettle.reducedAt;
const THIRD_NODE_REVEAL_START = HERO_TIMELINE.thirdNode.revealStart;
const THIRD_NODE_REVEAL_END = HERO_TIMELINE.thirdNode.revealEnd;
const SECOND_TO_THIRD_CONNECTION_START = HERO_TIMELINE.thirdNode.connectionStart;
const FINAL_PAGE_SCALE = .616;
const PAGE_WRAPPER_ASPECT = 1.52;
const PAGE_BASE_RATIO = .79;
const PAGE_PLANE_COMPRESSION = .46;
const PAGE_ROTATION_DEGREES = -52;
const PAGE_ROTATION_RADIANS = PAGE_ROTATION_DEGREES * Math.PI / 180;
const PAGE_WIDTH_IN_WRAPPER = PAGE_BASE_RATIO / PAGE_WRAPPER_ASPECT;
const PAGE_WRAPPER_RATIO = .88;
const MAKE_LATTICE_STEP_RATIO = 1.14;
const FINAL_PAGE_LONG_STEP: Point = [
  -Math.sin(PAGE_ROTATION_RADIANS) * (PAGE_WRAPPER_RATIO / PAGE_WRAPPER_ASPECT) * FINAL_PAGE_SCALE * MAKE_LATTICE_STEP_RATIO * 100,
  Math.cos(PAGE_ROTATION_RADIANS) * PAGE_PLANE_COMPRESSION * (PAGE_WRAPPER_RATIO / PAGE_WRAPPER_ASPECT) * FINAL_PAGE_SCALE * MAKE_LATTICE_STEP_RATIO * 100,
];
const FINAL_PAGE_SHORT_STEP: Point = [
  -Math.cos(PAGE_ROTATION_RADIANS) * (PAGE_WRAPPER_RATIO * PAGE_WIDTH_IN_WRAPPER) * FINAL_PAGE_SCALE * MAKE_LATTICE_STEP_RATIO * 100,
  -Math.sin(PAGE_ROTATION_RADIANS) * PAGE_PLANE_COMPRESSION * (PAGE_WRAPPER_RATIO * PAGE_WIDTH_IN_WRAPPER) * FINAL_PAGE_SCALE * MAKE_LATTICE_STEP_RATIO * 100,
];
const FINAL_PAGE_TOP_POSITION: Point = [
  50 - (FINAL_PAGE_LONG_STEP[0] + FINAL_PAGE_SHORT_STEP[0]) / 2,
  50 - (FINAL_PAGE_LONG_STEP[1] + FINAL_PAGE_SHORT_STEP[1]) / 2,
];
const FINAL_PAGE_LEFT_POSITION: Point = [
  FINAL_PAGE_TOP_POSITION[0] + FINAL_PAGE_SHORT_STEP[0],
  FINAL_PAGE_TOP_POSITION[1] + FINAL_PAGE_SHORT_STEP[1],
];
const FINAL_PAGE_RIGHT_POSITION: Point = [
  FINAL_PAGE_TOP_POSITION[0] + FINAL_PAGE_LONG_STEP[0],
  FINAL_PAGE_TOP_POSITION[1] + FINAL_PAGE_LONG_STEP[1],
];
const FINAL_PAGE_BOTTOM_POSITION: Point = [
  FINAL_PAGE_TOP_POSITION[0] + FINAL_PAGE_LONG_STEP[0] + FINAL_PAGE_SHORT_STEP[0],
  FINAL_PAGE_TOP_POSITION[1] + FINAL_PAGE_LONG_STEP[1] + FINAL_PAGE_SHORT_STEP[1],
];
const percent = (value: number) => `${value.toFixed(3)}%`;
const finalLayoutStyle = {
  "--final-page-scale": FINAL_PAGE_SCALE,
  "--final-page-top-x": percent(FINAL_PAGE_TOP_POSITION[0]),
  "--final-page-top-y": percent(FINAL_PAGE_TOP_POSITION[1]),
  "--final-page-left-x": percent(FINAL_PAGE_LEFT_POSITION[0]),
  "--final-page-left-y": percent(FINAL_PAGE_LEFT_POSITION[1]),
  "--final-page-right-x": percent(FINAL_PAGE_RIGHT_POSITION[0]),
  "--final-page-right-y": percent(FINAL_PAGE_RIGHT_POSITION[1]),
  "--final-page-bottom-x": percent(FINAL_PAGE_BOTTOM_POSITION[0]),
  "--final-page-bottom-y": percent(FINAL_PAGE_BOTTOM_POSITION[1]),
} as CSSProperties;
const linear = "linear" as const;
const timeline = (seconds: number[]) => ({
  duration: HERO_PLAYBACK_DURATION,
  repeat: Infinity,
  ease: linear,
  times: seconds.map((second) => second / HERO_STORY_DURATION),
});

// Measured from the Make empty/assembled frames: a subtly portrait rectangle,
// projected asymmetrically so the plane reads as a page rather than a diamond.
const MODULE_INSET = 16;
const MODULE_FAR_EDGE = 100 - MODULE_INSET;
const crossModulePoints: Point[] = [
  [MODULE_INSET, MODULE_INSET],
  [MODULE_FAR_EDGE, MODULE_INSET],
  [MODULE_FAR_EDGE, MODULE_FAR_EDGE],
  [MODULE_INSET, MODULE_FAR_EDGE],
];
const threeModulePoints: Point[] = [
  [MODULE_INSET, MODULE_INSET],
  [MODULE_FAR_EDGE, MODULE_INSET],
  [50, MODULE_FAR_EDGE],
];

function useHeroReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}

function projectPagePoint([uPercent, vPercent]: Point): Point {
  const u = uPercent / 100 - .5;
  const v = vPercent / 100 - .5;
  const wrapperHeight = 1 / PAGE_WRAPPER_ASPECT;
  const localX = u * PAGE_WIDTH_IN_WRAPPER;
  const localY = v * wrapperHeight;
  const projectedX = Math.cos(PAGE_ROTATION_RADIANS) * localX - Math.sin(PAGE_ROTATION_RADIANS) * localY;
  const projectedY = (Math.sin(PAGE_ROTATION_RADIANS) * localX + Math.cos(PAGE_ROTATION_RADIANS) * localY) * PAGE_PLANE_COMPRESSION;

  return [50 + projectedX * 100, 50 + (projectedY / wrapperHeight) * 100];
}

function Icon({ name }: { name: IconName }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    {name === "website" && <><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17"/></>}
    {name === "bookings" && <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 9h10M8 13h5M8 16h3"/></>}
    {name === "clients" && <><circle cx="9" cy="8" r="3.4"/><path d="M3 20v-1.5A5.5 5.5 0 0 1 8.5 13h1A5.5 5.5 0 0 1 15 18.5V20M17 7h4M19 5v4"/></>}
    {name === "payments" && <><rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M3 10h18M7 15h4"/></>}
    {name === "calendar" && <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></>}
    {name === "documents" && <><path d="M6 2.5h8l4 4V21H6zM14 2.5v4h4M9 11h6M9 15h6M9 18h4"/></>}
    {name === "notifications" && <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>}
    {name === "analytics" && <><path d="M4 20V11M9 20V6M14 20v-7M19 20V3M2 20h20"/></>}
    {name === "automations" && <path d="m13 2-8 12h7l-1 8 8-12h-7z"/>}
    {name === "ssl" && <><path d="M12 2.5 20 6v5.5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6z"/><rect x="8.5" y="10" width="7" height="6" rx="1.5"/><path d="M10 10V8.5a2 2 0 0 1 4 0V10"/></>}
  </svg>;
}

const networkNodes = [
  { key: "first", name: "website" as IconName, label: "Website", detail: "counterOrbit" as NodeDetail, x: 16, y: 50, tone: "cyan", revealStart: HERO_TIMELINE.intro.firstNodeStart, revealEnd: HERO_TIMELINE.intro.firstNodeEnd, largeUntil: PRIMARY_PAIR_REDUCE_START, normalAt: PRIMARY_PAIR_REDUCED_AT, largeScale: 2, initialScale: .52 },
  { key: "second", name: "automations" as IconName, label: "Automations", detail: "emittedArrows" as NodeDetail, x: 40, y: 50, tone: "orange", revealStart: HERO_TIMELINE.secondNode.revealStart, revealEnd: HERO_TIMELINE.secondNode.revealEnd, largeUntil: PRIMARY_PAIR_REDUCE_START, normalAt: PRIMARY_PAIR_REDUCED_AT, largeScale: 2, initialScale: .34 },
  { key: "third", name: "bookings" as IconName, label: "Bookings", detail: "movingRays" as NodeDetail, x: 65, y: 50, tone: "green", revealStart: THIRD_NODE_REVEAL_START, revealEnd: THIRD_NODE_REVEAL_END, largeUntil: HERO_TIMELINE.thirdNode.reduceStart, normalAt: HERO_TIMELINE.thirdNode.reducedAt, largeScale: 2, initialScale: 2 },
  { key: "upper", name: "payments" as IconName, label: "Payments", detail: "lightStreaks" as NodeDetail, x: 87, y: 27, tone: "amber", revealStart: HERO_TIMELINE.outerNodes.revealStart, revealEnd: HERO_TIMELINE.outerNodes.revealEnd, largeUntil: HERO_TIMELINE.outerNodes.reduceStart, normalAt: HERO_TIMELINE.outerNodes.reducedAt, largeScale: 1.14, initialScale: .28 },
  { key: "lower", name: "clients" as IconName, label: "Clients", detail: "emittedLight" as NodeDetail, x: 87, y: 73, tone: "coral", revealStart: HERO_TIMELINE.outerNodes.revealStart, revealEnd: HERO_TIMELINE.outerNodes.revealEnd, largeUntil: HERO_TIMELINE.outerNodes.reduceStart, normalAt: HERO_TIMELINE.outerNodes.reducedAt, largeScale: 1.14, initialScale: .28 },
];

const networkLines = [
  { key: "first-second", from: [16, 50] as Point, to: [40, 50] as Point, at: 2.5, duration: .58 },
  { key: "second-third", from: [40, 50] as Point, to: [65, 50] as Point, at: SECOND_TO_THIRD_CONNECTION_START, duration: .62 },
  { key: "third-upper", from: [65, 50] as Point, to: [87, 27] as Point, at: HERO_TIMELINE.branchReveal.start, duration: HERO_TIMELINE.branchReveal.duration },
  { key: "third-lower", from: [65, 50] as Point, to: [87, 73] as Point, at: HERO_TIMELINE.branchReveal.start, duration: HERO_TIMELINE.branchReveal.duration },
];

const workflows = [
  { key: "booking", className: styles.pageBooking, icons: ["calendar", "bookings", "notifications", "automations"] as IconName[] },
  { key: "client", className: styles.pageClient, icons: ["website", "clients", "documents"] as IconName[] },
  { key: "payment", className: styles.pagePayment, icons: ["bookings", "payments", "analytics", "ssl"] as IconName[] },
  { key: "website", className: styles.pageWebsite, icons: ["website", "automations", "analytics"] as IconName[] },
];

function HubMark() {
  return <span className={styles.hubMark} aria-hidden="true"><i/><i/><i/></span>;
}

function Puck({ className = "" }: { className?: string }) {
  return <span className={`${styles.puck} ${className}`}>
    <span className={styles.puckShadow}/>
    <span className={styles.puckSide}/>
    <span className={styles.puckTop}>
      <span className={styles.puckHighlight}/>
      <HubMark/>
    </span>
  </span>;
}

function OrbitalImpulses() {
  return <span className={styles.orbitalImpulses} data-orbital-impulses="fast-disappearing" aria-hidden="true"><i/><i/></span>;
}

function NodeEnergy({ detail }: { detail: NodeDetail }) {
  return <span className={`${styles.nodeEnergy} ${styles[detail]}`} data-node-energy={detail} aria-hidden="true"><i/><i/><i/></span>;
}

function NetworkNode({ node }: { node: (typeof networkNodes)[number] }) {
  return <motion.span
    className={`${styles.networkNode} ${styles[node.tone]}`}
    data-node={node.key}
    style={{ "--x": `${node.x}%`, "--y": `${node.y}%` } as CSSProperties}
    animate={{
      opacity: [0, 0, .35, 1, 1, 0, 0],
      scale: [node.initialScale, node.initialScale, node.largeScale, node.largeScale, 1, 1, 1],
      filter: [
        "blur(9px) saturate(.15) brightness(.4)",
        "blur(9px) saturate(.15) brightness(.4)",
        "blur(2px) saturate(.72) brightness(.86)",
        "blur(0px) saturate(1) brightness(1)",
        "blur(0px) saturate(1) brightness(1)",
        "blur(9px) saturate(.72) brightness(.78)",
        "blur(9px) saturate(.72) brightness(.78)",
      ],
    }}
    transition={{
      opacity: timeline([0, node.revealStart - .1, node.revealStart, node.revealEnd, NETWORK_CONVERGENCE_START, NETWORK_CONVERGENCE_END, CYCLE]),
      scale: timeline([0, node.revealStart - .08, node.revealEnd, node.largeUntil, node.normalAt, NETWORK_CONVERGENCE_END, CYCLE]),
      filter: timeline([0, node.revealStart - .1, node.revealStart, node.revealEnd, NETWORK_CONVERGENCE_START, NETWORK_CONVERGENCE_END, CYCLE]),
    }}
  >
    <span className={styles.nodeFace}><NodeEnergy detail={node.detail}/><Icon name={node.name}/></span>
    <span className={styles.nodeOrbit} data-white-orbit="two-segment" data-orbit-speed="slow" aria-hidden="true"/>
    <OrbitalImpulses/>
    <span className={styles.srOnly}>{node.label}</span>
  </motion.span>;
}

function CometConnection({ line }: { line: (typeof networkLines)[number] }) {
  const [fromX, fromY] = line.from;
  const [toX, toY] = line.to;
  const distance = Math.hypot(toX - fromX, toY - fromY);
  const tailLength = Math.min(5.8, distance * .24);
  const tailX = toX - ((toX - fromX) / distance) * tailLength;
  const tailY = toY - ((toY - fromY) / distance) * tailLength;
  const arrives = line.at + line.duration;
  const disappears = arrives + .1;
  const travelTimes = [0, line.at, line.at + .025, arrives, disappears, CYCLE];
  const headX = [fromX, fromX, fromX, toX, toX, toX];
  const headY = [fromY, fromY, fromY, toY, toY, toY];
  const wakeX = [fromX, fromX, fromX, tailX, tailX, tailX];
  const wakeY = [fromY, fromY, fromY, tailY, tailY, tailY];

  return <g data-node-impulse-duration={line.duration}>
    <motion.line
      className={styles.networkTrail}
      x1={fromX}
      y1={fromY}
      animate={{
        x2: [fromX, fromX, toX, toX, toX],
        y2: [fromY, fromY, toY, toY, toY],
        opacity: [0, 0, .76, .64, 0, 0],
      }}
      transition={{
        x2: timeline([0, line.at, arrives, NETWORK_CONVERGENCE_END, CYCLE]),
        y2: timeline([0, line.at, arrives, NETWORK_CONVERGENCE_END, CYCLE]),
        opacity: timeline([0, line.at, arrives, NETWORK_CONVERGENCE_START, NETWORK_CONVERGENCE_END, CYCLE]),
      }}
    />
    <motion.line
      className={styles.cometGlow}
      animate={{ opacity: [0, 0, .82, .96, 0, 0], x1: wakeX, y1: wakeY, x2: headX, y2: headY }}
      transition={{ opacity: timeline(travelTimes), x1: timeline(travelTimes), y1: timeline(travelTimes), x2: timeline(travelTimes), y2: timeline(travelTimes) }}
    />
    <motion.line
      className={styles.cometTail}
      animate={{ opacity: [0, 0, 1, 1, 0, 0], x1: wakeX, y1: wakeY, x2: headX, y2: headY }}
      transition={{ opacity: timeline(travelTimes), x1: timeline(travelTimes), y1: timeline(travelTimes), x2: timeline(travelTimes), y2: timeline(travelTimes) }}
    />
    <motion.circle
      className={styles.cometCore}
      r="1.05"
      animate={{ opacity: [0, 0, 1, 1, 0, 0], cx: headX, cy: headY }}
      transition={{ opacity: timeline(travelTimes), cx: timeline(travelTimes), cy: timeline(travelTimes) }}
    />
  </g>;
}

function ModuleBlock({ icon }: { icon: IconName }) {
  return <>
    <span className={styles.moduleShadow}/>
    <span className={styles.moduleSide}/>
    <span className={styles.moduleTop}><span className={styles.moduleHighlight}/></span>
    <span className={styles.moduleIcon}><Icon name={icon}/></span>
    <span className={styles.srOnly}>{icon}</span>
  </>;
}

function PageConnectionPulse({ point, index }: { point: Point; index: number }) {
  const center: Point = [50, 50];
  const forward = index % 2 === 0;
  const start = forward ? center : point;
  const end = forward ? point : center;
  const tailEnd: Point = [end[0] - (end[0] - start[0]) * .18, end[1] - (end[1] - start[1]) * .18];
  const headX = [start[0], start[0], start[0], end[0], end[0], end[0]];
  const headY = [start[1], start[1], start[1], end[1], end[1], end[1]];
  const tailX = [start[0], start[0], start[0], tailEnd[0], end[0], end[0]];
  const tailY = [start[1], start[1], start[1], tailEnd[1], end[1], end[1]];
  const pulseTransition = {
    duration: 3.35 + index * .14,
    repeat: Infinity,
    ease: linear,
    times: [0, .43, .47, .68, .72, 1],
    delay: .28 + index * .38,
  };

  return <g className={styles.pagePulseGroup} data-page-pulse="true">
    <motion.line
      className={styles.pagePulseGlow}
      animate={{ opacity: [0, 0, .18, .92, 0, 0], x1: tailX, y1: tailY, x2: headX, y2: headY }}
      transition={pulseTransition}
    />
    <motion.line
      className={styles.pagePulseTail}
      animate={{ opacity: [0, 0, .38, 1, 0, 0], x1: tailX, y1: tailY, x2: headX, y2: headY }}
      transition={pulseTransition}
    />
    <motion.ellipse
      className={styles.pagePulseCore}
      rx={.78 / PAGE_WRAPPER_ASPECT}
      ry=".78"
      animate={{ opacity: [0, 0, .72, 1, 0, 0], cx: headX, cy: headY }}
      transition={pulseTransition}
    />
  </g>;
}

function PageDiagram({ icons, assembled = false, showHub = true }: { icons: IconName[]; assembled?: boolean; showHub?: boolean }) {
  const layout = icons.length === 3 ? "two-corners-one-opposite" : "four-corners";
  const localPoints = icons.length === 3 ? threeModulePoints : crossModulePoints;
  const points = localPoints.map(projectPagePoint);
  const moduleStarts = HERO_TIMELINE.primaryPage.moduleStarts;

  return <>
    <svg className={styles.pageLines} viewBox="0 0 100 100" preserveAspectRatio="none" data-module-layout={layout} aria-hidden="true">
      {icons.map((_, index) => {
        const point = points[index];
        const lineStart = moduleStarts[index] + .66;
        return <g key={index}>
          {assembled
            ? <path d={`M50 50 L${point[0]} ${point[1]}`}/>
            : <motion.path
              d={`M50 50 L${point[0]} ${point[1]}`}
              pathLength={1}
              animate={{ pathLength: [0, 0, 1, 1], opacity: [0, 0, .82, .82, .82, 0] }}
              transition={{
                pathLength: timeline([0, lineStart, lineStart + .48, CYCLE]),
                opacity: timeline([0, lineStart, lineStart + .48, FINAL_SHRINK_START, CLEAN_RESET_AT, CYCLE]),
              }}
            />}
          {assembled
            ? <PageConnectionPulse point={point} index={index}/>
            : <motion.g
                className={styles.pagePulseGate}
                animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
                transition={timeline([0, lineStart + .48, lineStart + .64, FINAL_SHRINK_START, CLEAN_RESET_AT, CYCLE])}
              >
                <PageConnectionPulse point={point} index={index}/>
              </motion.g>}
        </g>;
      })}
    </svg>
    {showHub && <span className={styles.pageHub}><Puck/></span>}
    {icons.map((icon, index) => assembled
      ? <span
          key={`${icon}-${index}`}
          className={styles.pageModule}
          data-module-index={index}
          data-local-x={localPoints[index][0]}
          data-local-y={localPoints[index][1]}
          style={{ "--module-x": `${points[index][0]}%`, "--module-y": `${points[index][1]}%` } as CSSProperties}
        >
          <ModuleBlock icon={icon}/>
        </span>
      : <motion.span
          key={`${icon}-${index}`}
          className={styles.pageModule}
          data-module-index={index}
          data-local-x={localPoints[index][0]}
          data-local-y={localPoints[index][1]}
          style={{ "--module-x": `${points[index][0]}%`, "--module-y": `${points[index][1]}%` } as CSSProperties}
          animate={{
            opacity: [0, 0, .18, 1, 1, 0],
            y: [-156, -156, -132, 3, 0, 0],
            scale: [1, 1, .99, 1.025, 1, 1],
            filter: ["blur(6px)", "blur(6px)", "blur(3px)", "blur(.4px)", "blur(0px)", "blur(0px)"],
          }}
          transition={{
            opacity: timeline([0, moduleStarts[index], moduleStarts[index] + .02, moduleStarts[index] + .12, CLEAN_RESET_AT, CYCLE]),
            y: timeline([0, moduleStarts[index], moduleStarts[index] + .05, moduleStarts[index] + .21, moduleStarts[index] + .29, CYCLE]),
            scale: timeline([0, moduleStarts[index], moduleStarts[index] + .05, moduleStarts[index] + .21, moduleStarts[index] + .29, CYCLE]),
            filter: timeline([0, moduleStarts[index], moduleStarts[index] + .05, moduleStarts[index] + .2, moduleStarts[index] + .28, CYCLE]),
          }}
        >
          <ModuleBlock icon={icon}/>
        </motion.span>
    )}
  </>;
}

function WorkflowPage({ flow, assembled = false, showHub = true }: { flow: (typeof workflows)[number]; assembled?: boolean; showHub?: boolean }) {
  return <div
    className={`${styles.page} ${flow.className}`}
    data-workflow-page={flow.key}
    data-page-base-ratio={PAGE_BASE_RATIO}
    data-page-axis-angle={Math.atan2(Math.cos(PAGE_ROTATION_RADIANS) * PAGE_PLANE_COMPRESSION, -Math.sin(PAGE_ROTATION_RADIANS)) * 180 / Math.PI}
    style={{
      "--page-left": `${(1 - PAGE_WIDTH_IN_WRAPPER) * 50}%`,
      "--page-width": `${PAGE_WIDTH_IN_WRAPPER * 100}%`,
      "--page-compression": PAGE_PLANE_COMPRESSION,
      "--page-rotation": `${PAGE_ROTATION_DEGREES}deg`,
    } as CSSProperties}
  >
    <span className={styles.pageUnderside} data-page-underside="true"/>
    <span className={styles.pageSide} data-page-side="true"/>
    <span className={styles.pageTop} data-page-top="true"/>
    <span className={styles.pageContent}>
      <PageDiagram icons={flow.icons} assembled={assembled} showHub={showHub}/>
    </span>
  </div>;
}

function StaticSystem() {
  return <div className={styles.staticPages}>
    {workflows.map((flow) => <div key={flow.key} className={`${styles.staticPage} ${flow.className}`}>
      <WorkflowPage flow={flow} assembled/>
    </div>)}
  </div>;
}

export function OneStudioSystemHero() {
  const prefersReducedMotion = useHeroReducedMotion();

  if (prefersReducedMotion) {
    return <div
      className={`${styles.scene} ${styles.reduced}`}
      style={finalLayoutStyle}
      role="img"
      aria-label="OneStudio OS connected workflows for website, bookings, clients, payments and automations"
    >
      <div className={styles.ambient}/>
      <StaticSystem/>
    </div>;
  }

  return <div
    className={styles.scene}
    style={finalLayoutStyle}
    role="img"
    aria-label="OneStudio OS connected workflows for website, bookings, clients, payments and automations"
  >
    <div className={styles.ambient}/>

    <motion.div
      className={styles.networkStage}
      data-network-stage="true"
      animate={{
        opacity: [1, 1, 1, .9, .5, 0, 0],
        scale: [1, 1, .98, .86, .55, .24, .24],
        rotate: [0, 0, -.7, -2.4, -5.2, -7, -7],
        filter: ["blur(0px)", "blur(0px)", "blur(.5px)", "blur(2px)", "blur(7px)", "blur(15px)", "blur(15px)"],
      }}
      transition={timeline([0, NETWORK_CONVERGENCE_START, HERO_TIMELINE.networkConvergence.firstPull, HERO_TIMELINE.networkConvergence.pullSettle, HERO_TIMELINE.networkConvergence.finalPull, NETWORK_CONVERGENCE_END, CYCLE])}
    >
      <svg className={styles.networkLines} viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <filter id="comet-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.55" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {networkLines.map((line) => <CometConnection key={line.key} line={line}/>)}
      </svg>
      {networkNodes.map((node) => <NetworkNode key={node.key} node={node}/>)}
      <motion.span
        className={styles.pullMarker}
        animate={{ opacity: [0, 0, 1, 1, .5, 0, 0], x: [42, 42, 22, 7, 3, 3, 3], scale: [.82, .82, .82, .82, .82, .82, .82] }}
        transition={timeline([0, 6.02, 6.16, 6.82, 7.14, 7.48, CYCLE])}
        aria-hidden="true"
      />
    </motion.div>

    <motion.div
      className={styles.systemStage}
      data-system-stage="true"
      animate={{
        opacity: [0, 0, 1, 1, 1, 0, 0],
        scale: [1, 1, 1, 1, .98, .52, .52],
        filter: ["blur(12px)", "blur(12px)", "blur(0px)", "blur(0px)", "blur(1px)", "blur(14px)", "blur(14px)"],
      }}
      transition={timeline([0, HERO_TIMELINE.puck.revealStart - .06, HERO_TIMELINE.puck.revealStart + .08, FINAL_SHRINK_START, HERO_TIMELINE.finalExit.systemFadeAt, CLEAN_RESET_AT, CYCLE])}
    >
      <motion.div
        className={styles.primaryAssembly}
        animate={{
          left: ["50%", "50%", percent(FINAL_PAGE_TOP_POSITION[0]), percent(FINAL_PAGE_TOP_POSITION[0])],
          top: ["50%", "50%", percent(FINAL_PAGE_TOP_POSITION[1]), percent(FINAL_PAGE_TOP_POSITION[1])],
          scale: [1, 1, FINAL_PAGE_SCALE, FINAL_PAGE_SCALE],
        }}
          transition={timeline([0, MULTI_PAGE_START, HERO_TIMELINE.multiPage.primarySettledAt, CYCLE])}
      >
        <motion.span
          className={styles.pageGlow}
          animate={{
            opacity: [0, 0, .82, .62, .3, .3, 0],
            scale: [.45, .45, .72, 1.15, 1.3, 1.3, 1.3],
            filter: ["blur(14px)", "blur(14px)", "blur(10px)", "blur(18px)", "blur(22px)", "blur(22px)", "blur(22px)"],
          }}
          transition={timeline([0, PUCK_SHRINK_END, HERO_TIMELINE.primaryPage.hintAt, 17.82, HERO_TIMELINE.primaryPage.formedAt, CLEAN_RESET_AT, CYCLE])}
        />

        <motion.div
          className={styles.primaryPageReveal}
          data-primary-page="true"
          animate={{
            opacity: [0, 0, .24, 1, 1, 1, 0],
            y: [20, 20, 8, 0, 0, 0, 0],
            scaleX: [.08, .08, .34, 1, 1, 1, 1],
            scaleY: [.14, .14, .42, 1, 1, 1, 1],
            filter: ["blur(10px)", "blur(10px)", "blur(5px)", "blur(0px)", "blur(0px)", "blur(0px)", "blur(0px)"],
          }}
          transition={timeline([0, HERO_TIMELINE.primaryPage.revealStart, HERO_TIMELINE.primaryPage.revealAt, HERO_TIMELINE.primaryPage.formedAt, FINAL_SHRINK_START, CLEAN_RESET_AT, CYCLE])}
        >
          <WorkflowPage flow={workflows[0]} showHub={false}/>
        </motion.div>

        <motion.div
          className={styles.assemblyPuckSlot}
          data-hero-puck="true"
          data-puck-shrink-duration={PUCK_SHRINK_END - PUCK_SHRINK_START}
          animate={{
            opacity: [0, 0, .2, 1, 1, 1, 0],
            scale: [1, 1, 1, 1, .32, .32, .32],
            filter: ["blur(15px)", "blur(15px)", "blur(7px)", "blur(0px)", "blur(0px)", "blur(0px)", "blur(0px)"],
          }}
          transition={{
            opacity: timeline([0, HERO_TIMELINE.puck.revealStart, HERO_TIMELINE.puck.revealStart + .12, HERO_TIMELINE.puck.visibleAt, FINAL_SHRINK_START, CLEAN_RESET_AT, CYCLE]),
            scale: timeline([0, HERO_TIMELINE.puck.revealStart, HERO_TIMELINE.puck.visibleAt, PUCK_SHRINK_START, PUCK_SHRINK_END, CLEAN_RESET_AT, CYCLE]),
            filter: timeline([0, HERO_TIMELINE.puck.revealStart, HERO_TIMELINE.puck.revealStart + .15, HERO_TIMELINE.puck.visibleAt, PUCK_SHRINK_END, CLEAN_RESET_AT, CYCLE]),
          }}
        >
          <Puck/>
        </motion.div>
      </motion.div>

      <div className={styles.secondaryPages}>
        {workflows.slice(1).map((flow, index) => {
          const start = HERO_TIMELINE.multiPage.firstSecondaryStart + index * HERO_TIMELINE.multiPage.stagger;
          return <motion.div
            key={flow.key}
            className={`${styles.secondaryPage} ${flow.className}`}
            data-page={flow.key}
            animate={{
              opacity: [0, 0, 1, 1, 1, 0],
              y: [30, 30, 0, 0, 0, 0],
              scale: [FINAL_PAGE_SCALE * .92, FINAL_PAGE_SCALE * .92, FINAL_PAGE_SCALE, FINAL_PAGE_SCALE, FINAL_PAGE_SCALE, FINAL_PAGE_SCALE],
              filter: ["blur(7px)", "blur(7px)", "blur(0px)", "blur(0px)", "blur(0px)", "blur(0px)"],
            }}
            transition={{
              opacity: timeline([0, start, start + .48, FINAL_FORMED_AT, CLEAN_RESET_AT, CYCLE]),
              y: timeline([0, start, start + .48, FINAL_FORMED_AT, CLEAN_RESET_AT, CYCLE]),
              scale: timeline([0, start, start + .48, FINAL_FORMED_AT, CLEAN_RESET_AT, CYCLE]),
              filter: timeline([0, start, start + .48, FINAL_FORMED_AT, CLEAN_RESET_AT, CYCLE]),
            }}
          >
            <WorkflowPage flow={flow} assembled/>
          </motion.div>;
        })}
      </div>

      <span className={styles.primaryCompleteMarker} data-primary-complete-at={PRIMARY_COMPLETE_AT} aria-hidden="true"/>
    </motion.div>
  </div>;
}
