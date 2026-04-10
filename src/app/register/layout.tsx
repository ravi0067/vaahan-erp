import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register Your Dealership — Get Started Free",
  description:
    "Register your bike, car or EV dealership on VaahanERP. Free trial, no credit card required. Setup in 2 minutes.",
  alternates: {
    canonical: "https://vaahanerp.com/register",
  },
  openGraph: {
    title: "Register on VaahanERP — Free Dealership Software",
    description:
      "Start managing your dealership with AI. Free trial, instant setup.",
    url: "https://vaahanerp.com/register",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
