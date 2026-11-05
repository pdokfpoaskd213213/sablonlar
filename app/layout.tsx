import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Şablon Atölyesi",
  description: "Hazır şablonu seç, tarayıcıda düzenle, PNG olarak indir.",
}

const UI_FONTS =
  "https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@500;700&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&display=swap"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="stylesheet" href={UI_FONTS} />
      </head>
      <body>{children}</body>
    </html>
  )
}
