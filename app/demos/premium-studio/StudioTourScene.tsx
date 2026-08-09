"use client";

import { type PointerEvent, useEffect, useRef, useState } from "react";
import styles from "./PremiumInteractions.module.css";
import type { PremiumStudioContent } from "@/lib/public-site/premium-studio-content";

export default function StudioTourScene({ zones }: { zones: PremiumStudioContent["tour"]["zones"] }) {
  const roomRef = useRef<HTMLDivElement>(null);
  const start = useRef({ x: 0, y: 0, rx: -12, ry: -18 });
  const rotation = useRef({ x: -12, y: -18 });
  const frame = useRef(0);
  const dragging = useRef(false);
  const [active, setActive] = useState(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const applyRotation = () => {
    const room = roomRef.current;
    if (!room) return;
    room.style.setProperty("--room-x", `${rotation.current.x}deg`);
    room.style.setProperty("--room-y", `${rotation.current.y}deg`);
  };
  const pointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    start.current = { x: event.clientX, y: event.clientY, rx: rotation.current.x, ry: rotation.current.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    rotation.current.y = Math.max(-38, Math.min(25, start.current.ry + (event.clientX - start.current.x) * .12));
    rotation.current.x = Math.max(-24, Math.min(-4, start.current.rx - (event.clientY - start.current.y) * .08));
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(applyRotation);
  };
  const pointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const reset = () => {
    rotation.current = { x: -12, y: -18 };
    applyRotation();
  };

  return (
    <div className={styles.tourExperience} data-tour-interactive>
      <div className={styles.tourViewport} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} aria-label="Интерактивная трёхмерная схема фотостудии">
        <div className={styles.room} ref={roomRef}>
          <div className={styles.roomFloor} />
          <div className={styles.roomBack} />
          <div className={styles.roomSide} />
          <div className={styles.cyclorama}><i /></div>
          <div className={styles.softbox}><i /><b /></div>
          <div className={`${styles.softbox} ${styles.softboxTwo}`}><i /><b /></div>
          <div className={styles.makeup}><i /><b /><span /></div>
          <div className={styles.lounge}><i /><b /></div>
          <div className={styles.cobaltBlock} />
          {zones.map((zone, index) => <button key={zone.id} type="button" className={`${styles.hotspot} ${styles[`hotspot${index + 1}`]}`} aria-label={`Выбрать зону: ${zone.title}`} aria-pressed={active === index} onPointerDown={(event) => event.stopPropagation()} onClick={() => setActive(index)}><span>{index + 1}</span></button>)}
        </div>
        <span className={styles.dragHint}>Тяните, чтобы повернуть</span>
      </div>
      <aside className={styles.tourDetails} aria-live="polite">
        <span>0{active + 1} / 04</span><h3>{zones[active].title}</h3><p>{zones[active].text}</p>
        <div>{zones.map((zone, index) => <button type="button" key={zone.id} aria-label={zone.title} aria-pressed={active === index} onClick={() => setActive(index)}>{String(index + 1).padStart(2, "0")}</button>)}</div>
        <button type="button" className={styles.tourReset} onClick={reset}>Исходный ракурс ↺</button>
      </aside>
    </div>
  );
}
