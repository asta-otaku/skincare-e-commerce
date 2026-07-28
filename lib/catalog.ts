/**
 * Pinned storefront / admin catalogs for ingredients, skin types, and concerns.
 * Admins can still add custom values beyond these lists.
 */

export const ALL_INGREDIENTS = [
  "Niacinamide",
  "Vitamin C",
  "Salicylic Acid (BHA)",
  "Glycolic Acid (AHA)",
  "Lactic Acid (AHA)",
  "Mandelic Acid",
  "Azelaic Acid",
  "Tranexamic Acid",
  "Kojic Acid",
  "Alpha Arbutin",
  "Retinol",
  "Retinal",
  "Bakuchiol",
  "Hyaluronic Acid",
  "Ceramides",
  "Panthenol (Vitamin B5)",
  "Glycerin",
  "Squalane",
  "Snail Mucin",
  "Centella Asiatica (Cica)",
  "Aloe Vera",
  "Green Tea Extract",
  "Licorice Root Extract",
  "Zinc PCA",
  "Peptides",
  "Caffeine",
  "Vitamin E",
  "Ferulic Acid",
  "Allantoin",
  "Colloidal Oatmeal",
  "Tea Tree Oil",
  "Sulfur",
  "Benzoyl Peroxide",
  "Urea",
  "Shea Butter",
  "Jojoba Oil",
  "Rosehip Oil",
] as const

export const ALL_SKIN_TYPES = [
  "All Skin Types",
  "Oily Skin",
  "Dry Skin",
  "Combination Skin",
  "Normal Skin",
  "Sensitive Skin",
  "Acne-Prone Skin",
  "Mature Skin",
  "Dehydrated Skin",
] as const

export const ALL_CONCERNS = [
  "Acne",
  "Breakouts",
  "Blackheads",
  "Whiteheads",
  "Clogged Pores",
  "Enlarged Pores",
  "Excess Oil",
  "Uneven Skin Tone",
  "Hyperpigmentation",
  "Dark Spots",
  "Post-Acne Marks (PIH)",
  "Melasma",
  "Dullness",
  "Dryness",
  "Dehydration",
  "Rough Texture",
  "Uneven Texture",
  "Fine Lines",
  "Wrinkles",
  "Loss of Firmness",
  "Redness",
  "Sensitivity",
  "Damaged Skin Barrier",
  "Irritation",
  "Sun Damage",
  "Keratosis Pilaris",
  "Body Acne",
  "Ingrown Hairs",
  "Dark Under-Eyes",
  "Puffiness",
] as const

export type CatalogIngredient = (typeof ALL_INGREDIENTS)[number]
export type CatalogSkinType = (typeof ALL_SKIN_TYPES)[number]
export type CatalogConcern = (typeof ALL_CONCERNS)[number]

export function slugifyCatalogLabel(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[()]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function resolveCatalogLabel(options: readonly string[], slugOrName: string): string | null {
  if (!slugOrName || slugOrName === "All") return null
  const decoded = decodeURIComponent(slugOrName).trim()
  const bySlug = options.find(o => slugifyCatalogLabel(o) === decoded || slugifyCatalogLabel(o) === slugifyCatalogLabel(decoded))
  if (bySlug) return bySlug
  const byName = options.find(o => o.toLowerCase() === decoded.toLowerCase())
  return byName ?? null
}
