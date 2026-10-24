import type { Metadata } from "next"
import { Suspense } from "react"
import { PageHeader } from "@/components/page-header"
import { ShopGrid } from "@/components/shop-grid"
import { ALL_SKIN_TYPES, resolveCatalogLabel } from "@/lib/catalog"
import { getCategoryTree, resolveCategoryName, slugifyCategory, type CategorySection } from "@/lib/supabase/categories"
import { queryProducts } from "@/lib/supabase/products"
import { FREE_STANDARD_DELIVERY } from "@/lib/storefront-copy"

type ShopSearch = {
  category?: string
  brand?: string
  skinType?: string
  sale?: string
  filter?: string
}

function decodeParam(value?: string) {
  if (!value) return undefined
  try {
    const decoded = decodeURIComponent(value).trim()
    return decoded || undefined
  } catch {
    const trimmed = value.trim()
    return trimmed || undefined
  }
}

async function resolveShopCollection(sp: ShopSearch) {
  const tree = await getCategoryTree()
  const categoryName = sp.category
    ? resolveCategoryName(tree, sp.category) ?? undefined
    : undefined
  const brandParam = decodeParam(sp.brand)
  const brandName = brandParam && brandParam !== "All" ? brandParam : undefined
  const skinParam = decodeParam(sp.skinType)
  const skinName = skinParam && skinParam !== "All"
    ? resolveCatalogLabel(ALL_SKIN_TYPES, skinParam) ?? skinParam
    : undefined
  const onSale = sp.sale === "true"
  const named = [brandName, categoryName, skinName].filter((part): part is string => Boolean(part))

  let eyebrow = "All Products"
  let title = "Shop All Skincare"
  let description = `Trusted brands. Authentic products. ${FREE_STANDARD_DELIVERY}.`

  if (named.length > 1) {
    eyebrow = "Shop"
    title = named.join(" · ")
    description = `${title}. ${FREE_STANDARD_DELIVERY}.`
  } else if (categoryName) {
    eyebrow = "Shop"
    title = categoryName
    description = `${categoryName} from HAYDA SKINCo. ${FREE_STANDARD_DELIVERY}.`
  } else if (brandName) {
    eyebrow = "Shop by brand"
    title = brandName
    description = `Authentic ${brandName} products. ${FREE_STANDARD_DELIVERY}.`
  } else if (skinName) {
    eyebrow = "Shop by skin type"
  const browse =
    sp.filter === "concerns" ? "concern" : sp.filter === "ingredients" ? "ingredient" : undefined
  const named = [brandName, categoryName, skinName].filter((part): part is string => Boolean(part))

  let eyebrow = "All Products"
  let title = "Shop All Skincare"
  let description = `Trusted brands. Authentic products. ${FREE_STANDARD_DELIVERY}.`

  if (named.length > 1) {
    eyebrow = "Shop"
    title = named.join(" · ")
    description = `${title}. ${FREE_STANDARD_DELIVERY}.`
  } else if (categoryName) {
    eyebrow = "Shop"
    title = categoryName
    description = `${categoryName} from HAYDA SKINCo. ${FREE_STANDARD_DELIVERY}.`
  } else if (brandName) {
    eyebrow = "Shop by brand"
    title = brandName
    description = `Authentic ${brandName} products. ${FREE_STANDARD_DELIVERY}.`
  } else if (skinName) {
    eyebrow = "Shop by skin type"
    title = skinName
    description = `Skincare for ${skinName.toLowerCase()}. ${FREE_STANDARD_DELIVERY}.`
  } else if (onSale) {
    eyebrow = "Offers"
    title = "Sale"
    description = `Discounted skincare, while stocks last. ${FREE_STANDARD_DELIVERY}.`
  } else if (browse === "concern") {
    eyebrow = "Discover"
    title = "Shop by Concern"
    description = `Choose a skin concern and see the products made for it. ${FREE_STANDARD_DELIVERY}.`
  } else if (browse === "ingredient") {
    eyebrow = "Discover"
    title = "Shop by Ingredient"
    description = `Choose an ingredient and see the products that use it. ${FREE_STANDARD_DELIVERY}.`
  searchParams,
}: {
  searchParams: Promise<ShopSearch>
}) {
  const heading = await resolveShopCollection(await searchParams)
  const products = await queryProducts({
    category: heading.categoryName,
    brand: heading.brandName,
    skinType: heading.skinName,
    discountOnly: heading.onSale || undefined,
    sort: "featured",
    limit: 96,
  })

  return (
    <>
      <PageHeader
        eyebrow={heading.eyebrow}
        title={heading.title}
        description={heading.description}
      />
      <Suspense>
        <ShopGrid
          initialProducts={products}
          initialCategory={heading.categoryName ?? "All"}
        />
      </Suspense>
    </>
  )
}
