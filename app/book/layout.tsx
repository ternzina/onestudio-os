import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online booking | OneStudio OS",
  description: "Choose a service, date and available time.",
};

export default function PublicBookingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
