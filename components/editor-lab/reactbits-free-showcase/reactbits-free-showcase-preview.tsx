"use client";

import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from "react";
import Ballpit from "@/components/react-bits/Ballpit";
import FloatingLines from "@/components/react-bits/FloatingLines";
import GlowCursor from "@/components/react-bits/GlowCursor";
import MagicRings from "@/components/react-bits/MagicRings";
import ParticleText from "@/components/react-bits/ParticleText";
import SplashCursor from "@/components/react-bits/SplashCursor";
import Strands from "@/components/react-bits/Strands";
import { RuntimeHost } from "@/components/editor-lab/puck/block-contract";
import styles from "@/components/editor-lab/reactbits-fast-batch-4/reactbits-fast-batch-preview.module.css";

const canvasHost = {
  profile: "canvas" as const,
  width: "full" as const,
  height: "technical-definite" as const,
  technicalHeight: { value: 480, provenance: "puck-technical" as const },
  overflow: "clip" as const,
  surfaceBackground: { value: "#000000", provenance: "official-demo" as const },
  runtimeRisk: "webgl" as const,
};

const stages = [
  { name: "Glow Cursor", sourceFile: "GlowCursor.tsx", Component: GlowCursor },
  { name: "Particle Text", sourceFile: "ParticleText.tsx", Component: ParticleText },
  { name: "Magic Rings", sourceFile: "MagicRings.tsx", Component: MagicRings },
  { name: "Strands", sourceFile: "Strands.tsx", Component: Strands },
  { name: "Splash Cursor", sourceFile: "SplashCursor.tsx", Component: SplashCursor },
  { name: "Floating Lines", sourceFile: "FloatingLines.tsx", Component: FloatingLines },
  { name: "Ballpit", sourceFile: "Ballpit.tsx", Component: Ballpit },
] as const;

type StageBoundaryProps = {
  children: ReactNode;
  onError: (error: Error) => void;
};

class ReviewStageErrorBoundary extends Component<StageBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    this.props.onError(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function ReactBitsFreeShowcasePreview() {
  const [runtimeErrors, setRuntimeErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const recordRuntimeError = (value: unknown) => {
      const error = value instanceof Error ? value : new Error(String(value));
      const evidence = `${error.message}\n${error.stack ?? ""}`;
      const stage = stages.find(({ sourceFile }) => evidence.includes(sourceFile));
      if (!stage) return false;
      setRuntimeErrors((current) => current[stage.name] ? current : { ...current, [stage.name]: error.message });
      return true;
    };

    const onError = (event: ErrorEvent) => {
      if (recordRuntimeError(event.error ?? event.message)) event.preventDefault();
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (recordRuntimeError(event.reason)) event.preventDefault();
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.group}>
        <h1 className={styles.heading}>React Bits Free Showcase</h1>
        <div className={styles.grid}>
          {stages.map(({ name, Component }) => (
            <article className={styles.item} data-free-showcase-stage={name} key={name}>
              <h2 className={styles.label}>{name}</h2>
              {runtimeErrors[name] ? (
                <p className={styles.blocked} data-free-showcase-runtime-error={name}>{runtimeErrors[name]}</p>
              ) : (
                <ReviewStageErrorBoundary onError={(error) => setRuntimeErrors((current) => ({ ...current, [name]: error.message }))}>
                  <RuntimeHost host={canvasHost}><Component /></RuntimeHost>
                </ReviewStageErrorBoundary>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
