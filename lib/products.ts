export type Product = {
  id: string
  name: string
  tagline: string
  price: number
  image: string
  category: string
  tag?: string
  bestseller?: boolean
  description: string
  benefits: string[]
  ingredients: string
}

export const products: Product[] = [
  {
    id: "radiance-serum",
    name: "Radiance Renewal Serum",
    tagline: "Vitamin C + Hyaluronic Acid",
    price: 128,
    image: "/product-serum.png",
    category: "Serums",
    tag: "Bestseller",
    bestseller: true,
    description:
      "A featherlight serum that brightens, firms, and floods skin with moisture. Stabilized Vitamin C works alongside triple-weight hyaluronic acid to reveal a luminous, even complexion.",
    benefits: ["Visibly brightens tone", "Plumps fine lines", "Antioxidant defense"],
    ingredients: "15% Vitamin C, Hyaluronic Acid, Ferulic Acid, Marula Oil",
  },
  {
    id: "gold-oil",
    name: "Gold Infusion Face Oil",
    tagline: "24k Gold + Marula Botanicals",
    price: 156,
    image: "/product-oil.png",
    category: "Oils",
    tag: "New",
    description:
      "A precious dry oil suspended with flecks of 24k gold and cold-pressed marula. Melts into skin for a cushioned, radiant glow without a trace of grease.",
    benefits: ["Nourishes & restores", "Imparts a lit-from-within glow", "Strengthens moisture barrier"],
    ingredients: "24k Gold, Marula Oil, Squalane, Sea Buckthorn",
  },
  {
    id: "velvet-cream",
    name: "Velvet Hydration Cream",
    tagline: "Ceramides + Squalane",
    price: 94,
    image: "/product-cream.png",
    category: "Moisturizers",
    bestseller: true,
    description:
      "A whipped, velvety cream that seals in moisture for a soft, supple finish. Ceramides and squalane reinforce the skin barrier through the day and overnight.",
    benefits: ["24-hour hydration", "Reinforces barrier", "Soft matte finish"],
    ingredients: "Ceramides, Squalane, Shea Butter, Panthenol",
  },
  {
    id: "lavender-toner",
    name: "Lavender Calm Toner",
    tagline: "Soothing Floral Essence",
    price: 68,
    image: "/product-toner.png",
    category: "Toners",
    tag: "Limited",
    description:
      "A calming floral essence that tones, balances, and preps skin for the rituals to follow. French lavender soothes while gentle PHAs refine texture.",
    benefits: ["Calms & balances", "Refines texture", "Preps for serums"],
    ingredients: "French Lavender, PHA, Glycerin, Aloe",
  },
  {
    id: "eye-concentrate",
    name: "Illuminating Eye Concentrate",
    tagline: "Peptides + Caffeine",
    price: 112,
    image: "/product-eye.png",
    category: "Eye Care",
    description:
      "A cooling concentrate that depuffs, brightens, and smooths the delicate eye area. Peptides and caffeine awaken tired eyes for a refreshed, rested look.",
    benefits: ["Depuffs & cools", "Brightens dark circles", "Smooths fine lines"],
    ingredients: "Peptides, Caffeine, Niacinamide, Cucumber",
  },
  {
    id: "gentle-cleanser",
    name: "Gentle Resurfacing Cleanser",
    tagline: "PHA + Rose Water",
    price: 56,
    image: "/product-cleanser.png",
    category: "Cleansers",
    bestseller: true,
    description:
      "A silky gel cleanser that gently resurfaces while preserving the skin barrier. PHAs sweep away impurities as rose water soothes and softens.",
    benefits: ["Gently resurfaces", "Non-stripping", "Leaves skin soft"],
    ingredients: "PHA, Rose Water, Glycerin, Green Tea",
  },
]

export function getProduct(id: string) {
  return products.find((product) => product.id === id)
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value)
}
