"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface Props {
  weddingDate: string
}

const E = [0.22, 1, 0.36, 1] as const
const VP = { once: true, margin: "-60px" }

function pad(value: number) {
  return String(Math.max(0, value)).padStart(2, "0")
}

export function CountdownSection({ weddingDate }: Props) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    const update = () => {
      const diff = new Date(weddingDate).getTime() - Date.now()

      if (diff <= 0) {
        setTime({ d: 0, h: 0, m: 0, s: 0 })
        return
      }

      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }

    update()
    const id = setInterval(update, 1000)

    return () => clearInterval(id)
  }, [weddingDate])

  const items = [
    { value: time.d, label: "Dana" },
    { value: time.h, label: "Sati" },
    { value: time.m, label: "Minuta" },
    { value: time.s, label: "Sekundi" },
  ]

  const formattedDate = new Date(weddingDate).toLocaleDateString("sr-Latn-RS", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <section
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6"
      style={{ scrollSnapAlign: "start", background: "linear-gradient(180deg, var(--white) 0%, #f6f0e8 100%)" }}
    >
      <div className="relative z-10 mx-auto w-full max-w-5xl rounded-[38px] border border-[var(--gold-border)] bg-white/85 p-8 backdrop-blur-sm md:p-12" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: E }}
            viewport={VP}
            className="text-[10px] uppercase tracking-[0.58em] text-[var(--gold)]"
          >
            Odbrojavanje
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: E }}
            viewport={VP}
            className="mt-4 font-serif text-[clamp(34px,7vw,58px)] leading-none text-[var(--dark)]"
          >
            Do našeg dana
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: E }}
            viewport={VP}
            className="mt-4 text-[13px] capitalize text-[var(--mid)]"
          >
            {formattedDate}
          </motion.p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {items.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.12 + index * 0.08, ease: E }}
              viewport={VP}
              className="rounded-[24px] border border-[var(--gold-border)] bg-[var(--cream)] px-4 py-6 text-center"
            >
              <p className="font-serif text-[clamp(38px,9vw,70px)] leading-none text-[var(--dark)]">{pad(item.value)}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.38em] text-[var(--muted)]">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 2.2, repeat: Infinity }} className="absolute bottom-8 text-[var(--mid)]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.div>
    </section>
  )
}
