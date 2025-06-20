'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Sidebar = () => {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname?.startsWith(path) ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
  }

  return (
    <div className="w-64 bg-gray-900 min-h-screen p-4">
      <div className="space-y-4">
        <div className="px-2 py-4 text-xl font-semibold text-white">
          Admin Dashboard
        </div>
        
        <nav className="space-y-1">
          <Link 
            href="/admin/dashboard"
            className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive('/admin/dashboard')}`}
          >
            <span className="mr-3">📊</span>
            Dashboard
          </Link>

          <div className="pt-4">
            <div className="px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Catalog
            </div>

            <Link 
              href="/admin/dashboard/categories"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive('/admin/dashboard/categories')}`}
            >
              <span className="mr-3">📂</span>
              Categories
            </Link>

            <Link 
              href="/admin/dashboard/brands"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive('/admin/dashboard/brands')}`}
            >
              <span className="mr-3">🏷️</span>
              Brands
            </Link>
          </div>

          <div className="pt-4">
            <div className="px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Users
            </div>

            <Link 
              href="/admin/dashboard/sellers"
              className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive('/admin/dashboard/sellers')}`}
            >
              <span className="mr-3">👥</span>
              Sellers
            </Link>
          </div>
        </nav>
      </div>
    </div>
  )
}

export default Sidebar 