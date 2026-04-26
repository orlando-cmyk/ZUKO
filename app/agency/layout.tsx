import { Syne, Inter } from 'next/font/google'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '600', '700', '800'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${syne.variable} ${inter.variable}`}>
      <style>{`
        .agency-root { cursor: none; }
        .agency-root * { cursor: none !important; }
      `}</style>
      {children}
    </div>
  )
}
