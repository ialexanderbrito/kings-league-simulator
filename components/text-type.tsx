"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion, useInView } from "motion/react"

import { cn } from "@/lib/utils"

interface TypingAnimationProps {
  children?: string
  words?: string[]
  className?: string
  typeSpeed?: number
  deleteSpeed?: number
  delay?: number
  pauseDelay?: number
  loop?: boolean
  startOnView?: boolean
  showCursor?: boolean
  blinkCursor?: boolean
  cursorStyle?: "line" | "block" | "underscore"
}

export function TypingAnimation({
  children,
  words,
  className,
  typeSpeed = 80,
  deleteSpeed = 40,
  delay = 0,
  pauseDelay = 1500,
  loop = true,
  startOnView = false,
  showCursor = true,
  blinkCursor = true,
  cursorStyle = "line",
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)

  const elementRef = useRef<HTMLSpanElement>(null)
  const isInView = useInView(elementRef, { amount: 0.3, once: true })

  const wordsArray = words || (children ? [children] : [])
  const shouldAnimate = startOnView ? isInView : true

  const getCursorChar = useCallback(() => {
    switch (cursorStyle) {
      case "block":
        return "▌"
      case "underscore":
        return "_"
      default:
        return "|"
    }
  }, [cursorStyle])

  useEffect(() => {
    if (!shouldAnimate || wordsArray.length === 0) return

    // Delay inicial
    if (!hasStarted) {
      const initialDelay = setTimeout(() => {
        setHasStarted(true)
      }, delay)
      return () => clearTimeout(initialDelay)
    }

    const currentWord = wordsArray[wordIndex]

    // Se estiver esperando (pausa após completar a palavra)
    if (isWaiting) {
      const waitTimeout = setTimeout(() => {
        setIsWaiting(false)
        setIsDeleting(true)
      }, pauseDelay)
      return () => clearTimeout(waitTimeout)
    }

    // Digitando
    if (!isDeleting) {
      if (displayedText.length < currentWord.length) {
        const typeTimeout = setTimeout(() => {
          setDisplayedText(currentWord.slice(0, displayedText.length + 1))
        }, typeSpeed)
        return () => clearTimeout(typeTimeout)
      } else {
        // Palavra completa
        if (wordsArray.length === 1 && !loop) {
          // Apenas uma palavra e sem loop - para aqui
          return
        }
        setIsWaiting(true)
      }
    }
    // Deletando
    else {
      if (displayedText.length > 0) {
        const deleteTimeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1))
        }, deleteSpeed)
        return () => clearTimeout(deleteTimeout)
      } else {
        // Deletou tudo, próxima palavra
        setIsDeleting(false)
        const nextIndex = (wordIndex + 1) % wordsArray.length
        setWordIndex(nextIndex)
      }
    }
  }, [
    shouldAnimate,
    hasStarted,
    displayedText,
    wordIndex,
    isDeleting,
    isWaiting,
    wordsArray,
    typeSpeed,
    deleteSpeed,
    pauseDelay,
    delay,
    loop,
  ])

  const isComplete =
    !loop &&
    wordsArray.length === 1 &&
    displayedText === wordsArray[0]

  const shouldShowCursor = showCursor && !isComplete

  return (
    <motion.span
      ref={elementRef}
      className={cn("leading-[5rem] tracking-[-0.02em]", className)}
    >
      {displayedText}
      {shouldShowCursor && (
        <span
          className={cn(
            "inline-block ml-1",
            blinkCursor && "animate-pulse"
          )}
        >
          {getCursorChar()}
        </span>
      )}
    </motion.span>
  )
}
