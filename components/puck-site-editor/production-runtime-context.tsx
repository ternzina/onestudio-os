"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ProductionRuntimeMode } from "@/lib/puck-site-editor/runtime-realm";

const ProductionRuntimeContext = createContext(false);
const ProductionRuntimeModeContext = createContext<ProductionRuntimeMode | null>(null);

export function ProductionRuntimeBoundary({
  children,
  runtimeMode = "interactive",
}: {
  children: ReactNode;
  runtimeMode?: ProductionRuntimeMode;
}) {
  return (
    <ProductionRuntimeContext.Provider value>
      <ProductionRuntimeModeContext.Provider value={runtimeMode}>
        {children}
      </ProductionRuntimeModeContext.Provider>
    </ProductionRuntimeContext.Provider>
  );
}

export function useInsideProductionRuntime() {
  return useContext(ProductionRuntimeContext);
}

export function useProductionRuntimeMode() {
  return useContext(ProductionRuntimeModeContext);
}
