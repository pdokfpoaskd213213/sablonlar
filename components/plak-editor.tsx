"use client"
import { useEffect, useRef, useState } from "react"
import { toPng } from "html-to-image"

const W = 1080, H = 1350, CX = 541, CY = 967
const FONTS = ["Pixelify Sans", "Silkscreen", "VT323", "Press Start 2P", "Special Elite", "Courier Prime", "Playfair Display", "Pinyon Script", "Mrs Saint Delafield", "Allura", "Caveat"]
const FONT_URL = "https://fonts.googleapis.com/css2?" + FONTS.map((f) => "family=" + f.replace(/ /g, "+")).join("&") + "&display=swap"
const DEF = { title: "BURAYA BAŞLIK", fTitle: "Pixelify Sans", fScript: "Pinyon Script", fList: "VT323", fSide: "Silkscreen", cTitle: "#111111", cList: "#111111", cNum: "#ffffff" }
const KEY = "plak-favs-v2"
const COLORS = ["#c9d6e2", "#d9c9c9", "#cfd8c4", "#e0d4b8", "#cbc4de"]
const ph = (i: number) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="${COLORS[i % 5]}"/><text x="200" y="215" font-family="sans-serif" font-size="34" text-anchor="middle" fill="#555">foto ${i + 1}</text></svg>`)

type Slot = { id: number; img?: string; name: string }
type Item = { id: number; kind: "text" | "img"; x: number; y: number; size: number; rot: number; text?: string; src?: string }

const read = (f: File) => new Promise<string>((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result as string); fr.readAsDataURL(f) })
const pad = (n: number) => String(n).padStart(2, "0")

export default function PlakEditor() {
  const [cfg, setCfg] = useState(DEF)
  const [slots, setSlots] = useState<Slot[]>([1, 2, 3, 4, 5].map((k) => ({ id: k, img: ph(k - 1), name: "buraya şarkı adı yaz" })))
  const [items, setItems] = useState<Item[]>([
    { id: 101, kind: "text", x: 70, y: 400, size: 28, rot: -12, text: "buraya kendi yazını yaz" },
    { id: 102, kind: "text", x: 450, y: 395, size: 24, rot: 0, text: "@kullaniciadi" },
  ])
  const [sel, setSel] = useState<number | null>(null)
  const [s, setS] = useState(0.5)
  const box = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const uid = useRef(1000)

  useEffect(() => {
    try { const v = localStorage.getItem(KEY); if (v) setCfg({ ...DEF, ...JSON.parse(v) }) } catch {}
  }, [])
  const set = (p: Partial<typeof DEF>) => setCfg((c) => { const n = { ...c, ...p }; try { localStorage.setItem(KEY, JSON.stringify(n)) } catch {} return n })
  const reset = () => { try { localStorage.removeItem(KEY) } catch {} setCfg(DEF) }

  useEffect(() => {
    const el = box.current!
    const ro = new ResizeObserver(() => setS(el.clientWidth / W))
    ro.observe(el); setS(el.clientWidth / W)
    return () => ro.disconnect()
  }, [])

  const n = slots.length
  const step = n < 2 ? 0 : n === 2 ? 56 : n === 3 ? 46 : n === 4 ? 42 : 152 / (n - 1)
  const size = n <= 5 ? 150 : Math.max(80, 750 / n)
  const pos = (i: number, r: number) => {
    const a = ((90 + ((n - 1) / 2 - i) * step) * Math.PI) / 180
    return { x: CX + Math.cos(a) * r, y: CY - Math.sin(a) * r, a: (a * 180) / Math.PI }
  }

  const words = cfg.title.trim().split(/\s+/)
  const last = words.pop() || ""
  const lh = n > 5 ? Math.max(26, 235 / n) : 47

  const upSlot = async (id: number, f?: File) => {
    if (!f) return
    const img = await read(f)
    setSlots((p) => p.map((x) => (x.id === id ? { ...x, img } : x)))
  }
  const addSlot = async (f?: File) => {
    if (n >= 10) return
    const img = f ? await read(f) : undefined
    setSlots((p) => [...p, { id: ++uid.current, img, name: "" }])
  }
  const addImg = async (f?: File) => {
    if (!f) return
    const src = await read(f); const id = ++uid.current
    setItems((p) => [...p, { id, kind: "img", x: 80, y: 600, size: 200, rot: 0, src }]); setSel(id)
  }
  const addText = () => { const id = ++uid.current; setItems((p) => [...p, { id, kind: "text", x: 80, y: 500, size: 30, rot: 0, text: "yeni yazı" }]); setSel(id) }
  const upItem = (p: Partial<Item>) => setItems((a) => a.map((x) => (x.id === sel ? { ...x, ...p } : x)))
  const cur = items.find((i) => i.id === sel)

  const drag = (e: React.PointerEvent, it: Item) => {
    e.preventDefault(); setSel(it.id)
    const sx = e.clientX, sy = e.clientY, ox = it.x, oy = it.y
    const mv = (m: PointerEvent) => setItems((p) => p.map((q) => (q.id === it.id ? { ...q, x: ox + (m.clientX - sx) / s, y: oy + (m.clientY - sy) / s } : q)))
    const up = () => { removeEventListener("pointermove", mv); removeEventListener("pointerup", up) }
    addEventListener("pointermove", mv); addEventListener("pointerup", up)
  }

  const download = async () => {
    setSel(null); await new Promise((r) => setTimeout(r, 80))
    const url = await toPng(stage.current!, { width: W, height: H, pixelRatio: 1, style: { transform: "none" }, filter: (x) => !(x as HTMLElement).classList?.contains("no-export") })
    const a = document.createElement("a"); a.download = "plak-favs.png"; a.href = url; a.click()
  }

  const inp = "w-full rounded-lg border px-3 py-2 text-sm"
  const btn = "rounded-full border px-4 py-2 text-sm cursor-pointer"
  const fontSel = (label: string, k: "fTitle" | "fScript" | "fList" | "fSide") => (
    <label className="text-xs">{label}
      <select className={inp} value={cfg[k]} onChange={(e) => set({ [k]: e.target.value })}>
        {FONTS.map((f) => <option key={f}>{f}</option>)}
      </select>
    </label>
  )

  return (
    <div className="space-y-8">
      <link rel="stylesheet" href={FONT_URL} />

      <section className="space-y-3">
        <h2 className="font-semibold">Başlık ve yazı tipleri</h2>
        <input className={inp} value={cfg.title} onChange={(e) => set({ title: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          {fontSel("Başlık fontu", "fTitle")}{fontSel("Vurgu harfi fontu", "fScript")}
          {fontSel("Liste fontu", "fList")}{fontSel("Yan yazı fontu", "fSide")}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <label>Başlık rengi <input type="color" value={cfg.cTitle} onChange={(e) => set({ cTitle: e.target.value })} /></label>
          <label>Liste rengi <input type="color" value={cfg.cList} onChange={(e) => set({ cList: e.target.value })} /></label>
          <label>Numara rengi <input type="color" value={cfg.cNum} onChange={(e) => set({ cNum: e.target.value })} /></label>
          <button className={btn} onClick={reset}>Ayarları sıfırla</button>
        </div>
        <p className="text-xs text-neutral-500">Yazı tipi ve renk ayarların bu tarayıcıda kayıtlı kalır, sıfırlayana kadar silinmez.</p>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Plak fotoğrafları ve şarkılar ({n}/10)</h2>
        {slots.map((x, i) => (
          <div key={x.id} className="flex items-center gap-2">
            <span className="w-6 text-sm">{pad(i + 1)}</span>
            <input className={inp} placeholder="şarkı / albüm adı" value={x.name} onChange={(e) => setSlots((p) => p.map((q) => (q.id === x.id ? { ...q, name: e.target.value } : q)))} />
            <label className={btn}>{x.img ? "Değiştir" : "Fotoğraf"}<input type="file" accept="image/*" hidden onChange={(e) => upSlot(x.id, e.target.files?.[0])} /></label>
            {n > 1 && <button className={btn} onClick={() => setSlots((p) => p.filter((q) => q.id !== x.id))}>Sil</button>}
          </div>
        ))}
        {n < 10 && <label className={btn + " inline-block"}>+ Fotoğraf / şarkı ekle<input type="file" accept="image/*" hidden onChange={(e) => addSlot(e.target.files?.[0])} /></label>}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Yanlara yazı / görsel ekle</h2>
        <div className="flex gap-2">
          <button className={btn} onClick={addText}>+ Yazı</button>
          <label className={btn}>+ Görsel<input type="file" accept="image/*" hidden onChange={(e) => addImg(e.target.files?.[0])} /></label>
        </div>
        <p className="text-xs text-neutral-500">Önizlemede sürükleyerek yerini değiştir, tıklayıp seç.</p>
        {cur && (
          <div className="space-y-2 rounded-xl border p-3 text-xs">
            {cur.kind === "text" && <input className={inp} value={cur.text} onChange={(e) => upItem({ text: e.target.value })} />}
            <label className="block">Boyut <input type="range" min={cur.kind === "text" ? 12 : 60} max={cur.kind === "text" ? 120 : 600} value={cur.size} onChange={(e) => upItem({ size: +e.target.value })} /></label>
            <label className="block">Döndür <input type="range" min={-180} max={180} value={cur.rot} onChange={(e) => upItem({ rot: +e.target.value })} /></label>
            <button className={btn} onClick={() => { setItems((p) => p.filter((q) => q.id !== cur.id)); setSel(null) }}>Bunu sil</button>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Önizleme</h2>
        <div ref={box} className="relative w-full overflow-hidden rounded-xl border" style={{ aspectRatio: "4/5" }} onPointerDown={() => setSel(null)}>
          <div ref={stage} style={{ width: W, height: H, transform: `scale(${s})`, transformOrigin: "top left", position: "absolute", left: 0, top: 0, overflow: "hidden", background: "#f4f4f2" }}>
            <img src="/templates/plak-bos.jpg" alt="" style={{ position: "absolute", inset: 0, width: W, height: H }} />

            <div style={{ position: "absolute", top: 80, width: W, textAlign: "center", color: cfg.cTitle, fontFamily: `'${cfg.fTitle}'`, fontSize: 92, lineHeight: 1.15, fontWeight: 700 }}>
              {words.length > 0 && <div>{words.join(" ").toLocaleUpperCase("tr-TR")}</div>}
              <div>
                <span style={{ fontFamily: `'${cfg.fScript}'`, fontSize: 190, fontWeight: 400 }}>{last.slice(0, 1).toLocaleUpperCase("tr-TR")}</span>
                {last.slice(1).toLocaleUpperCase("tr-TR")}
              </div>
            </div>

            {slots.map((x, i) => {
              const p = pos(i, 400), q = pos(i, 265)
              return (
                <div key={x.id}>
                  {x.img ? (
                    <img src={x.img} alt="" style={{ position: "absolute", left: p.x - size / 2, top: p.y - size / 2, width: size, height: size, objectFit: "cover", transform: `rotate(${(90 - p.a) * 0.4}deg)`, boxShadow: "0 4px 14px #0006" }} />
                  ) : (
                    <div className="no-export" style={{ position: "absolute", left: p.x - size / 2, top: p.y - size / 2, width: size, height: size, border: "3px dashed #999", background: "#fff8", transform: `rotate(${(90 - p.a) * 0.4}deg)` }} />
                  )}
                  <div style={{ position: "absolute", left: q.x - 30, top: q.y - 24, width: 60, textAlign: "center", color: cfg.cNum, fontFamily: `'${cfg.fList}'`, fontSize: 40 }}>{i + 1}</div>
                </div>
              )
            })}

            <div style={{ position: "absolute", left: 203, right: 153, top: 1050, color: cfg.cList, fontFamily: `'${cfg.fList}'`, fontSize: Math.min(42, lh * 0.88) }}>
              {slots.map((x, i) => (
                <div key={x.id} style={{ display: "flex", justifyContent: "space-between", height: lh, lineHeight: `${lh}px` }}>
                  <span>{pad(i + 1)}</span>
                  <span>{x.name || <span className="no-export" style={{ opacity: 0.35 }}>şarkı / albüm adı</span>}</span>
                </div>
              ))}
            </div>

            {items.map((it) => (
              <div key={it.id} onPointerDown={(e) => { e.stopPropagation(); drag(e, it) }}
                style={{ position: "absolute", left: it.x, top: it.y, transform: `rotate(${it.rot}deg)`, cursor: "move", touchAction: "none", outline: sel === it.id ? "3px dashed #2563eb" : "none", color: cfg.cTitle, fontFamily: `'${cfg.fSide}'`, fontSize: it.size, maxWidth: 420, lineHeight: 1.2, textTransform: "uppercase" }}>
                {it.kind === "text" ? it.text : <img src={it.src} alt="" draggable={false} style={{ width: it.size, display: "block" }} />}
              </div>
            ))}
          </div>
        </div>
        <button className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white" onClick={download}>PNG olarak indir</button>
      </section>
    </div>
  )
}
