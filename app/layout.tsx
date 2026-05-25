import type { Metadata } from "next"
import "./globals.css"
import { config } from "@/config/wedding.config"

export const metadata: Metadata = {
  title: `${config.couple.person1.name} & ${config.couple.person2.name}`,
  description: `Pozivamo vas na naše vjenčanje - ${config.event.weddingDate}`,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr">
      <body>{children}</body>
    </html>
  )
}
