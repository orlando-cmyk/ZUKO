'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const NAV_LINKS = ['Work', 'About', 'Services', 'Contact']

export default function AgencyNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const container = document.getElementById('agency-scroll')
    if (!container) return
    const onScroll = () => setScrolled(container.scrollTop > 60)
    container.addEventListener('scroll', onScroll)
    return () => container.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-[99998] flex items-center justify-between px-8 md:px-12 py-6"
        style={{
          background: scrolled ? 'rgba(10,10,10,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(240,237,232,0.06)' : 'none',
          transition: 'background 0.5s ease, backdrop-filter 0.5s ease, border-color 0.5s ease',
        }}
      >
        <a
          href="/agency"
          className="text-[#F0EDE8] text-sm font-bold tracking-[0.25em] uppercase"
          style={{ fontFamily: 'var(--font-syne)' }}
        >
          AXIOM
        </a>

        <nav className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-[#F0EDE8]/50 text-xs tracking-[0.2em] uppercase transition-colors hover:text-[#F0EDE8]"
              whileHover={{ y: -1 }}
              transition={{ duration: 0.15 }}
            >
              {item}
            </motion.a>
          ))}
        </nav>

        <button
          className="md:hidden flex flex-col gap-[5px] p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block h-px bg-[#F0EDE8]"
              animate={
                menuOpen
                  ? i === 0 ? { rotate: 45,  y: 6, width: 24 }
                  : i === 1 ? { opacity: 0 }
                  :           { rotate: -45, y: -6, width: 24 }
                  : { rotate: 0, y: 0, opacity: 1, width: i === 1 ? 16 : 24 }
              }
              style={{ originX: 0 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </button>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[99997] bg-[#0A0A0A] flex flex-col items-start justify-end pb-16 px-8"
          >
            <div className="space-y-2 w-full">
              {NAV_LINKS.map((item, i) => (
                <div key={item} style={{ overflow: 'hidden' }}>
                  <motion.a
                    href={`#${item.toLowerCase()}`}
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    exit={{ y: '110%' }}
                    transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="block text-[#F0EDE8] font-bold"
                    style={{
                      fontFamily: 'var(--font-syne)',
                      fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                      lineHeight: 1.1,
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item}
                  </motion.a>
                </div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12 text-[#F0EDE8]/30 text-xs tracking-widest uppercase"
            >
              hello@axiom.studio
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
