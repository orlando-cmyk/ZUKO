'use client'
import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  const ringX = useSpring(mouseX, { stiffness: 180, damping: 22 })
  const ringY = useSpring(mouseY, { stiffness: 180, damping: 22 })
  const dotX  = useSpring(mouseX, { stiffness: 700, damping: 32 })
  const dotY  = useSpring(mouseY, { stiffness: 700, damping: 32 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!isVisible) setIsVisible(true)
    }

    const onEnter = () => setIsHovering(true)
    const onLeave = () => setIsHovering(false)

    window.addEventListener('mousemove', onMove)

    const targets = document.querySelectorAll('a, button, [data-cursor]')
    targets.forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    return () => {
      window.removeEventListener('mousemove', onMove)
      targets.forEach(el => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [isVisible])

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[99999] rounded-full border border-[#F0EDE8]"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width:   isHovering ? 52 : 28,
          height:  isHovering ? 52 : 28,
          opacity: isVisible  ? 1  : 0,
          borderColor: isHovering ? '#E8FF47' : 'rgba(240,237,232,0.5)',
        }}
        transition={{ width: { duration: 0.2 }, height: { duration: 0.2 } }}
      />
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[99999] rounded-full bg-[#F0EDE8]"
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width:   isHovering ? 4 : 4,
          height:  isHovering ? 4 : 4,
          opacity: isVisible  ? 1 : 0,
          background: isHovering ? '#E8FF47' : '#F0EDE8',
        }}
      />
    </>
  )
}
