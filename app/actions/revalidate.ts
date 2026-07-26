"use server"

import { revalidatePath } from "next/cache"

/** Bust Next.js cache for storefront paths after admin content changes. */
export async function revalidateStorefront(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path)
  }
}

export async function revalidateJournal(slug?: string) {
  revalidatePath("/journal")
  if (slug) revalidatePath(`/journal/${slug}`)
}

export async function revalidateProducts() {
  revalidatePath("/shop")
  revalidatePath("/offers")
  revalidatePath("/brands")
}

export async function revalidateDeals(dealId?: string) {
  revalidatePath("/deals")
  revalidatePath("/offers")
  revalidatePath("/")
  if (dealId) revalidatePath(`/deal/${dealId}`)
}
