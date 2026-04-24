'use client'

export type CrocMood = 'idle' | 'happy' | 'angry' | 'proud' | 'sleep'

interface Props {
  mood: CrocMood
  size?: number
  onClick?: () => void
}

export default function CrocMascot({ mood, size = 48, onClick }: Props) {
  const s = size

  // Expresiones de ojos/cejas/boca según mood
  const eyeClosed = mood === 'sleep'
  const browsAngry = mood === 'angry'
  const browsHappy = mood === 'happy' || mood === 'proud'
  const bigSmile   = mood === 'proud'
  const blush      = mood === 'happy' || mood === 'proud'
  const showZzz    = mood === 'sleep'
  const showSteam  = mood === 'angry'

  return (
    <svg
      viewBox="0 0 140 160"
      width={s}
      height={s * (160/140)}
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', flexShrink: 0 }}
    >
      {/* Spikes cabeza */}
      <polygon points="52,18 56,5 60,18" fill="#1a5c0a"/>
      <polygon points="64,13 68,1 72,13" fill="#1a5c0a"/>
      <polygon points="76,17 80,4 84,17" fill="#1a5c0a"/>

      {/* Cabeza */}
      <ellipse cx="68" cy="50" rx="36" ry="32" fill="#4a9020"/>

      {/* Hocico */}
      <rect x="38" y="62" width="60" height="22" rx="11" fill="#5aaa28"/>

      {/* Narinas */}
      <ellipse cx="52" cy="67" rx="4" ry="3.5" fill="#1a3a08"/>
      <ellipse cx="80" cy="67" rx="4" ry="3.5" fill="#1a3a08"/>

      {/* Cejas */}
      {browsAngry ? (
        <>
          <path d="M36 34 Q52 26 66 33" fill="none" stroke="#0a1a04" strokeWidth="4" strokeLinecap="round"/>
          <path d="M70 33 Q84 26 100 34" fill="none" stroke="#0a1a04" strokeWidth="4" strokeLinecap="round"/>
        </>
      ) : browsHappy ? (
        <>
          <path d="M38 27 Q52 19 66 27" fill="none" stroke="#1a5c0a" strokeWidth="3" strokeLinecap="round"/>
          <path d="M70 27 Q84 19 98 27" fill="none" stroke="#1a5c0a" strokeWidth="3" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <path d="M38 30 Q52 24 66 31" fill="none" stroke="#1a5c0a" strokeWidth="3" strokeLinecap="round"/>
          <path d="M70 31 Q84 24 98 30" fill="none" stroke="#1a5c0a" strokeWidth="3" strokeLinecap="round"/>
        </>
      )}

      {/* Ojos */}
      {eyeClosed ? (
        <>
          <path d="M40 38 Q52 46 64 38" fill="none" stroke="#0a1a04" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M72 38 Q84 46 96 38" fill="none" stroke="#0a1a04" strokeWidth="3.5" strokeLinecap="round"/>
        </>
      ) : mood === 'happy' ? (
        <>
          <path d="M40 38 Q52 28 64 38" fill="none" stroke="#0a1a04" strokeWidth="4" strokeLinecap="round"/>
          <path d="M72 38 Q84 28 96 38" fill="none" stroke="#0a1a04" strokeWidth="4" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <ellipse cx="52" cy="40" rx="11" ry="12" fill="white"/>
          <ellipse cx="84" cy="40" rx="11" ry="12" fill="white"/>
          <ellipse cx="53" cy="41" rx="7.5" ry="8.5" fill="#2a8010"/>
          <ellipse cx="85" cy="41" rx="7.5" ry="8.5" fill="#2a8010"/>
          <ellipse cx="54" cy="42" rx="4.5" ry="5" fill="#0a1a04"/>
          <ellipse cx="86" cy="42" rx="4.5" ry="5" fill="#0a1a04"/>
          <ellipse cx="50" cy="38" rx="2.2" ry="2.5" fill="white" opacity="0.9"/>
          <ellipse cx="82" cy="38" rx="2.2" ry="2.5" fill="white" opacity="0.9"/>
        </>
      )}

      {/* Mejillas */}
      {blush && (
        <>
          <ellipse cx="36" cy="58" rx="9" ry="6" fill="#e06070" opacity="0.35"/>
          <ellipse cx="100" cy="58" rx="9" ry="6" fill="#e06070" opacity="0.35"/>
        </>
      )}

      {/* Boca */}
      {browsAngry ? (
        <path d="M44 80 Q68 74 92 80 Q88 88 68 90 Q48 88 44 80Z" fill="#2d6010"/>
      ) : bigSmile ? (
        <>
          <path d="M40 78 Q68 96 96 78 Q88 102 68 106 Q48 102 40 78Z" fill="#2d6010"/>
          <rect x="50" y="80" width="5" height="9" rx="2.5" fill="white"/>
          <rect x="61" y="81" width="4.5" height="8" rx="2.2" fill="white"/>
          <rect x="73" y="81" width="4.5" height="8" rx="2.2" fill="white"/>
          <rect x="83" y="80" width="5" height="9" rx="2.5" fill="white"/>
          <ellipse cx="68" cy="92" rx="10" ry="6" fill="#e05060"/>
        </>
      ) : mood === 'sleep' ? (
        <path d="M46 80 Q68 86 90 80" fill="none" stroke="#2d6010" strokeWidth="2" strokeLinecap="round"/>
      ) : (
        <>
          <path d="M42 78 Q68 92 94 78 Q88 96 68 100 Q48 96 42 78Z" fill="#2d6010"/>
          <rect x="50" y="80" width="5" height="9" rx="2.5" fill="white"/>
          <rect x="61" y="81" width="4.5" height="8" rx="2.2" fill="white"/>
          <rect x="73" y="81" width="4.5" height="8" rx="2.2" fill="white"/>
          <rect x="83" y="80" width="5" height="9" rx="2.5" fill="white"/>
          <ellipse cx="68" cy="90" rx="10" ry="6" fill="#e05060"/>
        </>
      )}

      {/* Cuerpo */}
      <ellipse cx="68" cy="138" rx="36" ry="46" fill="#4a9020"/>
      {/* Panza */}
      <ellipse cx="68" cy="142" rx="22" ry="33" fill="#9fd840"/>
      {/* Líneas panza */}
      <path d="M52 120 Q68 117 84 120" fill="none" stroke="#7ab830" strokeWidth="1.5" opacity="0.6"/>
      <path d="M50 132 Q68 129 86 132" fill="none" stroke="#7ab830" strokeWidth="1.5" opacity="0.6"/>
      <path d="M50 144 Q68 141 86 144" fill="none" stroke="#7ab830" strokeWidth="1.5" opacity="0.6"/>
      <path d="M52 156 Q68 153 84 156" fill="none" stroke="#7ab830" strokeWidth="1.5" opacity="0.6"/>

      {/* Manchas */}
      <circle cx="40" cy="128" r="4.5" fill="#2d6010" opacity="0.5"/>
      <circle cx="96" cy="130" r="4.5" fill="#2d6010" opacity="0.5"/>
      <circle cx="38" cy="144" r="3.5" fill="#2d6010" opacity="0.45"/>
      <circle cx="98" cy="146" r="3.5" fill="#2d6010" opacity="0.45"/>

      {/* Spikes espalda */}
      <polygon points="36,110 31,96 41,110" fill="#1a5c0a"/>
      <polygon points="35,124 30,110 40,124" fill="#1a5c0a"/>
      <polygon points="35,138 29,124 41,138" fill="#1a5c0a"/>
      <polygon points="100,110 95,96 105,110" fill="#1a5c0a"/>
      <polygon points="101,124 96,110 106,124" fill="#1a5c0a"/>
      <polygon points="100,138 94,124 106,138" fill="#1a5c0a"/>

      {/* Brazos */}
      <ellipse cx="33" cy="132" rx="14" ry="10" fill="#4a9020" transform="rotate(-30,33,132)"/>
      <ellipse cx="103" cy="132" rx="14" ry="10" fill="#4a9020" transform="rotate(30,103,132)"/>
      {/* Garras izq */}
      <rect x="18" y="140" width="4" height="8" rx="2" fill="#3a8018"/>
      <rect x="24" y="142" width="4" height="8" rx="2" fill="#3a8018"/>
      <rect x="30" y="143" width="4" height="7" rx="2" fill="#3a8018"/>
      {/* Garras der */}
      <rect x="102" y="143" width="4" height="7" rx="2" fill="#3a8018"/>
      <rect x="108" y="142" width="4" height="8" rx="2" fill="#3a8018"/>
      <rect x="114" y="140" width="4" height="8" rx="2" fill="#3a8018"/>

      {/* Piernas */}
      <ellipse cx="50" cy="174" rx="16" ry="10" fill="#4a9020" transform="rotate(15,50,174)"/>
      <ellipse cx="86" cy="174" rx="16" ry="10" fill="#4a9020" transform="rotate(-15,86,174)"/>
      {/* Garras pierna izq */}
      <rect x="30" y="179" width="5" height="9" rx="2.5" fill="#3a8018"/>
      <rect x="38" y="181" width="5" height="9" rx="2.5" fill="#3a8018"/>
      <rect x="46" y="182" width="5" height="8" rx="2.5" fill="#3a8018"/>
      {/* Garras pierna der */}
      <rect x="85" y="182" width="5" height="8" rx="2.5" fill="#3a8018"/>
      <rect x="93" y="181" width="5" height="9" rx="2.5" fill="#3a8018"/>
      <rect x="101" y="179" width="5" height="9" rx="2.5" fill="#3a8018"/>

      {/* Cola */}
      <path d="M102 162 Q128 150 142 136 Q150 124 143 115 Q137 108 130 118 Q122 130 110 145Z" fill="#3a8018"/>
      <polygon points="124,122 132,112 134,125" fill="#1a5c0a"/>

      {/* ZZZ (sleep) */}
      {showZzz && (
        <>
          <text x="102" y="28" fontSize="10" fill="#888" fontFamily="Georgia,serif" fontStyle="italic">z</text>
          <text x="110" y="20" fontSize="13" fill="#888" fontFamily="Georgia,serif" fontStyle="italic">z</text>
          <text x="120" y="11" fontSize="16" fill="#888" fontFamily="Georgia,serif" fontStyle="italic">z</text>
        </>
      )}

      {/* Steam (angry) */}
      {showSteam && (
        <>
          <path d="M100 22 Q105 14 100 7 Q106 5 111 12" fill="none" stroke="#c44" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M109 26 Q114 18 109 11 Q115 9 120 16" fill="none" stroke="#c44" strokeWidth="2.5" strokeLinecap="round"/>
        </>
      )}

      {/* Check (proud) */}
      {mood === 'proud' && (
        <>
          <circle cx="110" cy="22" r="13" fill="#3a9030"/>
          <path d="M104 22 L109 28 L118 14" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </>
      )}
    </svg>
  )
}
