'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const Sidebar = () => {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname?.startsWith(path) ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="w-64 bg-gray-900 min-h-screen p-4 flex flex-col">
      <div className="flex-grow space-y-4">
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

      {/* Logout Button */}
      <div className="border-t border-gray-700 pt-4 mt-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-md transition-colors duration-150"
        >
          <span className="mr-3">🚪</span>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar 