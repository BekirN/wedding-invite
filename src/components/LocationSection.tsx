"use client"
import { motion } from "framer-motion"

interface EventConfig {
  weddingDate: string
  reception: {
    time: string
    venue: string
    address: string
    mapsUrl: string
    mapsEmbed?: string
  }
}

const E = [0.22, 1, 0.36, 1] as const
const VP = { once: true, margin: "-60px" }

function getReceptionEmbedSrc(reception: EventConfig["reception"]) {
  if (reception.mapsEmbed && reception.mapsEmbed.trim().length > 0) {
    return reception.mapsEmbed
  }

  const fallbackQuery = encodeURIComponent(`${reception.venue}, ${reception.address}`)
  return `https://www.google.com/maps?q=${fallbackQuery}&output=embed`
}

export function LocationSection({ event }: { event: EventConfig }) {
  const formattedDate = new Date(event.weddingDate).toLocaleDateString("sr-Latn-RS", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const embedSrc = getReceptionEmbedSrc(event.reception)

  return (
    <section
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6 py-20"
      style={{ scrollSnapAlign: "start", background: "var(--cream)" }}
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: E }}
            viewport={VP}
            className="text-[10px] uppercase tracking-[0.58em] text-[var(--gold)]"
          >
            Lokacija
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: E }}
            viewport={VP}
            className="mt-4 font-serif text-[clamp(34px,7vw,58px)] leading-none text-[var(--dark)]"
          >
            Gdje slavimo
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.75, delay: 0.2, ease: E }}
            viewport={VP}
            className="mt-4 text-[13px] capitalize text-[var(--mid)]"
          >
            {formattedDate}
          </motion.p>
        </div>

        <motion.a
          href={event.reception.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1, ease: E }}
          viewport={VP}
          whileHover={{ y: -4 }}
          className="mt-10 block rounded-[28px] border border-[var(--gold-border)] bg-white p-6 no-underline"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <p className="text-[10px] uppercase tracking-[0.34em] text-[var(--gold)]">Proslava</p>
          <p className="mt-3 font-serif text-[28px] leading-tight text-[var(--dark)]">{event.reception.venue}</p>
          <p className="mt-2 text-[13px] leading-7 text-[var(--mid)]">{event.reception.address}</p>

          <div className="mt-5 flex items-center gap-3">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--gold)]">{event.reception.time}</p>
            <div className="h-px flex-1 bg-[var(--gold-border-strong)]" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">Mapa</span>
          </div>
        </motion.a>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: E }}
          viewport={VP}
          className="mt-6 overflow-hidden rounded-[28px] border border-[var(--gold-border)] bg-white"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <iframe
            src={embedSrc}
            width="100%"
            height="290"
            style={{ border: 0, filter: "sepia(0.18) saturate(0.95)" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Lokacija proslave"
          />
        </motion.div>
      </div>

      <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 2.2, repeat: Infinity }} className="absolute bottom-8 text-[var(--mid)]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.div>
    </section>
  )
}
