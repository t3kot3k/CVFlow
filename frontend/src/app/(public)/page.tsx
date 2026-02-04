import {
  Hero,
  CompanyLogos,
  Features,
  HowItWorks,
  Pricing,
  FAQ,
  CTABanner,
} from "@/components/landing";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CompanyLogos />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTABanner />
    </>
  );
}
