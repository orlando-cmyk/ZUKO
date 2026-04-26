'use client'
import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'motion/react'

const SERVICES = [
  {
    num: '01',
    title: 'Brand Strategy',
    description:
      'We build identities that outlast trends. From naming to visual systems, we craft brands that people actually believe in — not just recognise.',
    tags: ['Identity', 'Naming', 'Visual Systems', 'Guidelines'],
  },
  {
    num: '02',
    title: 'Digital Experiences',
    description:
      'Web platforms, apps, and interactive installations designed to make people feel something. We treat the browser as a canvas.',
    tags: ['UI/UX Design', 'Web Apps', 'Interaction', 'AR/VR'],
  },
  {
    num: '03',
    title: 'Motion & Film',
    description:
      'Still images are a starting point. We bring brands to life through motion — from product teasers to full campaign films.',
    tags: ['Animation', 'Brand Films', 'Motion Design', 'VFX'],
  },
  {
    num: '04',
    title: 'Web Development',
    description:
      'Bespoke, performant, and built to last. We engineer digital products that are as robust as they are beautiful, using cutting-edge web tech.',
    tags: ['React / Next.js', 'Three.js / WebGL', 'Performance', 'CMS'],
  },
]

export default function ServicesSection() {
  const [active, setActive] = useState<number | null>(null)
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-10%' })

  return (
    <section id="services" ref={ref} className="py-40 px-[5vw]">
      {/* Header */}
      <div className="flex items-end justify-between mb-20">
        <div>
          <motion.span
            initial={{ opacity: 0, x: -16 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="block text-[#E8FF47] text-[10px] tracking-[0.5em] uppercase mb-5"
          >
            Services
          </motion.span>

          <div style={{ overflow: 'hidden' }}>
            <motion.h2
              initial={{ y: '105%' }}
              animate={isInView ? { y: '0%' } : {}}
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
              What We Do
            </motion.h2>
          </div>
        </div>

        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="text-[#F0EDE8]/20 text-xs tracking-[0.3em] uppercase hidden md:block"
        >
          — 04 disciplines
        </motion.span>
      </div>

      {/* List */}
      <div>
        {SERVICES.map((svc, i) => (
          <motion.div
            key={svc.num}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 + i * 0.09 }}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className="border-t border-[#F0EDE8]/08 last:border-b last:border-[#F0EDE8]/08 group"
          >
            <div className="flex items-center justify-between py-7 md:py-9 gap-6">
              <div className="flex items-center gap-6 md:gap-10 min-w-0">
                <span
                  className="text-[#F0EDE8]/18 text-xs font-mono tracking-widest shrink-0 hidden md:block"
                >
                  {svc.num}
                </span>

                <motion.h3
                  className="font-bold truncate"
                  animate={{ color: active === i ? '#E8FF47' : '#F0EDE8' }}
                  transition={{ duration: 0.25 }}
                  style={{
                    fontFamily: 'var(--font-syne)',
                    fontSize: 'clamp(1.4rem, 2.8vw, 2.6rem)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                  }}
                >
                  {svc.title}
                </motion.h3>
              </div>

              <motion.span
                animate={{
                  rotate: active === i ? 45 : 0,
                  color: active === i ? '#E8FF47' : 'rgba(240,237,232,0.3)',
                }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-light leading-none shrink-0"
              >
                +
              </motion.span>
            </div>

            <AnimatePresence>
              {active === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="pb-10 pl-0 md:pl-[calc(2.8rem+2.5rem)]">
                    <p className="text-[#F0EDE8]/45 text-[15px] leading-[1.9] mb-6 max-w-xl">
                      {svc.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {svc.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] tracking-[0.2em] uppercase px-3 py-1.5 rounded-full text-[#F0EDE8]/35"
                          style={{ border: '1px solid rgba(240,237,232,0.1)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
