import { Header } from "./sections/Header"
import { HeroSection } from "./sections/HeroSection"
import { FeaturesSection } from "./sections/FeaturesSection"
import { HowItWorksSection } from "./sections/HowItWorksSection"
import { TechStackSection } from "./sections/TechStackSection"
import { AboutSection } from "./sections/AboutSection"
import { CTASection } from "./sections/CTASection"
import { Footer } from "./sections/Footer"

export default function HomePage() {
  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header onScrollToSection={scrollToSection} />
      <HeroSection onScrollToSection={scrollToSection} />
      <FeaturesSection />
      <HowItWorksSection />
      <TechStackSection />
      <AboutSection />
      <CTASection />
      <Footer />
    </div>
  )
}
