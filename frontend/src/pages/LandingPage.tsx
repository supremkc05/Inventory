import {
  CTA,
  DashboardPreview,
  Features,
  Footer,
  Hero,
  HowItWorks,
  Navbar,
  NepalShowcase,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-white text-slate-900">
      <Navbar />
      <main>
        <Hero />
        <DashboardPreview />
        <Features />
        <NepalShowcase />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
