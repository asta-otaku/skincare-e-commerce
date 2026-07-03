import type { Product } from "@/lib/products"

export type DealItem = {
  name: string
  size: string
  price: number
}

export type Deal = {
  id: string
  badge: string
  brand: string
  title: string
  subtitle: string
  items: DealItem[]
  originalPrice: number
  salePrice: number
  concern: string
  highlight?: boolean
  /** Admin-only: draft deals are not shown on the storefront */
  status: "active" | "draft" | "archived"
  createdAt: string
}

export const deals: Deal[] = [
  {
    id: "barrier-repair",
    badge: "Save 17%",
    brand: "CeraVe",
    title: "Barrier Repair Bundle",
    subtitle: "Complete daily routine for dry & sensitive skin",
    items: [
      { name: "Hydrating Facial Cleanser",  size: "237ml", price: 5500 },
      { name: "Moisturising Cream",          size: "454g",  price: 8900 },
      { name: "Eye Repair Cream",            size: "14.2g", price: 7200 },
    ],
    originalPrice: 21600,
    salePrice: 18000,
    concern: "Dry Skin · Sensitive Skin",
    highlight: true,
    status: "active",
    createdAt: "2024-11-01",
  },
  {
    id: "glow-starter",
    badge: "Save 18%",
    brand: "The Ordinary",
    title: "Glow Starter Kit",
    subtitle: "Targeted actives for brighter, clearer skin",
    items: [
      { name: "Niacinamide 10% + Zinc 1%",           size: "30ml", price: 3800 },
      { name: "Vitamin C Suspension 23%",             size: "30ml", price: 4200 },
      { name: "AHA 30% + BHA 2% Peeling Solution",    size: "30ml", price: 4800 },
    ],
    originalPrice: 12800,
    salePrice: 10500,
    concern: "Acne · Hyperpigmentation",
    status: "active",
    createdAt: "2024-11-05",
  },
  {
    id: "k-beauty",
    badge: "Save 17%",
    brand: "COSRX",
    title: "K-Beauty Essentials",
    subtitle: "Korean skincare trio for smooth, hydrated skin",
    items: [
      { name: "Snail 96 Mucin Power Essence", size: "100ml", price: 8900 },
      { name: "BHA Blackhead Power Liquid",   size: "100ml", price: 7500 },
      { name: "Low pH Good Morning Cleanser", size: "150ml", price: 5200 },
    ],
    originalPrice: 21600,
    salePrice: 18000,
    concern: "Acne · Oily Skin",
    status: "active",
    createdAt: "2024-11-10",
  },
  {
    id: "sun-protection",
    badge: "Save 15%",
    brand: "La Roche-Posay",
    title: "SPF Essentials Duo",
    subtitle: "Daily moisturiser + premium sunscreen",
    items: [
      { name: "Toleriane Double Repair Moisturiser", size: "75ml",  price: 12500 },
      { name: "Anthelios UVMune 400 SPF 50+",        size: "50ml",  price: 16000 },
    ],
    originalPrice: 28500,
    salePrice: 24200,
    concern: "Anti-Ageing · Sensitive Skin",
    status: "active",
    createdAt: "2024-11-12",
  },
  {
    id: "acne-fighter",
    badge: "Save 20%",
    brand: "Mixed",
    title: "Acne Fighter Kit",
    subtitle: "Proven actives to clear breakouts and prevent scarring",
    items: [
      { name: "CeraVe Hydrating Cleanser",               size: "237ml", price: 5500 },
      { name: "The Ordinary Niacinamide 10%",            size: "30ml",  price: 3800 },
      { name: "Paula's Choice 2% BHA Liquid Exfoliant",  size: "118ml", price: 18500 },
    ],
    originalPrice: 27800,
    salePrice: 22200,
    concern: "Acne · Oily Skin",
    status: "active",
    createdAt: "2024-11-15",
  },
  {
    id: "anti-ageing",
    badge: "Save 16%",
    brand: "Mixed",
    title: "Anti-Ageing Routine",
    subtitle: "Retinol + SPF + vitamin C — the core trio",
    items: [
      { name: "Neutrogena Rapid Wrinkle Repair Serum", size: "30ml", price: 14500 },
      { name: "The Ordinary Vitamin C 23%",            size: "30ml", price: 4200 },
      { name: "La Roche-Posay Anthelios SPF 50+",      size: "50ml", price: 16000 },
    ],
    originalPrice: 34700,
    salePrice: 29200,
    concern: "Anti-Ageing",
    status: "draft",
    createdAt: "2024-11-20",
  },
]

export function getDeal(id: string) {
  return deals.find(d => d.id === id)
}

/**
 * Converts a deal into a Product-shaped object so it can be
 * added to the cart without changing the CartProvider interface.
 */
export function dealAsProduct(deal: Deal): Product {
  return {
    id: `deal__${deal.id}`,
    name: deal.title,
    brand: deal.brand,
    tagline: deal.subtitle,
    description: `${deal.title} — ${deal.items.map(i => i.name).join(", ")}`,
    price: deal.salePrice,
    image: "/product-bundle.png",
    category: "bundle",
    tag: "Sale",
    benefits: [],
    ingredients: [],
    concerns: deal.concern.split(" · "),
    stock: 99,
    rating: 4.8,
    reviewCount: 0,
  }
}
