import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/Button'
import Test from './test'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <a href="/" className="flex items-center text-2xl font-bold text-blue-600">
                India Seller
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/login" className="text-gray-700 hover:text-gray-900">Login</a>
              <a href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Register
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Find Trusted Sellers & Service Providers Across India
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Connect with verified businesses, compare prices, and get the best deals on products and services.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <a href="/search" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                Start Searching
              </a>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <a href="/register" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                Register as Seller
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase">Quick Links</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="/about" className="text-gray-500 hover:text-gray-900">About Us</a></li>
                <li><a href="/contact" className="text-gray-500 hover:text-gray-900">Contact</a></li>
                <li><a href="/blog" className="text-gray-500 hover:text-gray-900">Blog</a></li>
                <li><a href="/careers" className="text-gray-500 hover:text-gray-900">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="/privacy" className="text-gray-500 hover:text-gray-900">Privacy Policy</a></li>
                <li><a href="/terms" className="text-gray-500 hover:text-gray-900">Terms of Service</a></li>
                <li><a href="/refund" className="text-gray-500 hover:text-gray-900">Refund Policy</a></li>
                <li><a href="/shipping" className="text-gray-500 hover:text-gray-900">Shipping Policy</a></li>
              </ul>
            </div>
            <div>
              <p className="text-gray-500">
                Connect with trusted sellers, buyers, and service providers across India. Your one-stop marketplace for B2B, B2C, and C2C transactions.
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 text-center">
            <p className="text-gray-400">© 2025 India Seller. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
