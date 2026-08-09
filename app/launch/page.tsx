import { redirect } from "next/navigation";

/** Compatibility route. Customer creation is owned exclusively by /new-site. */
export default function LegacyLaunchRedirect() {
  redirect("/new-site");
}
