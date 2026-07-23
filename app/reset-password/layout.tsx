import type { ReactNode } from "react";
import { createPrivatePageMetadata } from "../_seo/site";

export const metadata = createPrivatePageMetadata("/reset-password", "Reset password");
export default function ResetPasswordLayout({ children }: { children: ReactNode }) { return children; }
