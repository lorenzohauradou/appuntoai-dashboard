import { LandingPage } from "@/components/landing-page"
import { BackgroundPattern } from "@/components/ui/background-pattern"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <BackgroundPattern />
      <LandingPage />
    </div>
  )
}
