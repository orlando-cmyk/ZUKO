'use client'
import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'motion/react'

const STATS = [
  { num: '120+', label: 'Projects Delivered' },
  { num: '8',    label: 'Years of Precision' },
  { num: '40+',  label: 'Global Clients' },
]

export default function AboutSection() {
  const ref     = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-15%' })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const bgNum = useTransform(scrollYProgress, [0, 1], [80, -80])

  return (
    <section
      id="about"
      ref={ref}
      className="relative py-40 px-[5vw] overflow-hidden"
    >
      {/* Ghost number */}
      <motion.div
        className="absolute -left-4 top-1/2 -translate-y-1/2 select-none pointer-events-none leading-none font-bold text-[#F0EDE8]"
        style={{
          fontSize: 'clamp(12rem, 30vw, 28rem)',
          opacity: 0.02,
          fontFamily: 'var(--font-syne)',
          y: bgNum,
        }}
      >
        01
      </motion.div>

      <div className="relative z-10 grid md:grid-cols-2 gap-24 items-center">
        {/* Left — text */}
        <div>
          <motion.span
            initial={{ opacity: 0, x: -16 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="block text-[#E8FF47] text-[10px] tracking-[0.5em] uppercase mb-6"
          >
            About Axiom
          </motion.span>

          <h2
            className="font-bold mb-8"
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: 'clamp(2.2rem, 4.5vw, 5rem)',
              color: '#F0EDE8',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
            }}
          >
            {['Not an agency.', 'An obsession.'].map((line, i) => (
              <div key={i} style={{ overflow: 'hidden' }}>
                <motion.div
                  initial={{ y: '105%' }}
                  animate={isInView ? { y: '0%' } : {}}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}
                >
                  {line}
                </motion.div>
              </div>
            ))}
          </h2>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-px bg-[#F0EDE8]/12 mb-8 origin-left"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-[#F0EDE8]/45 leading-[1.85] text-[15px] max-w-sm"
          >
            We are a collective of designers, developers, and strategists who believe the gap between art and technology is where culture is made. We don't build brands — we build belief systems.
          </motion.p>

          <motion.a
            href="#work"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
            className="inline-flex items-center gap-3 mt-10 text-[#F0EDE8]/40 text-xs tracking-[0.2em] uppercase hover:text-[#E8FF47] transition-colors duration-300 group"
          >
            See our work
            <motion.span
              className="inline-block"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              →
            </motion.span>
          </motion.a>
        </div>

        {/* Right — stats */}
        <div className="space-y-0">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.num}
              initial={{ opacity: 0, x: 24 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.25 + i * 0.1 }}
              className="border-b border-[#F0EDE8]/08 py-10 last:border-0 first:border-t first:border-[#F0EDE8]/08"
            >
              <div
                className="font-bold leading-none"
                style={{
                  fontFamily: 'var(--font-syne)',
                  fontSize: 'clamp(3rem, 5.5vw, 5.5rem)',
                  color: '#F0EDE8',
                }}
              >
                {stat.num}
              </div>
              <div className="text-[#F0EDE8]/35 text-[10px] tracking-[0.35em] uppercase mt-2">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
