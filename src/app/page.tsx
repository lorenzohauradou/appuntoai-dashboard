import { HeroSection } from "@/src/components/home/hero-section"
import { HowItWorksSection } from "@/src/components/home/how-it-works-section"
import { DemoSection } from "@/src/components/home/demo-section"
import { FeaturesSection } from "@/src/components/home/features-section"
import { PricingSection } from "@/src/components/home/pricing-section"
import { ForWhoSection } from "@/src/components/home/for-who-section"
import { FaqSection } from "@/src/components/home/faq-section"
import { CtaSection } from "@/src/components/home/cta-section"
import { Footer } from "@/src/components/home/footer"
import { Navbar } from "@/src/components/navbar"
import { BackgroundPattern } from "@/src/components/ui/background-pattern"
import { RagVideoSection } from "@/src/components/home/rag-video-section"

export default function Home() {
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
