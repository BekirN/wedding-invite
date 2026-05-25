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
  if (reception.mapsEmbed && reception.mapsEmbed.trim().length > 0) {
    return reception.mapsEmbed
  }

  const fallbackQuery = encodeURIComponent(`${reception.venue}, ${reception.address}`)
  return `https://www.google.com/maps?q=${fallbackQuery}&output=embed`
}

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
    () =>
      new Date(event.weddingDate).toLocaleDateString("sr-Latn-RS", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [event.weddingDate],
  )

  const rsvpDeadline = useMemo(
    () =>
      new Date(event.rsvpDeadline).toLocaleDateString("sr-Latn-RS", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    [event.rsvpDeadline],
  )

  const embedSrc = useMemo(() => getEmbedSrc(event.reception), [event.reception])

  const photos = useMemo(() => {
    const picked = (gallery.length > 0 ? gallery : [heroImage]).slice(0, 6)
    while (picked.length < 6) picked.push(picked[picked.length % Math.max(1, picked.length)])
    return picked
  }, [gallery, heroImage])

  const openEnvelope = () => {
    if (opening || opened) return

    setOpening(true)
    setTimeout(() => {
      setOpened(true)
      setOpening(false)
    }, 900)
  }

  const submitRsvp = async (eventForm: { preventDefault(): void }) => {
    eventForm.preventDefault()
    if (!name.trim() || attending === null) return

    setStatus("sending")

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          attending: attending === "yes",
          plusOnes: attending === "yes" ? Math.max(0, guests - 1) : 0,
          message,
        }),
      })

      setStatus(res.ok ? "done" : "error")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.section
            key="closed-envelope"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,_#fffdf8_0%,_#f7eee2_45%,_#eddfcc_100%)]" />

            <div className="relative z-10 w-full max-w-[560px] text-center">
              <p className="text-[10px] uppercase tracking-[0.52em] text-[var(--gold)]">Pozivnica</p>
              <h1 className="mt-3 font-serif text-[clamp(34px,9vw,62px)] leading-none text-[var(--dark)]">
                {couple.person1.name} <span className="text-[var(--gold)]">&</span> {couple.person2.name}
              </h1>

              <button type="button" onClick={openEnvelope} className="mt-8 w-full cursor-pointer border-none bg-transparent p-0">
                <div className="relative mx-auto h-[320px] w-full max-w-[520px]" style={{ perspective: "1400px" }}>

                  {/* Envelope body — FIRST in DOM so it renders behind everything */}
                  <div
                    className="absolute inset-x-6 bottom-8 top-[80px] rounded-[18px] border border-[var(--gold-border)]"
                    style={{
                      background: "linear-gradient(180deg, #f5e8d7 0%, #e9d4ba 100%)",
                      boxShadow: "var(--shadow-card)",
                    }}
                  />

                  {/* Card with couple names — SECOND in DOM, sits inside envelope */}
                  <motion.div
                    animate={opening ? { y: -64 } : { y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute left-[60px] right-[60px] top-[118px] rounded-[12px] border border-[var(--gold-border)] bg-white/96 px-4 py-4 text-center"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    <p className="font-serif text-[19px] leading-tight text-[var(--dark)]">
                      {couple.person1.name} <span className="text-[var(--gold)]">&</span> {couple.person2.name}
                    </p>
                    <p className="mt-1.5 text-[10px] uppercase tracking-[0.38em] text-[var(--muted)]">Otvori pozivnicu</p>
                  </motion.div>

                  {/* Flap — LAST in DOM so it renders on top and the animation is visible */}
                  <motion.div
                    animate={opening ? { rotateX: -170 } : { rotateX: 0 }}
                    transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute left-[44px] right-[44px] top-[52px] h-[155px] origin-top"
                    style={{
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      background: "linear-gradient(180deg, #d9b88e 0%, #bf9a6f 100%)",
                      boxShadow: "0 10px 24px rgba(28,24,20,0.14)",
                      backfaceVisibility: "hidden",
                      transformStyle: "preserve-3d",
                    }}
                  />
                </div>
              </button>
            </div>
          </motion.section>
        ) : (
          <motion.main
            key="opened-invite"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <section className="relative flex min-h-screen items-center overflow-hidden px-4 py-10 md:px-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#fffdf8_0%,_#f8f0e4_52%,_#f0e3d1_100%)]" />

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
              <div className="absolute left-10 bottom-12 hidden w-[170px] rotate-[6deg] md:block lg:w-[200px]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] border border-[var(--gold-border)] bg-white/90 p-1.5" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="relative h-full w-full overflow-hidden rounded-[12px]"><Image src={photos[2]} alt="Uspomena 3" fill className="object-cover" sizes="200px" /></div>
                </div>
              </div>
              <div className="absolute right-14 bottom-8 hidden w-[160px] rotate-[-7deg] md:block lg:w-[190px]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] border border-[var(--gold-border)] bg-white/90 p-1.5" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="relative h-full w-full overflow-hidden rounded-[12px]"><Image src={photos[3]} alt="Uspomena 4" fill className="object-cover" sizes="190px" /></div>
                </div>
              </div>

              <div className="relative z-10 mx-auto w-full max-w-4xl">
                <div className="rounded-[30px] border border-[var(--gold-border)] bg-[linear-gradient(180deg,#fffdfa_0%,#fff8ef_100%)] p-5 md:p-8" style={{ boxShadow: "var(--shadow-card)" }}>
                  <p className="text-center text-[10px] uppercase tracking-[0.5em] text-[var(--gold)]">Vjencanje</p>
                  <h2 className="mt-3 text-center font-serif text-[clamp(36px,8vw,68px)] leading-none text-[var(--dark)]">
                    {couple.person1.name} <span className="text-[var(--gold)]">&</span> {couple.person2.name}
                  </h2>

                  <p className="mx-auto mt-4 max-w-[720px] text-center text-[14px] leading-7 text-[var(--mid)]">{couple.story}</p>

                  <div className="mt-5 grid grid-cols-3 gap-2 md:gap-3">
                    <div className="rounded-[12px] border border-[var(--gold-border)] bg-[var(--cream)] px-2 py-3 text-center">
                      <p className="font-serif text-[28px] leading-none text-[var(--dark)]">{String(countdown.d).padStart(2, "0")}</p>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.26em] text-[var(--muted)]">Dana</p>
                    </div>
                    <div className="rounded-[12px] border border-[var(--gold-border)] bg-[var(--cream)] px-2 py-3 text-center">
                      <p className="font-serif text-[28px] leading-none text-[var(--dark)]">{String(countdown.h).padStart(2, "0")}</p>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.26em] text-[var(--muted)]">Sati</p>
                    </div>
                    <div className="rounded-[12px] border border-[var(--gold-border)] bg-[var(--cream)] px-2 py-3 text-center">
                      <p className="font-serif text-[28px] leading-none text-[var(--dark)]">{String(countdown.m).padStart(2, "0")}</p>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.26em] text-[var(--muted)]">Min</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_340px]">
                    <div className="rounded-[14px] border border-[var(--gold-border)] bg-white/80 p-4">
                      <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--gold)]">Datum i lokacija</p>
                      <p className="mt-2 text-[13px] capitalize text-[var(--mid)]">{prettyDate}</p>
                      <p className="mt-1 font-serif text-[30px] text-[var(--dark)]">{event.reception.time}</p>
                      <p className="mt-3 font-serif text-[26px] leading-tight text-[var(--dark)]">{event.reception.venue}</p>
                      <p className="mt-2 text-[13px] leading-7 text-[var(--mid)]">{event.reception.address}</p>
                      <a
                        href={event.reception.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block rounded-full border border-[var(--gold)] px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]"
                      >
                        Otvori mapu
                      </a>
                    </div>

                    <div className="mx-auto w-full max-w-[360px]"><MusicPlayer music={music} /></div>
                  </div>

                  <p className="mt-5 text-center text-[10px] uppercase tracking-[0.4em] text-[var(--muted)]">{couple.hashtag}</p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {photos.slice(0, 4).map((photo, index) => (
                    <div key={`${photo}-${index}`} className="relative aspect-[4/5] overflow-hidden rounded-[12px] border border-[var(--gold-border)] bg-white p-1">
                      <div className="relative h-full w-full overflow-hidden rounded-[9px]">
                        <Image src={photo} alt={`Galerija ${index + 1}`} fill className="object-cover" sizes="(max-width: 768px) 44vw, 180px" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="px-4 pb-6 md:px-8 md:pb-10">
              <div className="mx-auto w-full max-w-5xl rounded-[26px] border border-[var(--gold-border)] bg-white/90 p-4 md:p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--gold)]">Lokacija</p>
                <h3 className="mt-2 font-serif text-[clamp(30px,6vw,48px)] leading-none text-[var(--dark)]">Gdje slavimo</h3>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[14px] border border-[var(--gold-border)] bg-[var(--cream)] p-4">
                    <p className="font-serif text-[26px] leading-tight text-[var(--dark)]">{event.reception.venue}</p>
                    <p className="mt-2 text-[13px] leading-7 text-[var(--mid)]">{event.reception.address}</p>
                    <p className="mt-3 text-[11px] uppercase tracking-[0.26em] text-[var(--gold)]">{event.reception.time}</p>
                  </div>

                  <div className="overflow-hidden rounded-[14px] border border-[var(--gold-border)]">
                    <iframe
                      src={embedSrc}
                      width="100%"
                      height="100%"
                      style={{ border: 0, minHeight: 260 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Lokacija proslave"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="px-4 pb-8 md:px-8 md:pb-12">
              <div className="mx-auto w-full max-w-5xl rounded-[26px] border border-[var(--gold-border)] bg-white/90 p-4 md:p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--gold)]">RSVP</p>
                <h3 className="mt-2 font-serif text-[clamp(30px,6vw,48px)] leading-none text-[var(--dark)]">Potvrda dolaska</h3>
                <p className="mt-3 text-[13px] text-[var(--mid)]">Molimo odgovorite do {rsvpDeadline}</p>

                {status === "done" ? (
                  <div className="mt-5 rounded-[14px] border border-[var(--gold-border-strong)] bg-[var(--cream)] p-6 text-center">
                    <p className="font-serif text-[34px] text-[var(--gold)]">*</p>
                    <p className="mt-2 font-serif text-[30px] text-[var(--dark)]">Hvala, {name}!</p>
                    <p className="mt-3 text-[14px] text-[var(--mid)]">Vas odgovor je uspjesno sacuvan.</p>
                  </div>
                ) : (
                  <form onSubmit={submitRsvp} className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Ime i prezime</label>
                      <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="w-full rounded-[12px] border border-[var(--gold-border-strong)] bg-white px-4 py-3 text-[14px] text-[var(--dark)] outline-none"
                        placeholder="Unesite ime i prezime"
                      />
                    </div>

                    <div>
                      <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Dolazak</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setAttending("yes")}
                          className={`rounded-[10px] border px-3 py-2 text-[11px] uppercase tracking-[0.2em] ${
                            attending === "yes"
                              ? "border-[var(--gold)] bg-[var(--gold-fill)] text-[var(--gold)]"
                              : "border-[var(--gold-border-strong)] text-[var(--mid)]"
                          }`}
                        >
                          Dolazim
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttending("no")}
                          className={`rounded-[10px] border px-3 py-2 text-[11px] uppercase tracking-[0.2em] ${
                            attending === "no"
                              ? "border-[var(--gold)] bg-[var(--gold-fill)] text-[var(--gold)]"
                              : "border-[var(--gold-border-strong)] text-[var(--mid)]"
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
                        onChange={(event) => setGuests(Math.min(6, Math.max(1, Number(event.target.value) || 1)))}
                        className="w-full rounded-[12px] border border-[var(--gold-border-strong)] bg-white px-4 py-3 text-[14px] text-[var(--dark)] outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">Poruka (opciono)</label>
                      <textarea
                        rows={3}
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        className="w-full resize-none rounded-[12px] border border-[var(--gold-border-strong)] bg-white px-4 py-3 text-[14px] text-[var(--dark)] outline-none"
                        placeholder="Napisite poruku mladencima"
                      />
                    </div>

                    <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[12px] text-[var(--mid)]">Potvrdu saljete direktno mladencima.</p>
                      <button
                        type="submit"
                        disabled={status === "sending" || !name.trim() || attending === null}
                        className="rounded-full border border-[var(--gold)] bg-[var(--gold)] px-5 py-2 text-[11px] uppercase tracking-[0.24em] text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {status === "sending" ? "Saljemo..." : "Posalji"}
                      </button>
                    </div>

                    {status === "error" ? <p className="md:col-span-2 text-[13px] text-[#b04030]">Greska pri slanju. Pokusajte ponovo.</p> : null}
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
