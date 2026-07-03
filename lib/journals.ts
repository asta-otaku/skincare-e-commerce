export type Journal = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  author: string
  publishedAt: string
  image: string
  readTime: number
  status: "published" | "draft"
  tags: string[]
}

export const journals: Journal[] = [
  {
    id: "1",
    title: "The Art of Layering: How to Build Your Perfect Skincare Ritual",
    slug: "art-of-layering-skincare-ritual",
    excerpt:
      "Understanding the correct order to apply your skincare products can make the difference between a ritual that transforms and one that merely touches the surface.",
    content: `Understanding the correct order to apply your skincare products can make the difference between a ritual that transforms and one that merely touches the surface.

## Why Order Matters

When it comes to skincare layering, the golden rule is to work from lightest to heaviest texture. This ensures each formula penetrates effectively without being blocked by heavier occlusive ingredients.

## The HAYDA Method

**Step 1: Cleanse**
Begin with our Gentle Resurfacing Cleanser to remove impurities while maintaining your skin's delicate moisture barrier. Massage in circular motions for 60 seconds.

**Step 2: Tone**
Our Lavender Calm Toner prepares the skin to receive active ingredients, balancing pH and delivering a first wave of hydration.

**Step 3: Serum**
Apply the Radiance Renewal Serum to damp skin — the Vitamin C and hyaluronic acid penetrate most effectively at this stage.

**Step 4: Eye Care**
The Illuminating Eye Concentrate should be applied with the ring finger, using gentle tapping motions around the orbital bone.

**Step 5: Oil**
A single drop of the Gold Infusion Face Oil pressed between palms and patted onto the face seals in the layers beneath.

**Step 6: Moisturise**
Finish with the Velvet Hydration Cream to lock in moisture and smooth the surface.

*Allow 30 seconds between layers for optimal absorption.*`,
    category: "Rituals",
    author: "HAYDA Editorial",
    publishedAt: "2024-11-15",
    image: "/journal-ritual.png",
    readTime: 6,
    status: "published",
    tags: ["layering", "ritual", "guide"],
  },
  {
    id: "2",
    title: "Vitamin C: The Science Behind the Glow",
    slug: "vitamin-c-science-behind-glow",
    excerpt:
      "Not all Vitamin C is created equal. We explore the science of stabilised ascorbic acid and why temperature and formulation make all the difference.",
    content: `Not all Vitamin C is created equal. We explore the science of stabilised ascorbic acid and why temperature and formulation make all the difference.

## The Challenge with Vitamin C

Ascorbic acid — the pure form of Vitamin C — is notoriously unstable. Exposed to light, heat, or oxygen, it oxidises rapidly, turning orange and losing its efficacy. This is why so many Vitamin C serums fail to deliver visible results.

## How HAYDA SKINCo. Sources Vitamin C

Our Radiance Renewal Serum uses a patented stabilisation method that encapsulates the ascorbic acid molecules until they come into contact with skin. This ensures maximum potency at the moment of application.

## The Ferulic Acid Synergy

Combined with Ferulic Acid, the effectiveness of Vitamin C is doubled. This antioxidant compound not only stabilises the formula but amplifies UV protection and brightening effects.

## What to Expect

With consistent daily use, most clients notice a measurable improvement in radiance within 3 weeks, and significant brightening of dark spots and post-inflammatory hyperpigmentation within 8–12 weeks.`,
    category: "Ingredients",
    author: "Dr. Sophie Renard",
    publishedAt: "2024-10-28",
    image: "/journal-ingredients.png",
    readTime: 8,
    status: "published",
    tags: ["vitamin c", "ingredients", "science"],
  },
  {
    id: "3",
    title: "Gold in Skincare: Ancient Wisdom Meets Modern Science",
    slug: "gold-skincare-ancient-wisdom-modern-science",
    excerpt:
      "From Cleopatra's legendary milk baths to today's advanced 24k gold formulations, the precious metal has always held a place in beauty.",
    content: `From Cleopatra's legendary milk baths to today's advanced 24k gold formulations, the precious metal has always held a place in beauty.

## A History Written in Gold

Gold's association with beauty and longevity stretches back millennia. Ancient Egyptians believed it had anti-ageing properties; Japanese geishas used gold leaf to maintain their famously luminous skin.

## The Modern Science

Today, we understand that gold nanoparticles can penetrate the dermis and stimulate cellular regeneration. They also possess remarkable anti-inflammatory properties, reducing redness and calming sensitised skin.

## 24k in Practice

Our Gold Infusion Face Oil suspends genuine 24k gold flakes in a base of cold-pressed marula and squalane. The result is a dry oil that delivers a lit-from-within glow while supporting barrier function overnight.`,
    category: "Ingredients",
    author: "HAYDA Editorial",
    publishedAt: "2024-09-12",
    image: "/journal-gold.png",
    readTime: 5,
    status: "draft",
    tags: ["gold", "luxury", "history"],
  },
]

export function getJournal(id: string) {
  return journals.find((j) => j.id === id)
}
