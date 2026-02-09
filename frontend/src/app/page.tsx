import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  Hero,
  CompanyLogos,
  HowItWorks,
  Comparison,
  Testimonials,
  Features,
  Pricing,
  FAQ,
  CTABanner,
} from "@/components/landing";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1">
        <Hero />
        <CompanyLogos />
        <HowItWorks />
        <Comparison />
        <Testimonials />
        <Features />
        <Pricing />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
