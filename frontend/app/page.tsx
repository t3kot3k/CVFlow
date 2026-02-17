import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { LogoStrip } from "@/components/logo-strip"
import { FeatureTabs } from "@/components/feature-tabs"
import { HowItWorks } from "@/components/how-it-works"
import { GlobalCoverage } from "@/components/global-coverage"
import { TemplatesGallery } from "@/components/templates-gallery"
import { Testimonials } from "@/components/testimonials"
import { Pricing } from "@/components/pricing"
import { CTABanner } from "@/components/cta-banner"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <LogoStrip />
        <FeatureTabs />
        <HowItWorks />
        <GlobalCoverage />
        <TemplatesGallery />
        <Testimonials />
        <Pricing />
        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}
