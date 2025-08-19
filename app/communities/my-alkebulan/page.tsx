import { HeroSection } from "@/components/culture/hero-section"
import { SpiritualitySection } from "@/components/culture/spirituality-section"
import { LanguagesTribesSection } from "@/components/culture/languages-tribes-section"
import { WisdomLegacySection } from "@/components/culture/wisdom-legacy-section"
import { PersonalConnectionSection } from "@/components/culture/personal-connection-section"

export default function MyAlkebulanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950 dark:via-orange-950 dark:to-red-950">
      <div className="pt-16">
        <HeroSection />
        <SpiritualitySection />
        <LanguagesTribesSection />
        <WisdomLegacySection />
        <PersonalConnectionSection />
      </div>
    </div>
  )
}
