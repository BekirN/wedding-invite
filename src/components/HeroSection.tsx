"use client"
import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { RefObject } from "react"
import { MusicPlayer } from "@/components/MusicPlayer"

interface CouplePerson {
  name: string
  lastName: string
}

interface Props {
  couple: {
    person1: CouplePerson
    person2: CouplePerson
    story: string
    hashtag: string
  }
  heroImage: string
  gallery: string[]
  music: { title: string; artist: string; src: string }
  containerRef: RefObject<HTMLDivElement | null>
}

const E = [0.22, 1, 0.36, 1] as const

const collageLayout = [
  "left-2 top-4 w-[170px] -rotate-[8deg]",
  "right-4 top-10 w-[190px] rotate-[7deg]",
  "left-16 bottom-7 w-[170px] rotate-[5deg]",
  "right-18 bottom-3 w-[180px] -rotate-[7deg]",
  "left-1/2 top-2 w-[150px] -translate-x-1/2 rotate-[3deg]",
]

function CollagePhoto({ src, alt, className, delay }: { src: string; alt: string; className: string; delay: number }) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: E }}
      className={`absolute hidden md:block ${className}`}
    >
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-[22px] border border-[var(--gold-border-strong)] bg-white/70 p-2"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[14px]">
          <Image src={src} alt={alt} fill className="object-cover" sizes="190px" />
        </div>
      </div>
    </motion.figure>
  )
}

export function HeroSection({ couple, heroImage, gallery, music, containerRef }: Props) {
  const { scrollYProgress } = useScroll({ container: containerRef })

  const bgY = useTransform(scrollYProgress, [0, 0.25], ["0%", "18%"])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.4])

  const scrollNext = () => {
    const container = containerRef.current
    if (!container) return

    container.scrollTo({
      top: container.scrollTop + container.clientHeight,
      behavior: "smooth",
    })
  }

  const heroPhotos = (gallery.length > 0 ? gallery : [heroImage]).slice(0, 5)
  while (heroPhotos.length < 5) {
    heroPhotos.push(heroPhotos[heroPhotos.length % Math.max(1, heroPhotos.length)])
  }

  return (
    <section className="relative flex min-h-screen w-full items-center overflow-hidden" style={{ scrollSnapAlign: "start" }}>
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})`, y: bgY, scale: 1.08 }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse at 50% 22%, rgba(250,247,242,0.9) 0%, rgba(250,247,242,0.54) 44%, rgba(250,247,242,0.12) 75%)",
            "linear-gradient(180deg, rgba(250,247,242,0.2) 0%, rgba(250,247,242,0.85) 64%, rgba(250,247,242,0.98) 100%)",
          ].join(", "),
        }}
      />

      <motion.div style={{ opacity: contentOpacity }} className="relative z-10 mx-auto w-full max-w-6xl px-6 py-12">
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: E }}
            className="text-[10px] uppercase tracking-[0.6em] text-[var(--gold)]"
          >
            Pozivnica za vjencanje
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.18, ease: E }}
            className="mt-4 font-serif text-[clamp(46px,11vw,92px)] leading-none text-[var(--dark)]"
          >
            {couple.person1.name} <span className="text-[var(--gold)]">&</span> {couple.person2.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: E }}
            className="mx-auto mt-4 max-w-[700px] text-[13px] leading-7 text-[var(--mid)]"
          >
            {couple.story}
          </motion.p>
        </div>

        <div className="mt-8 md:hidden">
          <div className="grid grid-cols-2 gap-3">
            {heroPhotos.slice(0, 4).map((photo, index) => (
              <motion.div
                key={`${photo}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 + index * 0.08, ease: E }}
                className="relative aspect-[4/5] overflow-hidden rounded-[18px] border border-[var(--gold-border-strong)] bg-white/70 p-1.5"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-[12px]">
                  <Image src={photo} alt={`Uspomena ${index + 1}`} fill className="object-cover" sizes="(max-width: 768px) 46vw, 220px" />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.42, ease: E }}
            className="mx-auto mt-5 max-w-[360px]"
          >
            <MusicPlayer music={music} />
          </motion.div>
        </div>

        <div className="relative mt-8 hidden min-h-[460px] md:block">
          {heroPhotos.map((photo, index) => (
            <CollagePhoto key={`${photo}-${index}`} src={photo} alt={`Uspomena ${index + 1}`} className={collageLayout[index]} delay={0.26 + index * 0.09} />
          ))}

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.48, ease: E }}
            className="absolute left-1/2 top-1/2 z-20 w-full max-w-[380px] -translate-x-1/2 -translate-y-1/2"
          >
            <MusicPlayer music={music} />
          </motion.div>
        </div>

        <p className="mt-5 text-center text-[10px] uppercase tracking-[0.5em] text-[var(--muted)]">{couple.hashtag}</p>

        <motion.button
          type="button"
          onClick={scrollNext}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.7 }}
          className="mx-auto mt-6 flex flex-col items-center gap-2 border-none bg-transparent text-[var(--mid)]"
        >
          <span className="text-[10px] uppercase tracking-[0.38em]">Skroluj dalje</span>
          <motion.span animate={{ y: [0, 7, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.span>
        </motion.button>
      </motion.div>
    </section>
  )
}
