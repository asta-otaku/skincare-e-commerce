/**
 * Quantity promotion band.
 * `value` = absolute ₦ off product base (tier_discount), NOT a unit price and NOT %.
 */
export type PriceTier = {
  /** Minimum quantity to unlock this tier discount */
  qty: number
  /** Absolute ₦ subtracted from base before SKU delta is applied */
  value: number
}

export type PriceBand = {
  minQty: number
  maxQty: number | null
  tierDiscount: number
  unitPrice: number
  label: string
}

export type Product = {
  id: string
  name: string
  brand: string
  tagline: string
  description: string
  /** Product base / list price (before general % and volume tier). */
  price: number
  /**
   * General product discount % off list/SKU price.
   * Applied on listing cards AND on PDP / cart / checkout, before volume tier ₦ off.
   */
  discountPct?: number
  /**
   * Cart line: product base price preserved while `price` may hold the charged unit.
   */
  listPrice?: number
  /**
   * Cart line: absolute selected SKU/variant list price (before %).
   * unit = discounted(sku) − tier_discount
   *      = discounted(base) − tier_discount + (discounted(sku) − discounted(base))
   */
  skuPrice?: number
  /** Minimum order quantity (default 1). */
  moq?: number
  /** Optional quantity promotions: absolute ₦ off after general % is applied. */
  priceTiers?: PriceTier[]
  /** Primary image — always present */
  image: string
  /** Additional gallery images; falls back to [image] if empty */
  images?: string[]
  category: string
  tag?: "Bestseller" | "New" | "Sale" | "Low Stock"
  benefits: string[]
  ingredients: string[]
  concerns: string[]
  stock: number
  rating: number
  reviewCount: number
  size?: string
  /** Absolute SKU prices (not deltas). Delta is derived vs product.price. */
  variants?: { label: string; price: number }[]
}

export const BRANDS = [
  { id: "cerave",        name: "CeraVe",          tagline: "Developed with dermatologists" },
  { id: "the-ordinary",  name: "The Ordinary",     tagline: "Clinical formulations with integrity" },
  { id: "la-roche-posay",name: "La Roche-Posay",   tagline: "Recommended by dermatologists worldwide" },
  { id: "cosrx",         name: "COSRX",            tagline: "Korean skincare essentials" },
  { id: "neutrogena",    name: "Neutrogena",        tagline: "Dermatologist recommended" },
  { id: "paulas-choice", name: "Paula's Choice",   tagline: "Ingredient-focused formulas" },
  { id: "cetaphil",      name: "Cetaphil",          tagline: "Gentle care for all skin types" },
  { id: "bioderma",      name: "Bioderma",          tagline: "Pioneering dermocosmetics" },
  { id: "vichy",         name: "Vichy",             tagline: "Volcanic mineralising water" },
  { id: "hayda",         name: "HAYDA",             tagline: "Curated by HAYDA SKINCo." },
]

export const products: Product[] = [
  {
    id: "cerave-hydrating-cleanser",
    name: "Hydrating Facial Cleanser",
    brand: "CeraVe",
    tagline: "Gentle daily cleanser for normal to dry skin",
    description: "This gentle non-foaming cleanser is formulated with three essential ceramides and hyaluronic acid to help maintain the skin's natural protective barrier while effectively removing dirt and makeup.",
    price: 5500,
    image: "/product-cleanser.png",
    images: ["/product-cleanser.png", "/product-cream.png", "/product-toner.png"],
    category: "Cleansers",
    tag: "Bestseller",
    benefits: ["Cleanses without stripping", "Maintains moisture barrier", "Non-comedogenic", "Fragrance-free"],
    ingredients: ["Ceramides", "Hyaluronic Acid", "Glycerin"],
    concerns: ["Dry Skin", "Sensitive Skin"],
    stock: 48,
    rating: 4.8,
    reviewCount: 342,
    size: "237ml",
    variants: [
      { label: "237ml", price: 5500 },
      { label: "473ml", price: 9200 },
      { label: "1L", price: 16500 },
    ],
  },
  {
    id: "ordinary-niacinamide",
    name: "Niacinamide 10% + Zinc 1%",
    brand: "The Ordinary",
    tagline: "High-strength vitamin and mineral blemish formula",
    description: "A high-strength vitamin and mineral blemish formula that visibly addresses uneven skin tone, blemishes, and enlarged pores. Contains 10% niacinamide and 1% zinc PCA.",
    price: 3800,
    image: "/product-serum.png",
    images: ["/product-serum.png", "/product-toner.png", "/product-oil.png"],
    category: "Serums",
    tag: "Bestseller",
    benefits: ["Reduces blemishes", "Minimises pore appearance", "Evens skin tone", "Regulates sebum"],
    ingredients: ["Niacinamide", "Zinc PCA"],
    concerns: ["Acne", "Oily Skin", "Hyperpigmentation"],
    stock: 65,
    rating: 4.7,
    reviewCount: 512,
    size: "30ml",
  },
  {
    id: "ordinary-vitamin-c",
    name: "Vitamin C Suspension 23% + HA 2%",
    brand: "The Ordinary",
    tagline: "Potent antioxidant brightening serum",
    description: "A potent brightening formula with 23% L-Ascorbic Acid and 2% Hyaluronic Acid Spheres to brighten the complexion and combat oxidative stress.",
    price: 3600,
    image: "/product-serum.png",
    images: ["/product-serum.png", "/product-oil.png"],
    category: "Serums",
    tag: "Sale",
    benefits: ["Brightens complexion", "Antioxidant protection", "Reduces dark spots", "Anti-ageing"],
    ingredients: ["Vitamin C", "Hyaluronic Acid"],
    concerns: ["Hyperpigmentation", "Anti-Ageing"],
    stock: 30,
    rating: 4.5,
    reviewCount: 289,
    size: "30ml",
  },
  {
    id: "lrp-toleriane-moisturiser",
    name: "Toleriane Double Repair Moisturiser",
    brand: "La Roche-Posay",
    tagline: "Prebiotic moisturiser restores skin barrier",
    description: "Formulated with a prebiotic formula and niacinamide, this moisturiser instantly hydrates and repairs the skin's natural barrier for up to 48 hours.",
    price: 12500,
    image: "/product-cream.png",
    images: ["/product-cream.png", "/product-serum.png", "/product-toner.png"],
    category: "Moisturisers",
    tag: "Bestseller",
    benefits: ["48-hour hydration", "Repairs skin barrier", "Prebiotic formula", "Fragrance-free"],
    ingredients: ["Niacinamide", "Ceramides", "Glycerin"],
    concerns: ["Dry Skin", "Sensitive Skin"],
    stock: 22,
    rating: 4.9,
    reviewCount: 198,
    size: "75ml",
  },
  {
    id: "cosrx-snail-mucin",
    name: "Advanced Snail 96 Mucin Power Essence",
    brand: "COSRX",
    tagline: "96% snail secretion filtrate essence",
    description: "This essence contains 96% Snail Secretion Filtrate to heal blemishes and boost radiance. Lightweight formula absorbs quickly, improving moisture and elasticity.",
    price: 8900,
    image: "/product-serum.png",
    images: ["/product-serum.png", "/product-toner.png"],
    category: "Serums",
    benefits: ["Heals blemishes", "Boosts radiance", "Improves elasticity", "Lightweight"],
    ingredients: ["Snail Secretion Filtrate", "Hyaluronic Acid"],
    concerns: ["Acne", "Dry Skin", "Anti-Ageing"],
    stock: 35,
    rating: 4.8,
    reviewCount: 467,
    size: "100ml",
  },
  {
    id: "paulas-bha",
    name: "Skin Perfecting 2% BHA Liquid Exfoliant",
    brand: "Paula's Choice",
    tagline: "Leave-on exfoliant for blackheads & pores",
    description: "This leave-on exfoliant with 2% salicylic acid gently unclogs and minimises enlarged pores, removes dead skin on the surface and inside the pore, and smooths the skin.",
    price: 18500,
    image: "/product-toner.png",
    images: ["/product-toner.png", "/product-serum.png", "/product-cleanser.png"],
    category: "Treatments",
    tag: "Bestseller",
    benefits: ["Unclogs pores", "Smooths skin texture", "Reduces blackheads", "Anti-inflammatory"],
    ingredients: ["AHA/BHA", "Salicylic Acid", "Methylpropanediol"],
    concerns: ["Acne", "Oily Skin"],
    stock: 18,
    rating: 4.9,
    reviewCount: 623,
    size: "118ml",
  },
  {
    id: "lrp-anthelios-spf50",
    name: "Anthelios UVMune 400 SPF 50+",
    brand: "La Roche-Posay",
    tagline: "Invisible fluid broad-spectrum SPF 50+",
    description: "Lightweight invisible fluid sun protection with Mexoryl 400 technology providing exceptional UVA protection. Suitable for sensitive skin.",
    price: 16000,
    image: "/product-cream.png",
    images: ["/product-cream.png", "/product-oil.png"],
    category: "Sunscreen",
    tag: "Bestseller",
    benefits: ["SPF 50+ protection", "UVA/UVB broad spectrum", "Lightweight invisible", "Water resistant"],
    ingredients: ["SPF", "Mexoryl 400", "Tinosorb S"],
    concerns: ["Anti-Ageing", "Sensitive Skin"],
    stock: 40,
    rating: 4.7,
    reviewCount: 334,
    size: "50ml",
  },
  {
    id: "neutrogena-retinol",
    name: "Rapid Wrinkle Repair Retinol Serum",
    brand: "Neutrogena",
    tagline: "Accelerated retinol SA for visibly smoother skin",
    description: "An accelerated retinol formula with hyaluronic acid and glycerin that visibly reduces the look of fine lines and wrinkles in just one week.",
    price: 11500,
    image: "/product-serum.png",
    images: ["/product-serum.png", "/product-oil.png", "/product-cream.png"],
    category: "Serums",
    tag: "Sale",
    benefits: ["Reduces fine lines", "Smooths texture", "Deep hydration", "Clinically proven"],
    ingredients: ["Retinol", "Hyaluronic Acid", "Glycerin"],
    concerns: ["Anti-Ageing"],
    stock: 25,
    rating: 4.5,
    reviewCount: 278,
    size: "30ml",
  },
  {
    id: "cerave-eye-repair",
    name: "Eye Repair Cream",
    brand: "CeraVe",
    tagline: "Gentle eye cream for dark circles & puffiness",
    description: "Formulated with ceramides and niacinamide to reduce the appearance of dark circles and puffiness around the delicate eye area.",
    price: 5800,
    tag: "Sale",
    image: "/product-eye.png",
    images: ["/product-eye.png", "/product-cream.png"],
    category: "Eye Care",
    benefits: ["Reduces dark circles", "Minimises puffiness", "Ceramide-rich", "Fragrance-free"],
    ingredients: ["Ceramides", "Niacinamide", "Hyaluronic Acid"],
    concerns: ["Anti-Ageing", "Dry Skin"],
    stock: 30,
    rating: 4.6,
    reviewCount: 189,
    size: "14.2g",
  },
  {
    id: "bioderma-sensibio",
    name: "Sensibio H2O Micellar Water",
    brand: "Bioderma",
    tagline: "Original micellar cleansing water for sensitive skin",
    description: "The original micellar water that gently removes makeup, cleanses, and soothes even the most sensitive skin without rinsing.",
    price: 9500,
    image: "/product-cleanser.png",
    images: ["/product-cleanser.png", "/product-toner.png", "/product-serum.png"],
    category: "Cleansers",
    tag: "Bestseller",
    benefits: ["Removes all makeup", "Soothes sensitive skin", "No rinse needed", "pH-balanced"],
    ingredients: ["Cucumber Extract", "Fructooligosaccharides"],
    concerns: ["Sensitive Skin"],
    stock: 55,
    rating: 4.8,
    reviewCount: 445,
    size: "500ml",
  },
  {
    id: "ordinary-aha-bha",
    name: "AHA 30% + BHA 2% Peeling Solution",
    brand: "The Ordinary",
    tagline: "10-minute exfoliating facial mask",
    description: "An exfoliating solution with 30% alpha hydroxy acids (AHA) and 2% beta hydroxy acid (BHA) to help visibly improve skin radiance and texture in just 10 minutes.",
    price: 4800,
    image: "/product-toner.png",
    images: ["/product-toner.png", "/product-serum.png"],
    tag: "New",
    category: "Treatments",
    benefits: ["Deep exfoliation", "Improved radiance", "Reduced texture", "Targets dark spots"],
    ingredients: ["AHA/BHA", "Glycolic Acid", "Salicylic Acid", "Vitamin C"],
    concerns: ["Hyperpigmentation", "Acne", "Anti-Ageing"],
    stock: 42,
    rating: 4.6,
    reviewCount: 512,
    size: "30ml",
  },
  {
    id: "cerave-moisturising-cream",
    name: "Moisturising Cream",
    brand: "CeraVe",
    tagline: "Rich 24-hour barrier cream for dry to very dry skin",
    description: "Rich, non-greasy cream with three essential ceramides and MVE technology for 24-hour hydration. Restores and maintains the skin's natural barrier.",
    price: 8900,
    image: "/product-cream.png",
    images: ["/product-cream.png", "/product-cleanser.png", "/product-serum.png"],
    category: "Moisturisers",
    benefits: ["24-hour hydration", "Restores skin barrier", "Non-greasy", "Suitable for face & body"],
    ingredients: ["Ceramides", "Hyaluronic Acid", "Petrolatum"],
    concerns: ["Dry Skin", "Sensitive Skin"],
    stock: 60,
    rating: 4.9,
    reviewCount: 789,
    size: "454g",
    tag: "Bestseller",
  },
]

export function getProduct(id: string) {
  return products.find(p => p.id === id)
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(price)
}

/** Apply general discount % to a list amount. */
export function getEffectivePrice(product: Pick<Product, "price" | "discountPct">): number {
  const pct = Math.min(100, Math.max(0, Number(product.discountPct) || 0))
  if (pct <= 0) return product.price
  return Math.round(product.price * (1 - pct / 100))
}

export function hasDiscount(product: Pick<Product, "discountPct">): boolean {
  return (Number(product.discountPct) || 0) > 0
}

export function getProductMoq(product: Pick<Product, "moq">): number {
  const n = Math.floor(Number(product.moq) || 1)
  return n >= 1 ? n : 1
}

type RawTier = { qty?: number; value?: number; price?: number }

/**
 * Normalize tiers. `value` = ₦ off base.
 * Legacy rows stored unit `price` — convert with basePrice when provided:
 * value = max(0, basePrice − price).
 */
export function normalizePriceTiers(
  tiers?: RawTier[] | null,
  basePrice?: number,
): PriceTier[] {
  if (!Array.isArray(tiers)) return []
  const base = basePrice != null ? Math.round(Number(basePrice) || 0) : null
  return tiers
    .map((t) => {
      const qty = Math.floor(Number(t.qty) || 0)
      let value = NaN
      if (t.value != null && Number.isFinite(Number(t.value))) {
        value = Math.round(Number(t.value))
      } else if (base != null && t.price != null && Number.isFinite(Number(t.price))) {
        // Legacy: price was charged unit → infer absolute off base
        value = Math.max(0, base - Math.round(Number(t.price)))
      }
      return { qty, value }
    })
    .filter(t => t.qty >= 2 && t.value > 0)
    .sort((a, b) => a.qty - b.qty)
}

/** Absolute ₦ tier discount for a quantity (0 if none). */
export function getTierDiscount(
  tiers: RawTier[] | null | undefined,
  quantity: number,
  basePrice?: number,
): number {
  const qty = Math.max(1, Math.floor(Number(quantity) || 1))
  let matched = 0
  for (const tier of normalizePriceTiers(tiers, basePrice)) {
    if (qty >= tier.qty) matched = tier.value
  }
  return matched
}

/**
 * Transactional unit price (PDP / cart / checkout):
 *   1) Apply general discount % to base and SKU list prices
 *   2) unit = discounted_base − tier_discount + sku_delta
 *      where sku_delta = discounted_sku − discounted_base
 *   Equivalent: unit = max(0, discounted_sku − tier_discount)
 */
export function calculateUnitPrice(opts: {
  basePrice: number
  quantity: number
  priceTiers?: RawTier[] | null
  /** Absolute selected SKU/variant list price; defaults to base */
  skuPrice?: number
  /** General product discount % (stacks with volume tier) */
  discountPct?: number
}): number {
  const base = Math.round(Number(opts.basePrice) || 0)
  const sku = Math.round(Number(opts.skuPrice ?? base) || 0)
  const pct = opts.discountPct
  const discountedBase = getEffectivePrice({ price: base, discountPct: pct })
  const discountedSku = getEffectivePrice({ price: sku, discountPct: pct })
  const tierDiscount = getTierDiscount(opts.priceTiers, opts.quantity, base)
  const skuDelta = discountedSku - discountedBase
  return Math.max(0, discountedBase - tierDiscount + skuDelta)
}

/** Line total = unit × quantity */
export function calculateTotalPrice(opts: {
  basePrice: number
  quantity: number
  priceTiers?: RawTier[] | null
  skuPrice?: number
  discountPct?: number
}): number {
  const qty = Math.max(1, Math.floor(Number(opts.quantity) || 1))
  return calculateUnitPrice({ ...opts, quantity: qty }) * qty
}

/**
 * Cart helper — listPrice = base, skuPrice = absolute SKU list, then % + tier.
 */
export function getUnitPriceForQuantity(
  product: Pick<Product, "price" | "listPrice" | "skuPrice" | "priceTiers" | "discountPct">,
  quantity: number,
): number {
  const base = Number(product.listPrice ?? product.price) || 0
  const sku = Number(product.skuPrice ?? base) || 0
  return calculateUnitPrice({
    basePrice: base,
    skuPrice: sku,
    quantity,
    priceTiers: product.priceTiers,
    discountPct: product.discountPct,
  })
}

/** Price bands for PriceRange UI (includes synthetic MOQ…firstTier−1 after general %). */
export function buildPriceBands(opts: {
  moq?: number
  basePrice: number
  skuPrice?: number
  discountPct?: number
  priceTiers?: RawTier[] | null
}): PriceBand[] {
  const moq = getProductMoq({ moq: opts.moq })
  const base = Math.round(Number(opts.basePrice) || 0)
  const sku = Math.round(Number(opts.skuPrice ?? base) || 0)
  const pct = opts.discountPct
  const tiers = normalizePriceTiers(opts.priceTiers, base)

  if (!tiers.length) {
    return [{
      minQty: moq,
      maxQty: null,
      tierDiscount: 0,
      unitPrice: calculateUnitPrice({
        basePrice: base, skuPrice: sku, quantity: moq, discountPct: pct,
      }),
      label: `${moq}+ units`,
    }]
  }

  const bands: PriceBand[] = []
  const firstMin = tiers[0].qty

  if (moq < firstMin) {
    bands.push({
      minQty: moq,
      maxQty: firstMin - 1,
      tierDiscount: 0,
      unitPrice: calculateUnitPrice({
        basePrice: base, skuPrice: sku, quantity: moq, discountPct: pct,
      }),
      label: moq === firstMin - 1 ? `${moq} units` : `${moq} – ${firstMin - 1} units`,
    })
  }

  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i]
    const next = tiers[i + 1]
    const minQty = Math.max(t.qty, moq)
    const maxQty = next ? next.qty - 1 : null
    if (maxQty != null && minQty > maxQty) continue
    bands.push({
      minQty,
      maxQty,
      tierDiscount: t.value,
      unitPrice: calculateUnitPrice({
        basePrice: base,
        skuPrice: sku,
        quantity: minQty,
        priceTiers: tiers,
        discountPct: pct,
      }),
      label:
        maxQty == null
          ? `${minQty}+ units`
          : minQty === maxQty
            ? `${minQty} units`
            : `${minQty} – ${maxQty} units`,
    })
  }
  return bands
}

/** Matches storefront navbar concern / ingredient links. */
export const ALL_CONCERNS = ["Acne", "Hyperpigmentation", "Anti-Ageing", "Dry Skin", "Oily Skin", "Sensitive Skin"]
export const ALL_INGREDIENTS = ["Vitamin C", "Retinol", "Niacinamide", "AHA/BHA", "Hyaluronic Acid", "SPF", "Ceramides"]

/** @deprecated Prefer getCategoryTree() — kept as fallback flat list. */
export const ALL_CATEGORIES = [
  "Cleansing Oils & Balms",
  "Eye Creams & Treatments",
  "Exfoliators, Peels & Scrubs",
  "Face Cleansers & Wash",
  "Face Mask",
  "Face Moisturizers",
  "Face Toners & Mists",
  "Lipbalm & Lip Oils",
  "Micellar Water",
  "Serums & Treatment",
  "Sunscreens",
  "Body Moisturizers & Oils",
  "Body Scrubs",
  "Body Wash",
  "Cleansing Bar",
  "Hand Cream",
  "Personal Care",
  "Body mist and spray",
  "Roll on",
]
