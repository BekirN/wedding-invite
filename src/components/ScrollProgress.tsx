"use client"
import { motion, useScroll, useSpring } from "framer-motion"
import { RefObject } from "react"

export function ScrollProgress({ containerRef }: { containerRef: RefObject<HTMLDivElement | null> }) {
  const { scrollYProgress } = useScroll({ container: containerRef })
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 100,
        background: "rgba(160,120,80,0.1)",
        pointerEvents: "none",
      }}
    >
      <motion.div
        style={{
          height: "100%",
          background: "linear-gradient(to right, var(--gold-light), var(--gold))",
          transformOrigin: "left",
          scaleX,
        }}
      />
    </div>
  )
}
