export const siteName = "Şablon Atölyesi"

export type Template = {
  slug: string
  title: string
  description: string
  preview: string
}

// Yeni şablon eklemek = bu listeye bir kayıt + app/sablon/<slug>/page.tsx
export const templates: Template[] = [
  {
    slug: "plak-favs",
    title: "Plak: En Sevdiklerim",
    description:
      "Albüm kapaklarını plağın üstüne diz, şarkı listeni altına yaz. 1080×1350 PNG.",
    preview: "/templates/plak-bos.jpg",
  },
]
