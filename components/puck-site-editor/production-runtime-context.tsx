"use client";

import { createContext, useContext, type ReactNode } from "react";

const ProductionRuntimeContext = createContext(false);

export function ProductionRuntimeBoundary({ children }: { children: ReactNode }) {
  return (
    <ProductionRuntimeContext.Provider value>
      {children}
    </ProductionRuntimeContext.Provider>
  );
}

export function useInsideProductionRuntime() {
  return useContext(ProductionRuntimeContext);
}
