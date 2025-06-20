import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold">India Seller</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/categories"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Categories
            </Link>
            <Link
              href="/sellers"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Sellers
            </Link>
            <Link
              href="/services"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Services
            </Link>
            <Link
              href="/blog"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Blog
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Register</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
} 