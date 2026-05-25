"use client"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { MusicPlayer } from "@/components/MusicPlayer"

interface Props {
  couple: {
    person1: { name: string; lastName: string }
    person2: { name: string; lastName: string }
    story: string
    hashtag: string
  }
  event: {
    weddingDate: string
    rsvpDeadline: string
    reception: {
      time: string
      venue: string
      address: string
      mapsUrl: string
      mapsEmbed?: string
    }
  }
  music: {
    title: string
    artist: string
    src: string
  }
  gallery: string[]
  heroImage: string
}

function getCountdown(dateString: string) {
  const diff = new Date(dateString).getTime() - Date.now()
  if (diff <= 0) return { d: 0, h: 0, m: 0 }
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
  }
}

function getEmbedSrc(reception: Props["event"]["reception"]) {
  if (reception.mapsEmbed && reception.mapsEmbed.trim().length > 0) return reception.mapsEmbed
  const q = encodeURIComponent(`${reception.venue}, ${reception.address}`)
  return `https://www.google.com/maps?q=${q}&output=embed`
}

const E = [0.22, 1, 0.36, 1] as const

export function EnvelopeInviteExperience({ couple, event, music, gallery, heroImage }: Props) {
  const [opened, setOpened] = useState(false)
  const [opening, setOpening] = useState(false)
  const [attending, setAttending] = useState<"yes" | "no" | null>(null)
  const [name, setName] = useState("")
  const [guests, setGuests] = useState(1)
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle")
  const [countdown, setCountdown] = useState(() => getCountdown(event.weddingDate))

  useEffect(() => {
    const id = setInterval(() => setCountdown(getCountdown(event.weddingDate)), 1000)
    return () => clearInterval(id)
  }, [event.weddingDate])

  const prettyDate = useMemo(
    () => new Date(event.weddingDate).toLocaleDateString("sr-Latn-RS", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    [event.weddingDate],
  )

  const rsvpDeadline = useMemo(
    () => new Date(event.rsvpDeadline).toLocaleDateString("sr-Latn-RS", { day: "numeric", month: "long", year: "numeric" }),
    [event.rsvpDeadline],
  )

  const shortDate = useMemo(
    () => new Date(event.weddingDate).toLocaleDateString("sr-Latn-RS", { day: "numeric", month: "long", year: "numeric" }),
    [event.weddingDate],
  )

  const embedSrc = useMemo(() => getEmbedSrc(event.reception), [event.reception])
  const photos = useMemo(() => (gallery.length > 0 ? gallery : [heroImage]), [gallery, heroImage])

  const openEnvelope = () => {
    if (opening || opened) return
    setOpening(true)
    setTimeout(() => {
      setOpened(true)
      setOpening(false)
      window.scrollTo({ top: 0, behavior: "instant" })
    }, 1000)
  }

  const submitRsvp = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!name.trim() || attending === null) return
    setStatus("sending")
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, attending: attending === "yes", plusOnes: attending === "yes" ? Math.max(0, guests - 1) : 0, message }),
      })
      setStatus(res.ok ? "done" : "error")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* Boat background — fixed, shows behind entire opened invite */}
      {opened && (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <Image
            src="/images/IMG_9901.png"
            alt=""
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0" style={{ background: "rgba(250,247,242,0.70)" }} />
        </div>
      )}
      <AnimatePresence mode="wait">
        {!opened ? (
          /* ─────────────────────────────────────────────────────── ENVELOPE ── */
          <motion.section
            key="closed-envelope"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.4 } }}
            className="relative flex min-h-screen items-center justify-center overflow-hidden px-5"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_0%,_#fffdf8_0%,_#f7ede0_50%,_#e8d9c4_100%)]" />

            {/* Corner decorations */}
            <div className="absolute left-5 top-5 h-9 w-9 border-l-[1.5px] border-t-[1.5px] border-[rgba(160,120,80,0.22)]" />
            <div className="absolute right-5 top-5 h-9 w-9 border-r-[1.5px] border-t-[1.5px] border-[rgba(160,120,80,0.22)]" />
            <div className="absolute bottom-5 left-5 h-9 w-9 border-b-[1.5px] border-l-[1.5px] border-[rgba(160,120,80,0.22)]" />
            <div className="absolute bottom-5 right-5 h-9 w-9 border-b-[1.5px] border-r-[1.5px] border-[rgba(160,120,80,0.22)]" />

            <div className="relative z-10 w-full max-w-[520px] text-center">
              <p className="text-[10px] uppercase tracking-[0.58em] text-[var(--gold)]">Pozivnica</p>
              <h1 className="mt-3 font-serif text-[clamp(34px,10vw,62px)] leading-none text-[var(--dark)]">
                {couple.person1.name} <span className="italic text-[var(--gold)]">&</span> {couple.person2.name}
              </h1>
              <p className="mt-2 text-[13px] capitalize text-[var(--muted)]">{shortDate}</p>

              {/* ─── NEW ENVELOPE ─── */}
              <button
                type="button"
                onClick={openEnvelope}
                className="group mt-10 w-full cursor-pointer border-none bg-transparent p-0"
              >
                {/* perspective wrapper */}
                <div
                  className="relative mx-auto w-full max-w-[420px]"
                  style={{ aspectRatio: "3/2", perspective: "1100px" }}
                >
                  {/* ── LAYER 1: Envelope body ── */}
                  <div
                    className="absolute inset-0 overflow-hidden rounded-[10px]"
                    style={{
                      background: "linear-gradient(160deg, #f8eed8 0%, #ede0c6 100%)",
                      border: "1px solid rgba(160,120,80,0.30)",
                      boxShadow: "0 14px 52px rgba(28,24,20,0.18), 0 3px 10px rgba(28,24,20,0.10)",
                    }}
                  >
                    {/* Bottom fold */}
                    <div
                      className="absolute inset-0"
                      style={{ clipPath: "polygon(0% 100%, 100% 100%, 50% 52%)", background: "linear-gradient(180deg, #e0caa8 0%, #cdb48c 100%)" }}
                    />
                    {/* Left fold */}
                    <div
                      className="absolute inset-0"
                      style={{ clipPath: "polygon(0% 0%, 0% 100%, 50% 52%)", background: "linear-gradient(90deg, #d5c09e 0%, #e6d5b8 100%)" }}
                    />
                    {/* Right fold */}
                    <div
                      className="absolute inset-0"
                      style={{ clipPath: "polygon(100% 0%, 100% 100%, 50% 52%)", background: "linear-gradient(270deg, #d5c09e 0%, #e6d5b8 100%)" }}
                    />
                    {/* Fold centre lines */}
                    <div className="absolute left-1/2 top-[52%] h-[1px] w-[1px] -translate-x-1/2 -translate-y-1/2" />
                  </div>

                  {/* ── LAYER 2: Card inside envelope ── */}
                  <motion.div
                    animate={opening ? { y: "-66%" } : { y: "0%" }}
                    transition={{ duration: 0.88, delay: 0.18, ease: E }}
                    className="absolute flex flex-col items-center justify-center rounded-[7px] bg-white/97"
                    style={{
                      left: "14%", right: "14%", top: "48%", bottom: "9%",
                      border: "1px solid rgba(160,120,80,0.22)",
                      boxShadow: "0 4px 22px rgba(28,24,20,0.10)",
                    }}
                  >
                    <p className="font-serif text-[clamp(13px,3.2vw,18px)] leading-tight text-[var(--dark)]">
                      {couple.person1.name} <span className="text-[var(--gold)]">&</span> {couple.person2.name}
                    </p>
                    <p className="mt-1 text-[8px] uppercase tracking-[0.44em] text-[var(--muted)]">Pozivnica · 2026</p>
                  </motion.div>

                  {/* ── LAYER 3: Wax seal ── */}
                  <motion.div
                    animate={opening ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                    transition={{ duration: 0.22, ease: "easeIn" }}
                    className="absolute left-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
                    style={{ top: "60%" }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.07, 1] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
                      className="flex h-[56px] w-[56px] items-center justify-center rounded-full"
                      style={{
                        background: "radial-gradient(circle at 38% 36%, #b86038, #6e2c0e)",
                        boxShadow: "0 5px 18px rgba(100,40,10,0.44), inset 0 1px 3px rgba(255,190,110,0.24)",
                      }}
                    >
                      <span
                        className="select-none font-serif text-[11px] font-light tracking-widest"
                        style={{ color: "#f8d898" }}
                      >
                        N&M
                      </span>
                    </motion.div>
                  </motion.div>

                  {/* ── LAYER 4: Top flap — LAST = renders on top ── */}
                  <motion.div
                    animate={opening ? { rotateX: -172 } : { rotateX: 0 }}
                    transition={{ duration: 0.92, delay: 0.24, ease: E }}
                    className="absolute inset-x-0 top-0 z-20 origin-top"
                    style={{
                      height: "59%",
                      clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)",
                      background: "linear-gradient(168deg, #f5e8d2 0%, #dac6a2 100%)",
                      backfaceVisibility: "hidden",
                      transformStyle: "preserve-3d",
                    }}
                  />
                </div>

                <p
                  className={`mt-4 text-[11px] uppercase tracking-[0.44em] transition-colors duration-300 ${
                    opening ? "text-[var(--gold)]" : "text-[var(--muted)] group-hover:text-[var(--gold)]"
                  }`}
                >
                  {opening ? "Otvaramo..." : "Klikni da otvoriš"}
                </p>
              </button>
            </div>
          </motion.section>
        ) : (
          /* ─────────────────────────────────────────────────── OPENED INVITE ── */
          <motion.main
            key="opened-invite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.65 }}
            className="relative"
          >
            {/* ── Mobile cover photo ── */}
            <div className="relative w-full overflow-hidden md:hidden" style={{ height: "54vw", maxHeight: 270 }}>
              <Image
                src={heroImage}
                alt={`${couple.person1.name} & ${couple.person2.name}`}
                fill
                className="object-cover object-center"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-[var(--cream)]" />
              <div className="absolute bottom-3 left-0 right-0 text-center">
                <p
                  className="font-serif text-[24px] leading-none text-white"
                  style={{ textShadow: "0 2px 12px rgba(0,0,0,0.45)" }}
                >
                  {couple.person1.name} <span style={{ color: "#e8c870" }}>&</span> {couple.person2.name}
                </p>
              </div>
            </div>

            {/* ── Hero / main invite section ── */}
            <section className="relative overflow-hidden px-4 py-6 md:flex md:min-h-screen md:items-center md:px-8 md:py-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,253,248,0.80)_0%,_rgba(248,240,228,0.72)_52%,_rgba(240,227,209,0.65)_100%)]" />

              {/* Desktop floating polaroids */}
              <div className="absolute left-3 top-16 hidden w-[160px] rotate-[-8deg] md:block lg:w-[190px]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] border border-[var(--gold-border)] bg-white/90 p-1.5" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="relative h-full w-full overflow-hidden rounded-[12px]"><Image src={photos[0]} alt="Uspomena 1" fill className="object-cover" sizes="190px" /></div>
                </div>
              </div>
              <div className="absolute right-4 top-20 hidden w-[180px] rotate-[7deg] md:block lg:w-[210px]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] border border-[var(--gold-border)] bg-white/90 p-1.5" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="relative h-full w-full overflow-hidden rounded-[12px]"><Image src={photos[1]} alt="Uspomena 2" fill className="object-cover" sizes="210px" /></div>
                </div>
              </div>
              <div className="absolute bottom-12 left-10 hidden w-[170px] rotate-[6deg] md:block lg:w-[200px]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] border border-[var(--gold-border)] bg-white/90 p-1.5" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="relative h-full w-full overflow-hidden rounded-[12px]"><Image src={photos[2]} alt="Uspomena 3" fill className="object-cover" sizes="200px" /></div>
                </div>
              </div>
              <div className="absolute bottom-8 right-14 hidden w-[160px] rotate-[-7deg] md:block lg:w-[190px]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] border border-[var(--gold-border)] bg-white/90 p-1.5" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="relative h-full w-full overflow-hidden rounded-[12px]"><Image src={photos[3]} alt="Uspomena 4" fill className="object-cover" sizes="190px" /></div>
                </div>
              </div>

              <div className="relative z-10 mx-auto w-full max-w-4xl">
                {/* ── Mobile polaroid strip above card ── */}
                <div className="mb-5 flex items-end justify-center gap-4 md:hidden">
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.55, ease: E }}
                    style={{ rotate: -6 }}
                    className="w-[110px] flex-none"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[10px] border border-[var(--gold-border)] bg-white p-[5px]" style={{ boxShadow: "var(--shadow-card)" }}>
                      <div className="relative h-full w-full overflow-hidden rounded-[7px]">
                        <Image src={photos[4 % photos.length]} alt="Uspomena" fill className="object-cover" sizes="110px" />
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.55, ease: E }}
                    style={{ rotate: 5 }}
                    className="w-[120px] flex-none"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[10px] border border-[var(--gold-border)] bg-white p-[5px]" style={{ boxShadow: "var(--shadow-card)" }}>
                      <div className="relative h-full w-full overflow-hidden rounded-[7px]">
                        <Image src={photos[5 % photos.length]} alt="Uspomena" fill className="object-cover" sizes="120px" />
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18, duration: 0.55, ease: E }}
                    style={{ rotate: -3 }}
                    className="w-[100px] flex-none"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[10px] border border-[var(--gold-border)] bg-white p-[5px]" style={{ boxShadow: "var(--shadow-card)" }}>
                      <div className="relative h-full w-full overflow-hidden rounded-[7px]">
                        <Image src={photos[6 % photos.length]} alt="Uspomena" fill className="object-cover" sizes="100px" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* ── Main invite card ── */}
                <div
                  className="rounded-[30px] border border-[var(--gold-border)] bg-[linear-gradient(180deg,#fffdfa_0%,#fff8ef_100%)] p-5 md:p-8"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <p className="text-center text-[10px] uppercase tracking-[0.5em] text-[var(--gold)]">Vjencanje</p>
                  <h2 className="mt-3 text-center font-serif text-[clamp(32px,8vw,68px)] leading-none text-[var(--dark)]">
                    {couple.person1.name} <span className="text-[var(--gold)]">&</span> {couple.person2.name}
                  </h2>

                  <p className="mx-auto mt-4 max-w-[680px] text-center text-[14px] leading-7 text-[var(--mid)]">{couple.story}</p>

                  {/* Countdown */}
                  <div className="mt-5 grid grid-cols-3 gap-2 md:gap-3">
                    {[{ v: countdown.d, l: "Dana" }, { v: countdown.h, l: "Sati" }, { v: countdown.m, l: "Min" }].map(({ v, l }) => (
                      <div key={l} className="rounded-[12px] border border-[var(--gold-border)] bg-[var(--cream)] px-2 py-3 text-center md:py-4">
                        <p className="font-serif text-[clamp(22px,6vw,32px)] leading-none text-[var(--dark)]">{String(v).padStart(2, "0")}</p>
                        <p className="mt-1 text-[9px] uppercase tracking-[0.26em] text-[var(--muted)]">{l}</p>
                      </div>
                    ))}
                  </div>

                  {/* Date + Music */}
                  <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_340px]">
                    <div className="rounded-[14px] border border-[var(--gold-border)] bg-white/80 p-4 md:p-5">
                      <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--gold)]">Datum i lokacija</p>
                      <p className="mt-2 text-[13px] capitalize text-[var(--mid)]">{prettyDate}</p>
                      <p className="mt-1 font-serif text-[clamp(22px,5vw,30px)] text-[var(--dark)]">{event.reception.time}</p>
                      <p className="mt-3 font-serif text-[clamp(20px,4.5vw,26px)] leading-tight text-[var(--dark)]">{event.reception.venue}</p>
                      <p className="mt-2 text-[13px] leading-6 text-[var(--mid)]">{event.reception.address}</p>
                      <a
                        href={event.reception.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block rounded-full border border-[var(--gold)] px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]"
                      >
                        Otvori mapu
                      </a>
                    </div>
                    <div className="mx-auto w-full max-w-[360px]">
                      <MusicPlayer music={music} />
                    </div>
                  </div>

                  <p className="mt-5 text-center text-[10px] uppercase tracking-[0.4em] text-[var(--muted)]">{couple.hashtag}</p>
                </div>

                {/* ── Gallery – mobile: horizontal scroll ── */}
                <div className="mt-4 flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden">
                  {photos.map((photo, i) => (
                    <div
                      key={`m-${photo}-${i}`}
                      className="relative h-[165px] w-[118px] flex-none overflow-hidden rounded-[10px] border border-[var(--gold-border)] bg-white p-[4px]"
                    >
                      <div className="relative h-full w-full overflow-hidden rounded-[7px]">
                        <Image src={photo} alt={`Galerija ${i + 1}`} fill className="object-cover" sizes="118px" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Gallery – desktop: grid ── */}
                <div className="mt-4 hidden gap-2 md:grid md:grid-cols-3 lg:grid-cols-5">
                  {photos.map((photo, i) => (
                    <div
                      key={`d-${photo}-${i}`}
                      className="relative aspect-[4/5] overflow-hidden rounded-[12px] border border-[var(--gold-border)] bg-white p-1"
                    >
                      <div className="relative h-full w-full overflow-hidden rounded-[9px]">
                        <Image src={photo} alt={`Galerija ${i + 1}`} fill className="object-cover" sizes="(max-width: 1024px) 30vw, 200px" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Location section ── */}
            <section className="px-4 pb-6 md:px-8 md:pb-10">
              <div
                className="mx-auto w-full max-w-5xl rounded-[26px] border border-[var(--gold-border)] bg-white/75 p-4 md:p-6"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--gold)]">Lokacija</p>
                <h3 className="mt-2 font-serif text-[clamp(28px,6vw,48px)] leading-none text-[var(--dark)]">Gdje slavimo</h3>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[14px] border border-[var(--gold-border)] bg-[var(--cream)] p-4 md:p-5">
                    <p className="font-serif text-[clamp(20px,4vw,26px)] leading-tight text-[var(--dark)]">{event.reception.venue}</p>
                    <p className="mt-2 text-[13px] leading-7 text-[var(--mid)]">{event.reception.address}</p>
                    <p className="mt-3 text-[11px] uppercase tracking-[0.26em] text-[var(--gold)]">{event.reception.time}</p>
                    <a
                      href={event.reception.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block rounded-full border border-[var(--gold)] px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]"
                    >
                      Otvori mapu
                    </a>
                  </div>
                  <div className="overflow-hidden rounded-[14px] border border-[var(--gold-border)]" style={{ minHeight: 240 }}>
                    <iframe
                      src={embedSrc}
                      width="100%"
                      height="100%"
                      style={{ border: 0, minHeight: 240 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Lokacija proslave"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ── RSVP section ── */}
            <section className="px-4 pb-10 md:px-8 md:pb-14">
              <div
                className="mx-auto w-full max-w-5xl rounded-[26px] border border-[var(--gold-border)] bg-white/75 p-4 md:p-6"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--gold)]">RSVP</p>
                <h3 className="mt-2 font-serif text-[clamp(28px,6vw,48px)] leading-none text-[var(--dark)]">Potvrda dolaska</h3>
                <p className="mt-3 text-[13px] text-[var(--mid)]">Molimo odgovorite do {rsvpDeadline}</p>

                {status === "done" ? (
                  <div className="mt-5 rounded-[14px] border border-[var(--gold-border-strong)] bg-[var(--cream)] p-6 text-center">
                    <p className="font-serif text-[34px] text-[var(--gold)]">*</p>
                    <p className="mt-2 font-serif text-[clamp(24px,5vw,30px)] text-[var(--dark)]">Hvala, {name}!</p>
                    <p className="mt-3 text-[14px] text-[var(--mid)]">Vaš odgovor je uspješno sačuvan.</p>
                  </div>
                ) : (
                  <form onSubmit={submitRsvp} className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Ime i prezime</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-[12px] border border-[var(--gold-border-strong)] bg-white px-4 py-3 text-[14px] text-[var(--dark)] outline-none focus:border-[var(--gold)]"
                        placeholder="Unesite ime i prezime"
                      />
                    </div>

                    <div>
                      <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Dolazak</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setAttending("yes")}
                          className={`rounded-[10px] border px-3 py-3 text-[11px] uppercase tracking-[0.2em] transition ${
                            attending === "yes" ? "border-[var(--gold)] bg-[var(--gold-fill)] text-[var(--gold)]" : "border-[var(--gold-border-strong)] text-[var(--mid)]"
                          }`}
                        >
                          Dolazim
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttending("no")}
                          className={`rounded-[10px] border px-3 py-3 text-[11px] uppercase tracking-[0.2em] transition ${
                            attending === "no" ? "border-[var(--gold)] bg-[var(--gold-fill)] text-[var(--gold)]" : "border-[var(--gold-border-strong)] text-[var(--mid)]"
                          }`}
                        >
                          Ne mogu
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Broj gostiju</label>
                      <input
                        type="number"
                        min={1}
                        max={6}
                        value={guests}
                        onChange={(e) => setGuests(Math.min(6, Math.max(1, Number(e.target.value) || 1)))}
                        className="w-full rounded-[12px] border border-[var(--gold-border-strong)] bg-white px-4 py-3 text-[14px] text-[var(--dark)] outline-none focus:border-[var(--gold)]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Poruka (opciono)</label>
                      <textarea
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full resize-none rounded-[12px] border border-[var(--gold-border-strong)] bg-white px-4 py-3 text-[14px] text-[var(--dark)] outline-none focus:border-[var(--gold)]"
                        placeholder="Napišite poruku mladencima"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-2">
                      <p className="text-[12px] text-[var(--mid)]">Potvrdu šaljete direktno mladencima.</p>
                      <button
                        type="submit"
                        disabled={status === "sending" || !name.trim() || attending === null}
                        className="rounded-full border border-[var(--gold)] bg-[var(--gold)] px-6 py-2.5 text-[11px] uppercase tracking-[0.24em] text-white transition hover:bg-[#6a4729] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {status === "sending" ? "Šaljemo..." : "Pošalji"}
                      </button>
                    </div>

                    {status === "error" && (
                      <p className="text-[13px] text-[#b04030] md:col-span-2">Greška pri slanju. Pokušajte ponovo.</p>
                    )}
                  </form>
                )}
              </div>
            </section>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  )
}
