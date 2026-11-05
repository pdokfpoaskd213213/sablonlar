import Link from "next/link"
import { templates } from "@/lib/templates"

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">Photoshop'suz tasarım</h1>
        <p className="mx-auto mt-4 max-w-xl text-neutral-600">
          Hazır şablonu seç, yazıları, renkleri ve görselleri kendine göre
          değiştir, tek tıkla PNG olarak indir. Üyelik yok, kurulum yok.
        </p>
      </header>

      <h2 className="mb-5 text-xl font-semibold">Şablonlar</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <article key={t.slug} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <img src={t.preview} alt={t.title} className="aspect-[4/5] w-full object-cover" />
            <div className="p-4">
              <h3 className="font-semibold">{t.title}</h3>
              <p className="mt-1 text-sm text-neutral-600">{t.description}</p>
              <Link
                href={`/sablon/${t.slug}`}
                className="mt-4 inline-block rounded-full bg-black px-5 py-2 text-sm font-medium text-white"
              >
                Al, Kullan
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
