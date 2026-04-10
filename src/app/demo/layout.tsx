import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Demo — Try VaahanERP Free",
  description:
    "Explore VaahanERP live demo with real data. Bike & Car dealership dashboards — bookings, leads, inventory, cashflow, service. No login required.",
  alternates: {
    canonical: "https://vaahanerp.com/demo",
  },
  openGraph: {
    title: "VaahanERP Live Demo — See It In Action",
    description:
      "Try the complete dealership management system. Bike & Car showroom demos with real data.",
    url: "https://vaahanerp.com/demo",
  },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
