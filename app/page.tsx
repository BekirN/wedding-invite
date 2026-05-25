"use client"
import { useRef } from "react"
import { HeroSection } from "@/components/HeroSection"
import { CountdownSection } from "@/components/CountdownSection"
import { LocationSection } from "@/components/LocationSection"
import { RsvpSection } from "@/components/RsvpSection"
import { ScrollProgress } from "@/components/ScrollProgress"
import { config } from "@/config/wedding.config"

export default function Home() {
  const mainRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <ScrollProgress containerRef={mainRef} />
      <main
        ref={mainRef}
        className="h-screen overflow-y-scroll overflow-x-hidden"
        style={{ scrollSnapType: "y mandatory" }}
      >
        <HeroSection
          couple={config.couple}
          heroImage={config.design.heroImage}
          gallery={config.gallery}
          music={config.music}
          containerRef={mainRef}
        />
        <CountdownSection weddingDate={config.event.weddingDate} />
        <LocationSection event={config.event} />
        <RsvpSection rsvpDeadline={config.event.rsvpDeadline} />
      </main>
    </>
  )
}
