/**
 * Browser execution realm required by an official source.
 *
 * The default is intentionally portal-safe: only sources with independent
 * source evidence opt into iframe-native execution in the registry metadata.
 */
export type PuckRuntimeRealm = "portal" | "iframeNative";

export type RuntimeRealmMetadata = {
  runtimeRealm?: PuckRuntimeRealm;
};

export function resolvePuckRuntimeRealm(metadata: RuntimeRealmMetadata): PuckRuntimeRealm {
  return metadata.runtimeRealm ?? "portal";
}

export function requiresIframeNativeRuntime(metadata: RuntimeRealmMetadata) {
  return resolvePuckRuntimeRealm(metadata) === "iframeNative";
}

export type ProductionRuntimeMode = "authoring" | "interactive" | "library-preview" | "public";

export function shouldUseIframeNativeRuntime(
  metadata: RuntimeRealmMetadata,
  _mode: ProductionRuntimeMode,
) {
  // The realm is a source contract, not a surface-specific optimization.
  // Authoring uses the same iframe and disables its pointer hit testing at
  // the host, so Puck selection remains available without leaking globals.
  void _mode;
  return requiresIframeNativeRuntime(metadata);
}
