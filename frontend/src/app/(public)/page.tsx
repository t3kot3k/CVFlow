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
    <>
      <Hero />
      <CompanyLogos />
      <HowItWorks />
      <Comparison />
      <Testimonials />
      <Features />
      <Pricing />
      <FAQ />
      <CTABanner />
    </>
  );
}
