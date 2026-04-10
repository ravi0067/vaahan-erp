import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Affordable Dealership Software Plans",
  description:
    "VaahanERP pricing plans for bike, car & EV dealerships. Free trial available. Starting at ₹0/month. Choose the plan that fits your showroom.",
  alternates: {
    canonical: "https://vaahanerp.com/pricing",
  },
  openGraph: {
    title: "VaahanERP Pricing — Plans for Every Dealership",
    description:
      "Affordable AI-powered dealership management starting at ₹0. Compare plans and features.",
    url: "https://vaahanerp.com/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
