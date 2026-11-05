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
    title: "Plak: My Recent Favs",
    description:
      "Plağın üzerine en sevdiğin albümleri diz, şarkı listeni yaz, PNG olarak indir.",
    preview: "/templates/plak-bos.jpg",
  },
]
