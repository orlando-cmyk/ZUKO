import { useEffect, useState } from 'react'

export function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < bp)
    fn()
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [bp])
  return mobile
}
