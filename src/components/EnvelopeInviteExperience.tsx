"use client"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { MusicPlayer } from "@/components/MusicPlayer"

type InviteTab = "gallery" | "details" | "rsvp"

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
  const [tab, setTab] = useState<InviteTab>("gallery")

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
    }, 950)
  }

  const submitRsvp = async (eventForm: FormEvent) => {
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

  const tabButton = (value: InviteTab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(value)}
      className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.24em] transition ${
        tab === value
          ? "border-[var(--gold)] bg-[var(--gold)] text-white"
          : "border-[var(--gold-border-strong)] bg-white/70 text-[var(--mid)]"
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen overflow-hidden bg-[var(--cream)]">
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.section
            key="envelope"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex min-h-screen items-center justify-center px-4"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#fffdf9_0%,_#f7efe4_45%,_#efe1d2_100%)]" />

            <div className="relative z-10 w-full max-w-[560px] text-center">
              <p className="text-[10px] uppercase tracking-[0.55em] text-[var(--gold)]">Pozivnica</p>
              <h1 className="mt-3 font-serif text-[clamp(34px,9vw,58px)] text-[var(--dark)]">
                {couple.person1.name} & {couple.person2.name}
              </h1>

              <button type="button" onClick={openEnvelope} className="mt-8 w-full cursor-pointer border-none bg-transparent p-0">
                <div className="relative mx-auto h-[320px] w-full max-w-[520px]" style={{ perspective: "1300px" }}>
                  <motion.div
                    initial={false}
                    animate={opening ? { y: -42, opacity: 0 } : { y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-x-8 top-[118px] rounded-[14px] border border-[var(--gold-border)] bg-white/90 px-4 py-3 text-[13px] text-[var(--mid)]"
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    Klikni da otvoris kovertu
                  </motion.div>

                  <motion.div
                    initial={false}
                    animate={opening ? { rotateX: -170 } : { rotateX: 0 }}
                    transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute left-[42px] right-[42px] top-[52px] h-[150px] origin-top"
                    style={{
                      clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
                      background: "linear-gradient(180deg, #d9be98 0%, #bf9a6f 100%)",
                      boxShadow: "0 12px 28px rgba(28,24,20,0.16)",
                      transformStyle: "preserve-3d",
                    }}
                  />

                  <div className="absolute inset-x-6 bottom-6 top-[120px] rounded-[18px] border border-[var(--gold-border)] bg-[linear-gradient(180deg,#f5e8d7_0%,#e9d4ba_100%)]" style={{ boxShadow: "var(--shadow-card)" }} />
                </div>
              </button>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="invite"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex min-h-screen items-center justify-center p-4 md:p-6"
          >
            <div className="w-full max-w-6xl rounded-[34px] border border-[var(--gold-border)] bg-white/85 p-4 backdrop-blur-sm md:p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.55em] text-[var(--gold)]">Vjencanje</p>
                  <h2 className="mt-2 font-serif text-[clamp(34px,7vw,64px)] leading-none text-[var(--dark)]">
                    {couple.person1.name} <span className="text-[var(--gold)]">&</span> {couple.person2.name}
                  </h2>
                  <p className="mt-4 max-w-[700px] text-[14px] leading-7 text-[var(--mid)]">{couple.story}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.36em] text-[var(--muted)]">{couple.hashtag}</p>

                  <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                    {photos.slice(0, 6).map((photo, index) => (
                      <div key={`${photo}-${index}`} className="relative aspect-[4/5] overflow-hidden rounded-[14px] border border-[var(--gold-border)] bg-[var(--cream)]">
                        <Image src={photo} alt={`Uspomena ${index + 1}`} fill className="object-cover" sizes="(max-width: 768px) 31vw, 180px" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mx-auto w-full max-w-[360px] lg:max-w-none">
                  <MusicPlayer music={music} />

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-[12px] border border-[var(--gold-border)] bg-[var(--cream)] px-2 py-3 text-center">
                      <p className="font-serif text-[26px] leading-none text-[var(--dark)]">{String(countdown.d).padStart(2, "0")}</p>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.24em] text-[var(--muted)]">Dana</p>
                    </div>
                    <div className="rounded-[12px] border border-[var(--gold-border)] bg-[var(--cream)] px-2 py-3 text-center">
                      <p className="font-serif text-[26px] leading-none text-[var(--dark)]">{String(countdown.h).padStart(2, "0")}</p>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.24em] text-[var(--muted)]">Sati</p>
                    </div>
                    <div className="rounded-[12px] border border-[var(--gold-border)] bg-[var(--cream)] px-2 py-3 text-center">
                      <p className="font-serif text-[26px] leading-none text-[var(--dark)]">{String(countdown.m).padStart(2, "0")}</p>
                      <p className="mt-1 text-[9px] uppercase tracking-[0.24em] text-[var(--muted)]">Min</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {tabButton("gallery", "Galerija")}
                {tabButton("details", "Detalji")}
                {tabButton("rsvp", "RSVP")}
              </div>

              <div className="mt-4 max-h-[42vh] overflow-y-auto rounded-[20px] border border-[var(--gold-border)] bg-white p-4 md:p-5">
                {tab === "gallery" ? (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {photos.map((photo, index) => (
                      <div key={`${photo}-tab-${index}`} className="relative aspect-[4/5] overflow-hidden rounded-[12px] border border-[var(--gold-border)]">
                        <Image src={photo} alt={`Fotografija ${index + 1}`} fill className="object-cover" sizes="(max-width: 768px) 44vw, 240px" />
                      </div>
                    ))}
                  </div>
                ) : null}

                {tab === "details" ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-[14px] border border-[var(--gold-border)] bg-[var(--cream)] p-4">
                      <p className="text-[10px] uppercase tracking-[0.34em] text-[var(--gold)]">Datum i vrijeme</p>
                      <p className="mt-2 font-serif text-[30px] leading-none text-[var(--dark)]">{event.reception.time}</p>
                      <p className="mt-2 text-[13px] capitalize text-[var(--mid)]">{prettyDate}</p>

                      <p className="mt-4 text-[10px] uppercase tracking-[0.34em] text-[var(--gold)]">Lokacija</p>
                      <p className="mt-2 font-serif text-[26px] leading-tight text-[var(--dark)]">{event.reception.venue}</p>
                      <p className="mt-2 text-[13px] leading-7 text-[var(--mid)]">{event.reception.address}</p>

                      <a
                        href={event.reception.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block rounded-full border border-[var(--gold)] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[var(--gold)]"
                      >
                        Otvori mapu
                      </a>
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
                ) : null}

                {tab === "rsvp" ? (
                  status === "done" ? (
                    <div className="rounded-[14px] border border-[var(--gold-border-strong)] bg-[var(--cream)] p-6 text-center">
                      <p className="font-serif text-[34px] text-[var(--gold)]">*</p>
                      <p className="mt-2 font-serif text-[30px] text-[var(--dark)]">Hvala, {name}!</p>
                      <p className="mt-3 text-[14px] text-[var(--mid)]">Vas odgovor je uspjesno sacuvan.</p>
                    </div>
                  ) : (
                    <form onSubmit={submitRsvp} className="grid gap-4 md:grid-cols-2">
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
                              attending === "yes" ? "border-[var(--gold)] bg-[var(--gold-fill)] text-[var(--gold)]" : "border-[var(--gold-border-strong)] text-[var(--mid)]"
                            }`}
                          >
                            Dolazim
                          </button>
                          <button
                            type="button"
                            onClick={() => setAttending("no")}
                            className={`rounded-[10px] border px-3 py-2 text-[11px] uppercase tracking-[0.2em] ${
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
                        <p className="text-[12px] text-[var(--mid)]">Molimo odgovorite do {rsvpDeadline}</p>
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
                  )
                ) : null}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
