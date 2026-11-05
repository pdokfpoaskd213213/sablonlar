import Link from "next/link"
import PlakEditor from "@/components/plak-editor"

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-neutral-500">← Anasayfa</Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold">Plak: My Recent Favs</h1>
      <PlakEditor />
    </main>
  )
}
