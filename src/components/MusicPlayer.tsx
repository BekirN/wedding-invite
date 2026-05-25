"use client"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface Props {
  music: { title: string; artist: string; src: string }
}

const E = [0.22, 1, 0.36, 1] as const

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${String(secs).padStart(2, "0")}`
}

export function MusicPlayer({ music }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTime = () => {
      setCurrentTime(audio.currentTime)
      setDuration(audio.duration || 0)
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0)
    }

    const onEnded = () => {
      setPlaying(false)
      setProgress(0)
      setCurrentTime(0)
    }

    const onLoaded = () => {
      setDuration(audio.duration || 0)
    }

    audio.addEventListener("timeupdate", onTime)
    audio.addEventListener("ended", onEnded)
    audio.addEventListener("loadedmetadata", onLoaded)

    return () => {
      audio.removeEventListener("timeupdate", onTime)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("loadedmetadata", onLoaded)
    }
  }, [])

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
      setPlaying(false)
      return
    }

    try {
      await audio.play()
      setPlaying(true)
    } catch {
      setPlaying(false)
    }
  }

  const seek = (value: number) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return

    const nextTime = (value / 100) * audio.duration
    audio.currentTime = nextTime
    setProgress(value)
    setCurrentTime(nextTime)
  }

  return (
    <div
      className="w-full max-w-[360px] rounded-[30px] border border-[var(--gold-border)] bg-white/80 p-5 backdrop-blur-sm"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <audio ref={audioRef} src={music.src} loop preload="metadata" />

      <div className="flex items-center gap-4">
        <motion.button
          onClick={toggle}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="relative h-[84px] w-[84px] shrink-0 rounded-full border border-[var(--gold-border-strong)] bg-[#1f1a15]"
          type="button"
        >
          <motion.div
            className="absolute inset-0 m-2 rounded-full border border-white/10"
            animate={playing ? { rotate: 360 } : { rotate: 0 }}
            transition={playing ? { duration: 3.5, ease: "linear", repeat: Infinity } : { duration: 0.3, ease: E }}
          />
          <div className="absolute inset-0 m-auto h-8 w-8 rounded-full border border-[var(--gold-border-strong)] bg-[var(--cream)]" />
          <div className="absolute inset-0 grid place-items-center text-[var(--gold)]">
            {playing ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5.14v14l11-7-11-7z" />
              </svg>
            )}
          </div>
        </motion.button>

        <div className="min-w-0 flex-1">
          <p className="font-serif text-[22px] leading-tight text-[var(--dark)]">{music.title}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.32em] text-[var(--muted)]">{music.artist}</p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--mid)]">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={(event) => seek(Number(event.target.value))}
          className="w-full accent-[var(--gold)]"
          aria-label="Music progress"
        />
      </div>

      <p className="mt-3 text-center text-[10px] uppercase tracking-[0.26em] text-[var(--muted)]">
        {playing ? "Pušta naša pjesma" : "Klikni i pusti muziku"}
      </p>
    </div>
  )
}
