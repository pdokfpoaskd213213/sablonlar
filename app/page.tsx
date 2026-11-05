import Link from "next/link"
import { siteName, templates } from "@/lib/templates"

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-5 pb-24 pt-6">
      <nav className="flex items-baseline justify-between border-b-[1.5px] border-[#111] pb-3">
        <span className="font-pix text-xl">{siteName}</span>
        <span className="font-mono2 text-xs uppercase tracking-wider">{templates.length} şablon</span>
      </nav>

      <section className="py-14 sm:py-24">
        <h1 className="font-pix text-5xl font-bold leading-[1.02] sm:text-7xl">
          Şablonu seç.<br />Kendine göre değiştir.<br />
          <span className="mark">PNG olarak al.</span>
        </h1>
        <p className="mt-7 max-w-md text-lg leading-snug">
          Hesap yok, kurulum yok, Photoshop yok. Fotoğrafını yükle, yazını yaz,
          indir. Yüklediklerin tarayıcından dışarı çıkmaz.
        </p>
      </section>

      <div className="mb-5 flex items-center gap-3">
        <h2 className="font-mono2 text-xs font-medium uppercase tracking-wider">Şablonlar</h2>
        <div className="h-px flex-1 bg-[#111]" />
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t, i) => (
          <article key={t.slug} className="card">
            <div className="relative border-b-[1.5px] border-[#111]">
              <img src={t.preview} alt={t.title} className="aspect-[4/5] w-full object-cover" />
              <span className="tag">N°{String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <h3 className="font-pix text-xl font-bold">{t.title}</h3>
              <p className="flex-1 text-sm leading-snug text-neutral-700">{t.description}</p>
              <Link href={`/sablon/${t.slug}`} className="btn btn-ink self-start">
                Al, kullan →
              </Link>
            </div>
          </article>
        ))}
        <div className="card-empty">Yeni şablonlar<br />yolda.</div>
      </div>
    </main>
  )
}
