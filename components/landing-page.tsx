import { HeroSection } from "@/components/sections/hero-section"
import { HowItWorksSection } from "@/components/sections/how-it-works-section"
import { DemoSection } from "@/components/sections/demo-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { PricingSection } from "@/components/sections/pricing-section"
import { ForWhoSection } from "@/components/sections/for-who-section"
import { FaqSection } from "@/components/sections/faq-section"
import { CtaSection } from "@/components/sections/cta-section"
import { Footer } from "@/components/sections/footer"
import { Navbar } from "@/components/navbar"
import { BackgroundPattern } from "@/components/ui/background-pattern"
import { RagVideoSection } from "@/components/sections/rag-video-section"
export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <BackgroundPattern />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <DemoSection />
        <RagVideoSection />
        <ForWhoSection />
        <PricingSection />
        <FeaturesSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
