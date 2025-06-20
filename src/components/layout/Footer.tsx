import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="container py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div>
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">India Seller</span>
            </Link>
            <p className="mt-4 text-base text-gray-500">
              Connect with trusted sellers, buyers, and service providers across India.
              Your one-stop marketplace for B2B, B2C, and C2C transactions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/about" className="text-base text-gray-500 hover:text-gray-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-base text-gray-500 hover:text-gray-900">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-base text-gray-500 hover:text-gray-900">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-base text-gray-500 hover:text-gray-900">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/privacy" className="text-base text-gray-500 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-base text-gray-500 hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-base text-gray-500 hover:text-gray-900">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-base text-gray-500 hover:text-gray-900">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            © {new Date().getFullYear()} India Seller. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 