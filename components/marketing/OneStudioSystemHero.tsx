"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type CSSProperties } from "react";
import styles from "./OneStudioSystemHero.module.css";

type IconName = "website" | "bookings" | "clients" | "payments" | "calendar" | "documents" | "notifications" | "analytics" | "automations" | "ssl";

const CYCLE = 28;
const loop = { duration: CYCLE, repeat: Infinity, ease: "linear" as const };

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
  { name: "website" as IconName, label: "Website", x: 13, y: 48, tone: "cyan", at: .35 },
  { name: "automations" as IconName, label: "Automations", x: 37, y: 48, tone: "orange", at: 2.65 },
  { name: "bookings" as IconName, label: "Bookings", x: 62, y: 48, tone: "turquoise", at: 4.95 },
  { name: "payments" as IconName, label: "Payments", x: 84, y: 25, tone: "amber", at: 6.95 },
  { name: "clients" as IconName, label: "Clients", x: 84, y: 72, tone: "coral", at: 6.95 },
];

const networkLines = [
  { d: "M13 48 L37 48", from: [13, 48], to: [37, 48], at: 1.45 },
  { d: "M37 48 L62 48", from: [37, 48], to: [62, 48], at: 3.75 },
  { d: "M62 48 L84 25", from: [62, 48], to: [84, 25], at: 5.75 },
  { d: "M62 48 L84 72", from: [62, 48], to: [84, 72], at: 5.75 },
];

const workflows = [
  { key: "booking", className: styles.pageBooking, icons: ["calendar", "bookings", "notifications", "automations"] as IconName[] },
  { key: "client", className: styles.pageClient, icons: ["website", "clients", "documents"] as IconName[] },
  { key: "payment", className: styles.pagePayment, icons: ["bookings", "payments", "analytics", "ssl"] as IconName[] },
  { key: "website", className: styles.pageWebsite, icons: ["website", "automations", "analytics"] as IconName[] },
];

function HubMark() { return <span className={styles.hubMark} aria-hidden="true"><i/><i/><i/></span>; }

function PageDiagram({ icons, primary = false }: { icons: IconName[]; primary?: boolean }) {
  const moduleStart = primary ? 14.3 : 19.2;
  const lineStart = primary ? 14.75 : 19.45;
  return <>
    <svg className={styles.pageLines} viewBox="0 0 100 64" aria-hidden="true">
      {icons.map((_, index) => {
        const points = [[18,34],[50,12],[82,34],[50,54]];
        const point = points[index];
        return <motion.path key={index} d={`M50 34 L${point[0]} ${point[1]}`} pathLength={1}
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: [0,0,1,1], opacity: [0,0,1,1] }}
          transition={{ ...loop, times: [0, (lineStart + index * .32) / CYCLE, (lineStart + .72 + index * .32) / CYCLE, .94] }}/>;
      })}
    </svg>
    <motion.span className={styles.pageHub}
      initial={{ opacity: 0, y: primary ? -92 : -10, scale: primary ? 1.9 : .7, filter: "blur(7px)" }}
      animate={{ opacity: [0,0,1,1], y: [primary ? -92 : -10,primary ? -92 : -10,0,0], scale: [primary ? 1.9 : .7,primary ? 1.9 : .7,1,1], filter: ["blur(7px)","blur(7px)","blur(0px)","blur(0px)"] }}
      transition={{ ...loop, times: [0,(primary ? 12.25 : 18.85)/CYCLE,(primary ? 13.25 : 19.3)/CYCLE,.94] }}><HubMark/></motion.span>
    {icons.map((icon, index) => <motion.span key={icon} className={`${styles.pageModule} ${styles[`module${index}`]}`}
      initial={{ opacity: 0, y: -18, scale: .55, filter: "blur(6px)" }}
      animate={{ opacity: [0,0,1,1], y: [-18,-18,0,0], scale: [.55,.55,1,1], filter: ["blur(6px)","blur(6px)","blur(0px)","blur(0px)"] }}
      transition={{ ...loop, times: [0, (moduleStart + index * .48) / CYCLE, (moduleStart + .72 + index * .48) / CYCLE, .94] }}>
      <Icon name={icon}/><span className={styles.srOnly}>{icon}</span>
    </motion.span>)}
    {primary && <motion.span className={styles.pagePulse} animate={{ opacity: [0,0,.9,0,0], x: [0,0,92,92,92] }} transition={{ ...loop, times: [0,.61,.65,.69,1] }}/>} 
  </>;
}

export function OneStudioSystemHero() {
  const prefersReducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const reduced = ready && prefersReducedMotion;

  if (reduced) {
    return <div className={`${styles.scene} ${styles.reduced}`} role="img" aria-label="OneStudio OS connected workflows for website, bookings, clients, payments and automations">
      <div className={styles.pages}>{workflows.map((flow, index) => <div key={flow.key} className={`${styles.page} ${flow.className} ${index === 0 ? styles.primaryPage : ""}`}><PageDiagram icons={flow.icons} primary={index === 0}/></div>)}</div>
    </div>;
  }

  return <div className={styles.scene} role="img" aria-label="OneStudio OS connected workflows for website, bookings, clients, payments and automations">
    <motion.div className={styles.ambient} animate={{ opacity: [.25,.45,.35,.6,.28,.25], scale: [.94,1,1.03,1.08,.9,.94] }} transition={{ ...loop, times: [0,.2,.34,.57,.92,1] }}/>

    <motion.div className={styles.networkStage}
      animate={{ opacity: [1,1,1,0,0,0,1], scale: [.82,1,1,.58,.58,.58,.82], rotate: [0,0,-4,-7,-7,-7,0], filter: ["blur(0px)","blur(0px)","blur(0px)","blur(12px)","blur(12px)","blur(12px)","blur(0px)"] }}
      transition={{ ...loop, times: [0,.29,.315,.37,.92,.97,1] }}>
      <svg className={styles.networkLines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs><filter id="beam-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        {networkLines.map((line, index) => <g key={line.d}>
          <motion.path className={styles.networkLine} d={line.d} pathLength={1} initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0,0,1,1,0,0], opacity: [0,0,.65,.65,0,0] }}
            transition={{ ...loop, times: [0,line.at/CYCLE,(line.at+1)/CYCLE,.335,.37,1] }}/>
          <motion.circle className={styles.beamTrail} r={index < 2 ? 2.7 : 2.35}
            initial={{ opacity: 0, cx: line.from[0], cy: line.from[1] }}
            animate={{
              opacity: [0,0,.52,.7,0,0],
              cx: [line.from[0],line.from[0],line.from[0],line.to[0],line.to[0],line.to[0]],
              cy: [line.from[1],line.from[1],line.from[1],line.to[1],line.to[1],line.to[1]],
            }}
            transition={{ ...loop, times: [0,line.at/CYCLE,(line.at+.08)/CYCLE,(line.at+1.08)/CYCLE,(line.at+1.18)/CYCLE,1] }}/>
          <motion.circle className={styles.beamPulse} r={index < 2 ? 1.45 : 1.25}
            initial={{ opacity: 0, cx: line.from[0], cy: line.from[1] }}
            animate={{
              opacity: [0,0,1,1,0,0],
              cx: [line.from[0],line.from[0],line.from[0],line.to[0],line.to[0],line.to[0]],
              cy: [line.from[1],line.from[1],line.from[1],line.to[1],line.to[1],line.to[1]],
            }}
            transition={{ ...loop, times: [0,line.at/CYCLE,(line.at+.04)/CYCLE,(line.at+1.08)/CYCLE,(line.at+1.17)/CYCLE,1] }}/>
        </g>)}
      </svg>
      {networkNodes.map(node => <motion.span key={node.label} className={`${styles.networkNode} ${styles[node.tone]}`} style={{ "--x": `${node.x}%`, "--y": `${node.y}%` } as CSSProperties}
        initial={{ opacity: 0, scale: .25 }}
        animate={{ opacity: [0,0,.35,1,1,0,0], scale: [.25,.25,.55,1,1,.7,.7] }}
        transition={{ ...loop, times: [0,Math.max(0,node.at-.12)/CYCLE,node.at/CYCLE,(node.at+.55)/CYCLE,.335,.37,1] }}>
        <Icon name={node.name}/><span className={styles.srOnly}>{node.label}</span>
      </motion.span>)}
    </motion.div>

    <motion.div className={styles.hubStage}
      animate={{ opacity: [0,0,1,1,1,0,0], scale: [.25,.25,1.18,1,.34,.25,.25], x: 0, y: 0, filter: ["blur(16px)","blur(16px)","blur(0px)","blur(0px)","blur(0px)","blur(5px)","blur(16px)"] }}
      transition={{ ...loop, times: [0,.32,.39,.42,.462,.478,1] }}>
      <span className={styles.centralHub}><HubMark/></span>
    </motion.div>

    <motion.div className={styles.pagesStage}
      animate={{ opacity: [0,0,1,1,1,0,0], scale: [.72,.72,1,1,.78,.35,.35], filter: ["blur(8px)","blur(8px)","blur(0px)","blur(0px)","blur(0px)","blur(12px)","blur(12px)"] }}
      transition={{ ...loop, times: [0,.37,.405,.74,.9,.96,1] }}>
      <div className={styles.pages}>{workflows.map((flow, index) => <motion.div key={flow.key} className={`${styles.page} ${flow.className} ${index === 0 ? styles.primaryPage : ""}`}
        style={{ rotateX: 57, rotateZ: -28 }}
        initial={{ opacity: 0, y: index === 0 ? 245 : 45, scale: .72 }}
        animate={index === 0
          ? { opacity: [0,0,1,1,1], y: [245,245,185,185,0], scale: [.72,.72,1,1,1] }
          : { opacity: [0,0,1,1], y: [45,45,0,0], scale: [.72,.72,1,1] }}
        transition={index === 0
          ? { ...loop, times: [0,10.55/CYCLE,11.8/CYCLE,17.25/CYCLE,18.3/CYCLE] }
          : { ...loop, times: [0,(18.2 + index * .75)/CYCLE,(19.05 + index * .75)/CYCLE,.94] }}>
        <PageDiagram icons={flow.icons} primary={index === 0}/>
      </motion.div>)}</div>
    </motion.div>
  </div>;
}
