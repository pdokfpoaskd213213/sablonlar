"use client"
import { useEffect, useRef, useState } from "react"
import { toPng } from "html-to-image"

const W = 1080, H = 1350, CX = 541, CY = 967, PR = 425
const FONTS = ["Pixelify Sans", "Silkscreen", "VT323", "Press Start 2P", "Special Elite", "Courier Prime", "Playfair Display", "Pinyon Script", "Mrs Saint Delafield", "Allura", "Caveat"]
const FONT_URL = "https://fonts.googleapis.com/css2?" + FONTS.map((f) => "family=" + f.replace(/ /g, "+")).join("&") + "&display=swap"
const DEF = { title: "BURAYA BAŞLIK", fTitle: "Pixelify Sans", fScript: "Pinyon Script", fList: "VT323", fSide: "Silkscreen", cTitle: "#111111", cList: "#111111", cNum: "#ffffff" }
const KEY = "plak-favs-v2"
const TINT = ["#c9d6e2", "#d9c9c9", "#cfd8c4", "#e0d4b8", "#cbc4de"]
const ph = (i: number) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="${TINT[i % 5]}"/><text x="200" y="215" font-family="sans-serif" font-size="34" text-anchor="middle" fill="#555">foto ${i + 1}</text></svg>`)

type Slot = { id: number; img?: string; name: string }
type Item = { id: number; kind: "text" | "img"; x: number; y: number; size: number; rot: number; text?: string; src?: string; color?: string }
type Sel = { k: "i" | "s"; id: number } | null

const read = (f: File) => new Promise<string>((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result as string); fr.readAsDataURL(f) })
const pad = (n: number) => String(n).padStart(2, "0")
const rad = (a: number) => (a * Math.PI) / 180
const polar = (a: number, r: number) => ({ x: CX + Math.cos(rad(a)) * r, y: CY - Math.sin(rad(a)) * r })
const initSlots = (): Slot[] => [1, 2, 3, 4, 5].map((k) => ({ id: k, img: ph(k - 1), name: "buraya şarkı adı yaz" }))
const initItems = (): Item[] => [
  { id: 101, kind: "text", x: 70, y: 440, size: 28, rot: -12, text: "buraya kendi yazını yaz" },
  { id: 102, kind: "text", x: 450, y: 425, size: 24, rot: 0, text: "@kullaniciadi" },
  { id: 103, kind: "text", x: 760, y: 440, size: 26, rot: 4, text: "buraya yan yazı" },
]

export default function PlakEditor() {
  const [cfg, setCfg] = useState(DEF)
  const [slots, setSlots] = useState<Slot[]>(initSlots)
  const [items, setItems] = useState<Item[]>(initItems)
  const [sel, setSel] = useState<Sel>(null)
  const [withImg, setWithImg] = useState(true)
  const [s, setS] = useState(0.5)
  const box = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const uid = useRef(1000)

  useEffect(() => {
    try { const v = localStorage.getItem(KEY); if (v) setCfg({ ...DEF, ...JSON.parse(v) }) } catch {}
  }, [])
  const save = (n: typeof DEF) => { setCfg(n); try { localStorage.setItem(KEY, JSON.stringify(n)) } catch {} }
  const set = (p: Partial<typeof DEF>) => save({ ...cfg, ...p })
  const reset = () => { try { localStorage.removeItem(KEY) } catch {} setCfg(DEF) }

  useEffect(() => {
    const el = box.current!
    const ro = new ResizeObserver(() => setS(el.clientWidth / W))
    ro.observe(el); setS(el.clientWidth / W)
    return () => ro.disconnect()
  }, [])

  const n = slots.length
  const step = n <= 5 ? [0, 0, 50, 40, 36, 34][n] : Math.max(14, 136 / (n - 1))
  const size = n <= 5 ? 150 : Math.max(80, 750 / n)
  const ang = (i: number) => 90 + ((n - 1) / 2 - i) * step

  const words = cfg.title.trim().split(/\s+/)
  const last = words.pop() || ""
  const lh = n > 5 ? Math.max(26, 235 / n) : 47
  const cur = sel?.k === "i" ? items.find((i) => i.id === sel.id) : undefined

  const remove = () => {
    if (!sel) return
    if (sel.k === "i") setItems((p) => p.filter((q) => q.id !== sel.id))
    else if (n > 1) setSlots((p) => p.filter((q) => q.id !== sel.id))
    else setSlots((p) => p.map((q) => ({ ...q, img: undefined })))
    setSel(null)
  }
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (!sel || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); remove(); return }
      const d = e.shiftKey ? 10 : 1
      const mv: Record<string, [number, number]> = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }
      if (sel.k === "i" && mv[e.key]) {
        e.preventDefault()
        const [dx, dy] = mv[e.key]
        setItems((p) => p.map((q) => (q.id === sel.id ? { ...q, x: q.x + dx, y: q.y + dy } : q)))
      }
    }
    addEventListener("keydown", h)
    return () => removeEventListener("keydown", h)
  })

  const upSlot = async (id: number, f?: File) => {
    if (!f) return
    const img = await read(f)
    setSlots((p) => p.map((x) => (x.id === id ? { ...x, img } : x)))
  }
  const addSlot = async (f?: File) => {
    if (n >= 10) return
    const img = f ? await read(f) : undefined
    setSlots((p) => [...p, { id: ++uid.current, img, name: "buraya şarkı adı yaz" }])
  }
  const addImg = async (f?: File) => {
    if (!f) return
    const src = await read(f); const id = ++uid.current
    setItems((p) => [...p, { id, kind: "img", x: 80, y: 600, size: 220, rot: 0, src }]); setSel({ k: "i", id })
  }
  const addText = () => { const id = ++uid.current; setItems((p) => [...p, { id, kind: "text", x: 80, y: 520, size: 30, rot: 0, text: "yeni yazı" }]); setSel({ k: "i", id }) }
  const upItem = (p: Partial<Item>) => sel?.k === "i" && setItems((a) => a.map((x) => (x.id === sel.id ? { ...x, ...p } : x)))

  const track = (mv: (m: PointerEvent) => void) => {
    const up = () => { removeEventListener("pointermove", mv); removeEventListener("pointerup", up) }
    addEventListener("pointermove", mv); addEventListener("pointerup", up)
  }
  const patch = (id: number, p: Partial<Item>) => setItems((a) => a.map((q) => (q.id === id ? { ...q, ...p } : q)))
  const drag = (e: React.PointerEvent, it: Item) => {
    e.preventDefault(); setSel({ k: "i", id: it.id })
    const sx = e.clientX, sy = e.clientY
    track((m) => patch(it.id, { x: it.x + (m.clientX - sx) / s, y: it.y + (m.clientY - sy) / s }))
  }
  const resize = (e: React.PointerEvent, it: Item) => {
    e.stopPropagation(); e.preventDefault()
    const w0 = (e.currentTarget as HTMLElement).parentElement!.offsetWidth
    const sx = e.clientX, sy = e.clientY, r = rad(it.rot)
    track((m) => {
      const d = ((m.clientX - sx) * Math.cos(r) + (m.clientY - sy) * Math.sin(r)) / s
      patch(it.id, { size: Math.max(10, Math.min(900, (it.size * (w0 + d)) / w0)) })
    })
  }
  const rotate = (e: React.PointerEvent, it: Item) => {
    e.stopPropagation(); e.preventDefault()
    const rc = (e.currentTarget as HTMLElement).parentElement!.getBoundingClientRect()
    const cx = rc.left + rc.width / 2, cy = rc.top + rc.height / 2
    track((m) => patch(it.id, { rot: Math.round((Math.atan2(m.clientY - cy, m.clientX - cx) * 180) / Math.PI + 90) }))
  }

  const download = async () => {
    setSel(null); await new Promise((r) => setTimeout(r, 80))
    const url = await toPng(stage.current!, { width: W, height: H, pixelRatio: 1, style: { transform: "none" }, filter: (x) => !(x as HTMLElement).classList?.contains("no-export") })
    const a = document.createElement("a"); a.download = "plak-favs.png"; a.href = url; a.click()
  }
  const exportJson = () => {
    const data = { app: "plak-favs", v: 2, cfg, slots: slots.map((x, i) => ({ ...x, img: withImg ? x.img : ph(i) })), items: withImg ? items : items.filter((q) => q.kind === "text") }
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }))
    a.download = "plak-favs-sablon.json"; a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }
  const importJson = async (f?: File) => {
    if (!f) return
    try {
      const d = JSON.parse(await f.text())
      if (d.app !== "plak-favs" || !Array.isArray(d.slots) || !Array.isArray(d.items)) throw new Error()
      save({ ...DEF, ...d.cfg }); setSlots(d.slots); setItems(d.items); setSel(null)
      uid.current = Math.max(1000, ...d.slots.map((x: Slot) => x.id), ...d.items.map((x: Item) => x.id))
    } catch { alert("Bu dosya geçerli bir şablon dosyası değil.") }
  }

  const fontSel = (label: string, k: "fTitle" | "fScript" | "fList" | "fSide") => (
    <label>
      <span className="lbl">{label}</span>
      <select className="field" value={cfg[k]} onChange={(e) => set({ [k]: e.target.value })}>
        {FONTS.map((f) => <option key={f}>{f}</option>)}
      </select>
    </label>
  )
  const hp = 22 / s
  const ring = (on: boolean) => (on ? `${2 / s}px dashed #1d3bff` : "none")

  return (
    <div className="space-y-8">
      <link rel="stylesheet" href={FONT_URL} />

      <section className="sec">
        <div className="sec-h"><span>01 · Başlık ve yazı tipleri</span></div>
        <div className="sec-b">
          <label><span className="lbl">Başlık (son kelimenin ilk harfi el yazısı olur)</span>
            <input className="field" value={cfg.title} onChange={(e) => set({ title: e.target.value })} /></label>
          <div className="grid grid-cols-2 gap-3">
            {fontSel("Başlık fontu", "fTitle")}{fontSel("Vurgu harfi fontu", "fScript")}
            {fontSel("Liste fontu", "fList")}{fontSel("Yan yazı fontu", "fSide")}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <label><span className="lbl">Başlık rengi</span><input type="color" value={cfg.cTitle} onChange={(e) => set({ cTitle: e.target.value })} /></label>
            <label><span className="lbl">Liste rengi</span><input type="color" value={cfg.cList} onChange={(e) => set({ cList: e.target.value })} /></label>
            <label><span className="lbl">Numara rengi</span><input type="color" value={cfg.cNum} onChange={(e) => set({ cNum: e.target.value })} /></label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn" onClick={reset}>Ayarları sıfırla</button>
            <span className="text-xs text-neutral-600">Font ve renk seçimlerin bu tarayıcıda saklanır, sıfırlayana kadar kalır.</span>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="sec-h"><span>02 · Plak</span><small>{n}/10 · sırayla 1’den başlar</small></div>
        <div className="sec-b">
          {slots.map((x, i) => (
            <div key={x.id} className="flex items-center gap-2">
              <label className="thumb" title="Fotoğrafı değiştir">
                {x.img ? <img src={x.img} alt="" /> : "+"}
                <input type="file" accept="image/*" hidden onChange={(e) => upSlot(x.id, e.target.files?.[0])} />
              </label>
              <span className="font-mono2 w-6 text-xs">{pad(i + 1)}</span>
              <input className="field" placeholder="şarkı / albüm adı" value={x.name} onChange={(e) => setSlots((p) => p.map((q) => (q.id === x.id ? { ...q, name: e.target.value } : q)))} />
              {n > 1 && <button className="btn" aria-label="Sil" onClick={() => setSlots((p) => p.filter((q) => q.id !== x.id))}>×</button>}
            </div>
          ))}
          {n < 10 && (
            <label className="btn self-start justify-self-start">+ Fotoğraf / şarkı ekle
              <input type="file" accept="image/*" hidden onChange={(e) => { addSlot(e.target.files?.[0]); e.target.value = "" }} />
            </label>
          )}
        </div>
      </section>

      <section className="sec">
        <div className="sec-h"><span>03 · Önizleme</span><small>sürükle · köşeden boyutlandır · üstteki noktadan döndür · Delete ile sil</small></div>
        <div className="sec-b">
          <div className="flex flex-wrap gap-2">
            <button className="btn" onClick={addText}>+ Yazı</button>
            <label className="btn">+ Görsel<input type="file" accept="image/*" hidden onChange={(e) => { addImg(e.target.files?.[0]); e.target.value = "" }} /></label>
          </div>

          <div ref={box} className="relative w-full overflow-hidden border-[1.5px] border-[#111]" style={{ aspectRatio: "4/5" }} onPointerDown={() => setSel(null)}>
            <div ref={stage} style={{ width: W, height: H, transform: `scale(${s})`, transformOrigin: "top left", position: "absolute", left: 0, top: 0, overflow: "hidden", background: "#f4f4f2", userSelect: "none" }}>
              <img src="/templates/plak-bos.jpg" alt="" draggable={false} style={{ position: "absolute", inset: 0, width: W, height: H }} />

              <div style={{ position: "absolute", top: 80, width: W, textAlign: "center", color: cfg.cTitle, fontFamily: `'${cfg.fTitle}'`, fontSize: 92, lineHeight: 1.15, fontWeight: 700 }}>
                {words.length > 0 && <div>{words.join(" ").toLocaleUpperCase("tr-TR")}</div>}
                <div>
                  <span style={{ fontFamily: `'${cfg.fScript}'`, fontSize: 190, fontWeight: 400 }}>{last.slice(0, 1).toLocaleUpperCase("tr-TR")}</span>
                  {last.slice(1).toLocaleUpperCase("tr-TR")}
                </div>
              </div>

              {slots.map((x, i) => {
                const a = ang(i), p = polar(a, PR)
                const a2 = a + (a - 90) * 0.12
                const q = polar(a2, 268 + 35 * Math.abs(Math.cos(rad(a2))))
                const on = sel?.k === "s" && sel.id === x.id
                const st: React.CSSProperties = { position: "absolute", left: p.x - size / 2, top: p.y - size / 2, width: size, height: size, transform: `rotate(${(90 - a) * 0.4}deg)`, cursor: "pointer", outline: ring(on), outlineOffset: 6 / s }
                const pick = (e: React.PointerEvent) => { e.stopPropagation(); setSel({ k: "s", id: x.id }) }
                return (
                  <div key={x.id}>
                    {x.img
                      ? <img src={x.img} alt="" draggable={false} onPointerDown={pick} style={{ ...st, objectFit: "cover", boxShadow: "0 4px 14px #0006" }} />
                      : <div className="no-export" onPointerDown={pick} style={{ ...st, border: "3px dashed #999", background: "#fff8" }} />}
                    <div style={{ position: "absolute", left: q.x - 30, top: q.y - 24, width: 60, textAlign: "center", color: cfg.cNum, fontFamily: `'${cfg.fList}'`, fontSize: 40, pointerEvents: "none" }}>{i + 1}</div>
                  </div>
                )
              })}

              <div style={{ position: "absolute", left: 203, right: 153, top: 1050, color: cfg.cList, fontFamily: `'${cfg.fList}'`, fontSize: Math.min(42, lh * 0.88), pointerEvents: "none" }}>
                {slots.map((x, i) => (
                  <div key={x.id} style={{ display: "flex", justifyContent: "space-between", height: lh, lineHeight: `${lh}px` }}>
                    <span>{pad(i + 1)}</span>
                    <span>{x.name || <span className="no-export" style={{ opacity: 0.35 }}>şarkı / albüm adı</span>}</span>
                  </div>
                ))}
              </div>

              {items.map((it) => {
                const on = sel?.k === "i" && sel.id === it.id
                return (
                  <div key={it.id} onPointerDown={(e) => { e.stopPropagation(); drag(e, it) }}
                    style={{ position: "absolute", left: it.x, top: it.y, transform: `rotate(${it.rot}deg)`, cursor: "move", touchAction: "none", outline: ring(on), outlineOffset: 6 / s, color: it.color ?? cfg.cTitle, fontFamily: `'${cfg.fSide}'`, fontSize: it.size, maxWidth: 560, lineHeight: 1.2, textTransform: "uppercase" }}>
                    {it.kind === "text" ? it.text : <img src={it.src} alt="" draggable={false} style={{ width: it.size, display: "block" }} />}
                    {on && (
                      <>
                        <span className="no-export" onPointerDown={(e) => resize(e, it)} style={{ position: "absolute", right: -hp, bottom: -hp, width: hp, height: hp, background: "#fff", border: `${2 / s}px solid #1d3bff`, cursor: "nwse-resize" }} />
                        <span className="no-export" onPointerDown={(e) => rotate(e, it)} style={{ position: "absolute", left: "50%", top: -hp * 2.6, width: hp, height: hp, marginLeft: -hp / 2, borderRadius: "50%", background: "#1d3bff", cursor: "grab" }} />
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border-[1.5px] border-dashed border-[#777] p-3 text-sm">
            {cur ? (
              <div className="grid gap-3">
                {cur.kind === "text" && (
                  <div className="grid grid-cols-[1fr_90px] gap-3">
                    <label><span className="lbl">Yazı</span><input className="field" value={cur.text} onChange={(e) => upItem({ text: e.target.value })} /></label>
                    <label><span className="lbl">Renk</span><input type="color" value={cur.color ?? cfg.cTitle} onChange={(e) => upItem({ color: e.target.value })} /></label>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <label><span className="lbl">Boyut</span><input type="range" min={10} max={700} value={cur.size} onChange={(e) => upItem({ size: +e.target.value })} /></label>
                  <label><span className="lbl">Açı ({cur.rot}°)</span><input type="range" min={-180} max={180} value={cur.rot} onChange={(e) => upItem({ rot: +e.target.value })} /></label>
                </div>
                <button className="btn self-start justify-self-start" onClick={remove}>Bunu sil</button>
              </div>
            ) : sel?.k === "s" ? (
              <div className="flex flex-wrap items-center gap-3">
                <span>Plak fotoğrafı seçili. Değiştirmek için 02’deki küçük resme tıkla.</span>
                <button className="btn" onClick={remove}>Kaldır</button>
              </div>
            ) : (
              <span className="text-neutral-600">Önizlemede bir yazıya, görsele ya da plak fotoğrafına tıkla.</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t-[1.5px] border-[#111] pt-4">
            <button className="btn btn-acc" onClick={download}>PNG olarak indir</button>
            <button className="btn" onClick={exportJson}>Şablonu dışa aktar</button>
            <label className="btn">İçe aktar<input type="file" accept="application/json,.json" hidden onChange={(e) => { importJson(e.target.files?.[0]); e.target.value = "" }} /></label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={withImg} onChange={(e) => setWithImg(e.target.checked)} />fotoğraflar dosyaya dahil</label>
          </div>
        </div>
      </section>
    </div>
  )
}
