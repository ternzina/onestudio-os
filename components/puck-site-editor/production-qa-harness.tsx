"use client";

import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { PUCK_PRODUCTION_MANIFEST_BY_ID } from "@/lib/puck-site-editor/registry-manifest";
import type { PuckDocumentComponent } from "@/lib/puck-site-editor/document";
import { PuckProductionBlock } from "./public-renderer";

type QaResult = {
  id: string;
  width: number;
  height: number;
  horizontalOverflow: boolean;
  error: string | null;
};

class ProductionQaErrorBoundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  state = { error: null as string | null };

  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // The generic QA card exposes the component-local failure in the DOM.
  }

  render() {
    if (this.state.error) {
      return <div data-production-qa-error={this.state.error}>Component runtime failed</div>;
    }
    return this.props.children;
  }
}

function componentFor(id: string, index: number): PuckDocumentComponent {
  const entry = PUCK_PRODUCTION_MANIFEST_BY_ID.get(id);
  if (!entry) throw new Error(`Unknown production QA component: ${id}`);
  return {
    type: id,
    props: {
      id: `production-qa-${index + 1}`,
      ...structuredClone(entry.defaults),
    },
  };
}

function QaStage({ id, index }: { id: string; index: number }) {
  const entry = PUCK_PRODUCTION_MANIFEST_BY_ID.get(id);
  if (!entry) return null;
  return (
    <section
      data-production-qa-stage={id}
      style={{ width: "100%", minWidth: 0, overflowX: "clip", borderBottom: "1px solid #e5e5e5" }}
    >
      <header style={{ padding: "8px 12px", font: "12px/1.4 ui-monospace", background: "#fafafa" }}>
        {entry.label} · {entry.taxonomy} · {entry.sourceTier}
      </header>
      <ProductionQaErrorBoundary>
        <PuckProductionBlock component={componentFor(id, index)} />
      </ProductionQaErrorBoundary>
    </section>
  );
}

export default function ProductionQaHarness({
  componentIds,
  automatic,
}: {
  componentIds: readonly string[];
  automatic: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<QaResult[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const currentId = componentIds[index];
  const manualComponents = useMemo(
    () => componentIds.map((id, itemIndex) => <QaStage id={id} index={itemIndex} key={id} />),
    [componentIds],
  );

  useEffect(() => {
    if (!automatic || !currentId) return;
    let checks = 0;
    const timer = window.setInterval(() => {
      checks += 1;
      const stage = stageRef.current?.querySelector<HTMLElement>("[data-production-qa-stage]");
      const loading = stage?.querySelector("[data-production-component-loading]");
      if ((!stage || loading) && checks < 100) return;
      window.clearInterval(timer);
      const surface = stage?.querySelector<HTMLElement>("[data-production-component]");
      const error = stage?.querySelector<HTMLElement>("[data-production-qa-error]")?.dataset.productionQaError ?? null;
      const bounds = surface?.getBoundingClientRect();
      const result: QaResult = {
        id: currentId,
        width: Math.round(bounds?.width ?? 0),
        height: Math.round(bounds?.height ?? 0),
        horizontalOverflow: Boolean(stage && stage.scrollWidth > stage.clientWidth + 2),
        error: error ?? (checks >= 100 ? "COMPONENT_LOAD_TIMEOUT" : null),
      };
      setResults((previous) => [...previous, result]);
      setIndex((previous) => previous + 1);
    }, 100);
    return () => window.clearInterval(timer);
  }, [automatic, currentId]);

  if (!automatic) {
    return <main data-production-qa-mode="manual">{manualComponents}</main>;
  }

  if (!currentId) {
    return (
      <main
        data-production-qa-mode="automatic"
        data-production-qa-complete="true"
        data-production-qa-count={results.length}
      >
        <pre data-production-qa-results>{JSON.stringify(results)}</pre>
      </main>
    );
  }

  return (
    <main data-production-qa-mode="automatic">
      <div ref={stageRef}>
        <QaStage id={currentId} index={index} key={currentId} />
      </div>
      <output data-production-qa-progress>{index + 1}/{componentIds.length}</output>
    </main>
  );
}
