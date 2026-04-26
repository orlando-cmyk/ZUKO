'use client'
import { useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'

const PROJECTS = [
  {
    num: '01',
    title: 'Orion',
    category: 'Brand Identity',
    year: '2024',
    bg: '#111116',
    accent: '#E8FF47',
    shape: 'circle',
    desc: 'Complete identity for a deep-space technology startup.',
  },
  {
    num: '02',
    title: 'Helix',
    category: 'Digital Experience',
    year: '2024',
    bg: '#0D0D18',
    accent: '#7B61FF',
    shape: 'spiral',
    desc: 'Immersive web experience for a biotech research firm.',
  },
  {
    num: '03',
    title: 'Vanta',
    category: 'E-Commerce',
    year: '2023',
    bg: '#120A0A',
    accent: '#FF4D00',
    shape: 'square',
    desc: 'Premium fashion platform with 3D product visualisation.',
  },
  {
    num: '04',
    title: 'Studio K',
    category: 'Motion & Film',
    year: '2023',
    bg: '#080E12',
    accent: '#00D4FF',
    shape: 'diamond',
    desc: 'Brand film series for a luxury architecture studio.',
  },
]

function ProjectCard({ p, index }: { p: (typeof PROJECTS)[0]; index: number }) {
  const [hovered, setHovered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-8%' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group"
      data-cursor="project"
    >
      {/* Visual card */}
      <div
        className="relative overflow-hidden mb-5"
        style={{
          height: 'clamp(200px, 28vw, 380px)',
          borderRadius: '3px',
          background: p.bg,
        }}
      >
        {/* Abstract shape */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            animate={{
              rotate: hovered ? 135 : 0,
              borderRadius: p.shape === 'circle' || hovered ? '50%' : p.shape === 'diamond' ? '4px' : '6px',
              scale: hovered ? 1.15 : 1,
            }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: '38%',
              height: '38%',
              border: `1px solid ${p.accent}25`,
              position: 'relative',
              transform: p.shape === 'diamond' ? 'rotate(45deg)' : undefined,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '25%',
                background: p.accent,
                opacity: hovered ? 0.18 : 0.07,
                borderRadius: 'inherit',
                transition: 'opacity 0.5s ease',
              }}
            />
          </motion.div>
        </motion.div>

        {/* Hover tint */}
        <motion.div
          className="absolute inset-0 flex items-end justify-between p-5"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.35 }}
          style={{ background: `linear-gradient(to top, ${p.accent}12, transparent)` }}
        >
          <span
            className="text-[10px] tracking-[0.3em] uppercase font-semibold"
            style={{ color: p.accent }}
          >
            View Project
          </span>
          <span style={{ color: p.accent, fontSize: '1.1rem' }}>↗</span>
        </motion.div>

        {/* Category chip */}
        <div className="absolute top-4 left-4">
          <span
            className="text-[9px] tracking-[0.25em] uppercase px-2.5 py-1 rounded-full"
            style={{
              background: `${p.accent}12`,
              color: p.accent,
              border: `1px solid ${p.accent}25`,
            }}
          >
            {p.category}
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3
            className="font-bold leading-none mb-1.5"
            style={{
              fontFamily: 'var(--font-syne)',
              fontSize: 'clamp(1.2rem, 1.8vw, 1.6rem)',
              color: '#F0EDE8',
            }}
          >
            {p.title}
          </h3>
          <p className="text-[#F0EDE8]/35 text-[13px]">{p.desc}</p>
        </div>
        <span className="text-[#F0EDE8]/18 text-xs font-mono shrink-0 mt-0.5">{p.year}</span>
      </div>
    </motion.div>
  )
}

export default function WorkSection() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  return (
    <section id="work" ref={ref} className="py-40 px-[5vw]">
      {/* Header */}
      <div className="flex items-end justify-between mb-20">
        <div>
          <motion.span
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="block text-[#E8FF47] text-[10px] tracking-[0.5em] uppercase mb-5"
          >
            Selected Work
          </motion.span>

          <div style={{ overflow: 'hidden' }}>
            <motion.h2
              initial={{ y: '105%' }}
              animate={inView ? { y: '0%' } : {}}
              transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-bold"
              style={{
                fontFamily: 'var(--font-syne)',
                fontSize: 'clamp(2rem, 4vw, 4.5rem)',
                color: '#F0EDE8',
                lineHeight: 1,
                letterSpacing: '-0.025em',
              }}
            >
              Our Work
            </motion.h2>
          </div>
        </div>

        <motion.a
          href="#"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="text-[#F0EDE8]/30 text-xs tracking-[0.2em] uppercase hover:text-[#F0EDE8] transition-colors hidden md:block"
        >
          All Projects →
        </motion.a>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-x-8 gap-y-16">
        {PROJECTS.map((p, i) => (
          <ProjectCard key={p.num} p={p} index={i} />
        ))}
      </div>
    </section>
  )
}
