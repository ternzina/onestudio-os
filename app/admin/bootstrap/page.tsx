import { redirect } from "next/navigation";

/** Client Launch 1.0 compatibility route; it no longer creates a workspace. */
export default function LegacyClientLaunchRedirect() {
  redirect("/new-site");
}
