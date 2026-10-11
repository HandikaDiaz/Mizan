"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"

const INTRO_DURATION = 3200
const INTRO_EXIT_DURATION = 360

let hasSeenIntroInSession = false

type IntroTarget = {
  x: number
  y: number
  scale: number
}

export function BrandIntro() {
  const [visible, setVisible] = React.useState(true)
  const [exiting, setExiting] = React.useState(false)
  const [target, setTarget] = React.useState<IntroTarget | null>(null)
  const [shouldPlay, setShouldPlay] = React.useState(false)
  const introLogoRef = React.useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  React.useLayoutEffect(() => {
    if (hasSeenIntroInSession) {
      return
    }

    hasSeenIntroInSession = true

    const frame = window.requestAnimationFrame(() => setShouldPlay(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  const measureTarget = React.useCallback(() => {
    const introLogo = introLogoRef.current
    const targetLogo = document.querySelector<HTMLElement>(
      "[data-mz-logo-anchor]"
    )

    if (!introLogo || !targetLogo) return

    const introRect = introLogo.getBoundingClientRect()
    const targetRect = targetLogo.getBoundingClientRect()
    const introOverlay = introLogo.closest<HTMLElement>(".mz-intro")
    const introCenterX = introOverlay
      ? introOverlay.getBoundingClientRect().left + introOverlay.clientWidth / 2
      : window.innerWidth / 2
    const introCenterY = introOverlay
      ? introOverlay.getBoundingClientRect().top + introOverlay.clientHeight / 2
      : window.innerHeight / 2

    setTarget({
      x: targetRect.left + targetRect.width / 2 - introCenterX,
      y: targetRect.top + targetRect.height / 2 - introCenterY,
      scale: targetRect.width / introRect.width,
    })
  }, [])

  React.useLayoutEffect(() => {
    if (!shouldPlay) return

    const frame = window.requestAnimationFrame(measureTarget)
    const targetLogo = document.querySelector<HTMLElement>(
      "[data-mz-logo-anchor]"
    )

    window.addEventListener("resize", measureTarget)

    const observer =
      typeof ResizeObserver === "undefined" || !targetLogo
        ? null
        : new ResizeObserver(measureTarget)

    if (observer && targetLogo) observer.observe(targetLogo)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("resize", measureTarget)
      observer?.disconnect()
    }
  }, [measureTarget, shouldPlay])

  React.useEffect(() => {
    if (!shouldPlay || reducedMotion) return

    const exitTimeout = window.setTimeout(
      () => setExiting(true),
      INTRO_DURATION - INTRO_EXIT_DURATION
    )

    return () => window.clearTimeout(exitTimeout)
  }, [reducedMotion, shouldPlay])

  React.useEffect(() => {
    if (!shouldPlay || !exiting) return

    const removeTimeout = window.setTimeout(
      () => setVisible(false),
      INTRO_EXIT_DURATION
    )

    return () => window.clearTimeout(removeTimeout)
  }, [exiting, shouldPlay])

  if (!shouldPlay || !visible || reducedMotion) return null

  return (
    <motion.div
      className="mz-intro"
      role="status"
      aria-label="Memuat Mizan"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: INTRO_EXIT_DURATION / 1000, ease: "easeOut" }}
    >
      <motion.div
        ref={introLogoRef}
        className="mz-intro-logo"
        initial={{ opacity: 0, scale: 1, x: 0, y: 0 }}
        animate={
          target
            ? {
                opacity: [0, 1, 1, 1],
                scale: [1, 1, 1, target.scale],
                x: [0, 0, 0, target.x],
                y: [0, 0, 0, target.y],
              }
            : { opacity: 1, scale: 1, x: 0, y: 0 }
        }
        transition={
          target
            ? {
                duration: 2.5,
                times: [0, 0.1, 0.48, 1],
                ease: ["easeOut", "linear", "easeInOut"],
              }
            : { duration: 0.25, ease: "easeOut" }
        }
      >
        <Image
          src="/Primary-Logo.png"
          alt="Mizan"
          className="mz-intro-logo__image bg-transparent"
          width={1200}
          height={400}
          priority
          sizes="360px"
        />
      </motion.div>
    </motion.div>
  )
}
