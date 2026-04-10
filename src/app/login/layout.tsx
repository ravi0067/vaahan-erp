import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — VaahanERP Dashboard",
  description:
    "Login to your VaahanERP dealership dashboard. Manage leads, bookings, inventory, and more.",
  alternates: {
    canonical: "https://vaahanerp.com/login",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
