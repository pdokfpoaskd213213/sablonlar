import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Tasarım Şablonları",
  description: "Photoshop'suz, tarayıcıda düzenle ve PNG olarak indir.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
