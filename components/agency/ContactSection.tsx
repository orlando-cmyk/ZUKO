'use client'
import { useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'

function MagneticCTA({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect()
    setPos({ x: (e.clientX - (r.left + r.width / 2)) * 0.28, y: (e.clientY - (r.top + r.height / 2)) * 0.28 })
  }

  return (
    <motion.a
      ref={ref}
      href="mailto:hello@axiom.studio"
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      whileHover={{ backgroundColor: '#E8FF47', borderColor: '#E8FF47', color: '#0A0A0A' }}
      className="inline-flex items-center gap-3 px-9 py-4 border border-[#F0EDE8]/20 text-[#F0EDE8] text-xs tracking-[0.25em] uppercase rounded-full transition-colors duration-300"
      style={{ fontFamily: 'var(--font-syne)' }}
    >
      {children}
    </motion.a>
  )
}

const SOCIALS = ['Instagram', 'Twitter', 'LinkedIn', 'Dribbble']

export default function ContactSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  return (
    <section id="contact" ref={ref} className="relative pt-40 pb-16 px-[5vw] overflow-hidden">
      {/* Glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70vw] h-[55vh] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(232,255,71,0.05) 0%, transparent 68%)',
          filter: 'blur(50px)',
        }}
      />

      <div className="relative z-10 text-center">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="block text-[#E8FF47] text-[10px] tracking-[0.5em] uppercase mb-8"
        >
          Get in touch
        </motion.span>

        <div style={{ overflow: 'hidden' }}>
          <motion.h2
            initial={{ y: '105%' }}
            animate={inView ? { y: '0%' } : {}}
            transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-bold"
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: 'clamp(3.5rem, 9vw, 10rem)',
              color: '#F0EDE8',
              lineHeight: 0.93,
              letterSpacing: '-0.03em',
            }}
          >
            Let's talk.
          </motion.h2>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="text-[#F0EDE8]/38 text-[15px] leading-[1.85] max-w-sm mx-auto mt-8 mb-12"
        >
          Got a project, a vision, or an obsession you can't shake? We want to hear all of it.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.55, duration: 0.8 }}
          className="flex flex-col md:flex-row items-center justify-center gap-5"
        >
          <MagneticCTA>Start a project →</MagneticCTA>

          <a
            href="mailto:hello@axiom.studio"
            className="text-[#F0EDE8]/32 text-xs tracking-[0.2em] hover:text-[#F0EDE8] transition-colors duration-300"
          >
            hello@axiom.studio
          </a>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.9, duration: 1 }}
        className="relative z-10 mt-40 pt-8 border-t border-[#F0EDE8]/06 flex flex-col md:flex-row items-center justify-between gap-6 text-[#F0EDE8]/20 text-[10px] tracking-[0.28em] uppercase"
      >
        <span>© 2024 Axiom Studio — All rights reserved</span>

        <div className="flex items-center gap-8">
          {SOCIALS.map((s) => (
            <a
              key={s}
              href="#"
              className="hover:text-[#F0EDE8] transition-colors duration-300"
            >
              {s}
            </a>
          ))}
        </div>
      </motion.footer>
    </section>
  )
}
