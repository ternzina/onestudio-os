import { notFound } from "next/navigation";
import BookingManagementClient from "./BookingManagementClient";

type BookingManagementPageProps = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function BookingManagementPage({
  params,
}: BookingManagementPageProps) {
  const { token } = await params;

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      token,
    )
  ) {
    notFound();
  }

  return <BookingManagementClient token={token} />;
}
