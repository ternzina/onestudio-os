import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Backward-compatible export for existing client components.
// The underlying @supabase/ssr client stores the session in cookies so
// Next.js Proxy and Server Components can verify the same authenticated user.
export const supabase = getSupabaseBrowserClient();
export { getSupabaseBrowserClient };
