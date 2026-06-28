import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/components/cart-provider'
import { FavoritesProvider } from '@/components/favorites-provider'
import { SiteNavbar } from '@/components/site-navbar'
import { SiteFooter } from '@/components/site-footer'
import { CartDrawer } from '@/components/cart-drawer'
import { SearchModal, SearchProvider } from '@/components/search-modal'

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <FavoritesProvider>
        <SearchProvider>
          <div className="flex min-h-screen flex-col bg-background">
            <SiteNavbar />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <CartDrawer />
          <SearchModal />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </SearchProvider>
      </FavoritesProvider>
    </CartProvider>
  )
}
