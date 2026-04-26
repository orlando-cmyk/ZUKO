'use client'
import CustomCursor    from './CustomCursor'
import NoiseOverlay   from './NoiseOverlay'
import AgencyNav      from './AgencyNav'
import HeroSection    from './HeroSection'
import AboutSection   from './AboutSection'
import ServicesSection from './ServicesSection'
import WorkSection    from './WorkSection'
import ContactSection from './ContactSection'

export default function AgencyClient() {
  return (
    <div
      id="agency-scroll"
      className="agency-root fixed inset-0 z-[9999] overflow-y-auto overflow-x-hidden"
      style={{ background: '#0A0A0A', fontFamily: 'var(--font-inter)' }}
    >
      <CustomCursor />
      <NoiseOverlay />
      <AgencyNav />

      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <WorkSection />
        <ContactSection />
      </main>
    </div>
  )
}
