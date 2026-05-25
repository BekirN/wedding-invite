"use client"
import { EnvelopeInviteExperience } from "@/components/EnvelopeInviteExperience"
import { config } from "@/config/wedding.config"

export default function Home() {
  return (
    <EnvelopeInviteExperience
      couple={config.couple}
      event={config.event}
      music={config.music}
      gallery={config.gallery}
      heroImage={config.design.heroImage}
    />
  )
}
