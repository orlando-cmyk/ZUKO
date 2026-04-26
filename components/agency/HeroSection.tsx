'use client'
import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'

function SplitText({ text, delay = 0, className = '' }: { text: string; delay?: number; className?: string }) {
  return (
    <span className={className} style={{ display: 'block', overflow: 'hidden' }}>
      <motion.span
        style={{ display: 'block' }}
        initial={{ y: '105%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {text}
      </motion.span>
    </span>
  )
}

export default function HeroSection() {
  const containerRef = useRef<HTMLElement>(null)
  const rawX = useMotionValue(0.5)
  const rawY = useMotionValue(0.5)
  const parallaxX  = useSpring(useTransform(rawX, [0, 1], [-20,  20]), { stiffness: 40, damping: 20 })
  const parallaxY  = useSpring(useTransform(rawY, [0, 1], [-12,  12]), { stiffness: 40, damping: 20 })
  const orbX = useTransform(parallaxX, v => v * -0.4)
  const orbY = useTransform(parallaxY, v => v * -0.4)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX / window.innerWidth)
      rawY.set(e.clientY / window.innerHeight)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen flex flex-col justify-end overflow-hidden"
      style={{ paddingBottom: '8vh', paddingLeft: '5vw', paddingRight: '5vw' }}
    >
      {/* Grid lines */}
      <motion.div
        style={{ x: parallaxX, y: parallaxY }}
        className="absolute inset-[-10%] pointer-events-none"
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(240,237,232,1) 1px, transparent 1px), linear-gradient(90deg, rgba(240,237,232,1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </motion.div>

      {/* Glow orb */}
      <motion.div
        className="absolute top-[15%] right-[20%] w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(232,255,71,0.06) 0%, transparent 65%)',
          filter: 'blur(60px)',
          x: orbX,
          y: orbY,
        }}
      />

      {/* Year label */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1 }}
        className="absolute top-[88px] right-8 md:right-12 text-[#F0EDE8]/25 text-xs tracking-[0.35em] uppercase"
      >
        Est. 2024
      </motion.span>

      {/* Headline */}
      <div className="relative z-10">
        <h1
          className="font-bold"
          style={{
            fontFamily: 'var(--font-syne)',
            fontSize: 'clamp(3.8rem, 10.5vw, 13rem)',
            color: '#F0EDE8',
            lineHeight: 0.88,
            letterSpacing: '-0.02em',
          }}
        >
          <SplitText text="WE SHAPE" delay={0.2} />
          <SplitText text="DIGITAL" delay={0.38} />
          <span style={{ display: 'block', overflow: 'hidden' }}>
            <motion.span
              style={{ display: 'flex', alignItems: 'baseline', gap: '0.12em' }}
              initial={{ y: '105%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1.1, delay: 0.56, ease: [0.22, 1, 0.36, 1] }}
            >
              CULTURE
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: 'inline-block',
                  width: 'clamp(1.8rem, 3.5vw, 5rem)',
                  height: '0.075em',
                  background: '#E8FF47',
                  transformOrigin: 'left',
                  marginBottom: '0.06em',
                  flexShrink: 0,
                }}
              />
            </motion.span>
          </span>
        </h1>

        <div className="mt-10 flex items-end justify-between gap-8">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, duration: 0.9 }}
            className="text-[#F0EDE8]/40 text-xs tracking-[0.18em] uppercase leading-loose max-w-[220px]"
          >
            Brand · Digital<br />Motion · Development
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9, duration: 0.8 }}
            className="flex flex-col items-center gap-3 text-[#F0EDE8]/30 text-[10px] tracking-[0.3em] uppercase"
          >
            <span>Scroll</span>
            <motion.div
              animate={{ scaleY: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-px h-10 origin-top"
              style={{ background: 'linear-gradient(to bottom, rgba(240,237,232,0.3), transparent)' }}
            />
          </motion.div>
        </div>
      </div>

      {/* Floating index label */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.2, duration: 0.8 }}
        className="absolute left-8 md:left-12 bottom-[10vh] text-[#F0EDE8]/15 text-xs tracking-widest uppercase hidden md:block"
        style={{ writingMode: 'vertical-rl', letterSpacing: '0.3em' }}
      >
        Axiom Studio — 2024
      </motion.div>
    </section>
  )
}
