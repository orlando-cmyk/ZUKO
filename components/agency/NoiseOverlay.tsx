export default function NoiseOverlay() {
  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none z-[99990]"
      style={{ opacity: 0.035, mixBlendMode: 'overlay' }}
      aria-hidden="true"
    >
      <filter id="agency-noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.72"
          numOctaves="4"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#agency-noise)" />
    </svg>
  )
}
