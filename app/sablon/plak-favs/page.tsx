import Link from "next/link"
import PlakEditor from "@/components/plak-editor"

export default function Page() {
  return (
    <main className="mx-auto max-w-[760px] px-4 pb-24 pt-6">
      <Link href="/" className="font-mono2 text-xs uppercase tracking-wider underline underline-offset-4">
        ← Anasayfa
      </Link>
      <h1 className="font-pix mb-1 mt-4 text-4xl font-bold">Haftalık Release</h1>
      <p className="mb-8 text-sm text-neutral-700">
        Üstten alta doldur, en altta önizlemeyi sürükleyerek düzenle ve indir.
      </p>
      <PlakEditor />
    </main>
  )
}
