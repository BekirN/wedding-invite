"use client"
import { FormEvent, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const E = [0.22, 1, 0.36, 1] as const
const VP = { once: true, margin: "-60px" }

const inputClass =
  "w-full rounded-none border-0 border-b border-[rgba(122,85,53,0.28)] bg-transparent px-0 py-3 text-[14px] text-[var(--dark)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--gold)]"

export function RsvpSection({ rsvpDeadline }: { rsvpDeadline: string }) {
  const [attending, setAttending] = useState<"yes" | "no" | null>(null)
  const [name, setName] = useState("")
  const [guests, setGuests] = useState(1)
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle")

  const ready = name.trim().length > 1 && attending !== null

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!ready) return

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

  const deadline = new Date(rsvpDeadline).toLocaleDateString("sr-Latn-RS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <section
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6 py-20"
      style={{ scrollSnapAlign: "start", background: "linear-gradient(180deg, var(--white) 0%, #f8f3ec 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: E }}
        viewport={VP}
        className="w-full max-w-2xl rounded-[34px] border border-[var(--gold-border)] bg-white/90 p-7 backdrop-blur-sm md:p-10"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.58em] text-[var(--gold)]">RSVP</p>
          <h2 className="mt-4 font-serif text-[clamp(34px,7vw,56px)] leading-none text-[var(--dark)]">Potvrda dolaska</h2>
          <p className="mt-4 text-[13px] text-[var(--mid)]">Molimo odgovor najkasnije do {deadline}</p>
        </div>

        <AnimatePresence mode="wait">
          {status === "done" ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: E }}
              className="mt-10 rounded-[24px] border border-[var(--gold-border-strong)] bg-[var(--cream)] px-6 py-10 text-center"
            >
              <p className="font-serif text-[36px] text-[var(--gold)]">*</p>
              <p className="mt-2 font-serif text-[32px] leading-tight text-[var(--dark)]">
                {attending === "yes" ? `Hvala, ${name}!` : `Hvala na odgovoru, ${name}.`}
              </p>
              <p className="mt-3 text-[14px] text-[var(--mid)]">
                {attending === "yes" ? "Jedva čekamo da slavimo zajedno." : "Bićete u našim mislima tog dana."}
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={submit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mt-10 space-y-7"
            >
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.36em] text-[var(--muted)]">Ime i prezime</label>
                <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ime i prezime" />
              </div>

              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.36em] text-[var(--muted)]">Dolazak</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAttending("yes")}
                    className={`rounded-[14px] border px-4 py-3 text-[11px] uppercase tracking-[0.26em] transition ${
                      attending === "yes"
                        ? "border-[var(--gold)] bg-[var(--gold-fill)] text-[var(--gold)]"
                        : "border-[var(--gold-border-strong)] text-[var(--mid)]"
                    }`}
                  >
                    Da, dolazim
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttending("no")}
                    className={`rounded-[14px] border px-4 py-3 text-[11px] uppercase tracking-[0.26em] transition ${
                      attending === "no"
                        ? "border-[var(--gold)] bg-[var(--gold-fill)] text-[var(--gold)]"
                        : "border-[var(--gold-border-strong)] text-[var(--mid)]"
                    }`}
                  >
                    Nažalost ne
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {attending === "yes" ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28, ease: E }}
                  >
                    <label className="mb-2 block text-[10px] uppercase tracking-[0.36em] text-[var(--muted)]">Broj gostiju (uključujući tebe)</label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={guests}
                      onChange={(event) => setGuests(Math.min(6, Math.max(1, Number(event.target.value) || 1)))}
                      className={inputClass}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.36em] text-[var(--muted)]">Poruka (opciono)</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Vaša poruka..."
                  className={`${inputClass} resize-none leading-7`}
                />
              </div>

              <button
                type="submit"
                disabled={!ready || status === "sending"}
                className={`w-full rounded-[14px] border px-5 py-4 text-[11px] uppercase tracking-[0.36em] transition ${
                  ready && status !== "sending"
                    ? "border-[var(--gold)] bg-[var(--gold)] text-white hover:bg-[#6a4729]"
                    : "border-[var(--gold-border-strong)] text-[var(--mid)]"
                }`}
              >
                {status === "sending" ? "Šaljemo..." : "Pošalji potvrdu"}
              </button>

              {status === "error" ? <p className="text-center text-[13px] text-[#b04030]">Došlo je do greške. Pokušaj ponovo.</p> : null}
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  )
}
