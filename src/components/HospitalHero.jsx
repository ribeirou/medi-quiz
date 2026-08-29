import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function HospitalHero({ onEnter }) {
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const wrapperRef = useRef(null)
  const stageRef = useRef(null)
  const videoRef = useRef(null)
  const titleRef = useRef(null)
  const scrollHintRef = useRef(null)
  const enteredRef = useRef(false)
  const stRef = useRef(null)
  const [ready, setReady] = useState(false)

  function enter() {
    if (enteredRef.current) return
    enteredRef.current = true
    stRef.current?.kill()

    const stage = stageRef.current
    if (!stage) {
      onEnter()
      return
    }

    gsap.to(stage, {
      scale: 1.6,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in',
      onComplete: onEnter,
    })
  }

  // Ambient looping video: plays for everyone, including reduced-motion —
  // it's a static-camera clip (no pan/zoom/parallax), not the kind of
  // motion prefers-reduced-motion is meant to suppress.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    function onLoaded() {
      setReady(true)
      video.play().catch(() => {})
    }
    video.addEventListener('loadedmetadata', onLoaded)
    return () => video.removeEventListener('loadedmetadata', onLoaded)
  }, [])

  // Scroll-hijacking pin/scrub is the disruptive motion — skip it under
  // reduced-motion, users get the plain "Começar" button instead.
  useEffect(() => {
    if (reducedMotion) return

    stRef.current = ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: 'top top',
      end: '+=1500',
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        gsap.to(titleRef.current, { opacity: self.progress > 0.55 ? 0 : 1, duration: 0.2, overwrite: true })
        gsap.to(scrollHintRef.current, { opacity: self.progress > 0.15 ? 0 : 1, duration: 0.2, overwrite: true })
      },
      onLeave: enter,
    })

    return () => stRef.current?.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion])

  return (
    <div ref={wrapperRef} className="relative" style={reducedMotion ? undefined : { height: '250vh' }}>
      <div
        ref={stageRef}
        className={`${reducedMotion ? 'relative' : 'sticky top-0'} h-screen w-full overflow-hidden bg-slate-950 origin-center`}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/hospital-hallway.mp4"
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/70" />

        {!reducedMotion && (
          <button
            onClick={enter}
            className="absolute top-4 right-4 z-10 text-xs font-medium text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur px-3 py-1.5 rounded-full border border-white/20 transition-colors cursor-pointer"
          >
            Pular introdução
          </button>
        )}

        <div
          ref={titleRef}
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4"
          style={{ opacity: reducedMotion || ready ? 1 : 0, transition: 'opacity 0.6s ease' }}
        >
          <span className="text-xs font-semibold tracking-widest uppercase text-blue-300 mb-3">
            Medicina · USCS
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight max-w-2xl">
            Bem-vinda ao Medi Quiz
          </h1>
          <p className="mt-4 text-slate-200 max-w-md">
            Cada porta que se abre é uma matéria a menos entre você e a prova.
          </p>
          {reducedMotion && (
            <button
              onClick={enter}
              className="mt-8 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors cursor-pointer"
            >
              Começar
            </button>
          )}
        </div>

        {!reducedMotion && (
          <div
            ref={scrollHintRef}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/80"
          >
            <span className="text-xs font-medium tracking-wide uppercase">Role para entrar</span>
            <span className="text-lg animate-bounce" aria-hidden="true">
              ↓
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
