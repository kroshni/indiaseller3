'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

interface Seller {
  id: string
  business_name: string
  email: string
  profile_image_url: string
  status: string
  kyc_status: string
  top_scorer: number
}

export default function SellersPage() {
  const router = useRouter()
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSellers, setSelectedSellers] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState('business_name')
  const [sortOrder, setSortOrder] = useState('asc')

  useEffect(() => {
    fetchSellers()
  }, [page, search, status, sortBy, sortOrder])

  const fetchSellers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        status,
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/admin/sellers?${params}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setSellers(data.sellers)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      toast.error('Failed to fetch sellers')
      console.error('Error fetching sellers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (sellerId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/sellers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sellerId, status: newStatus })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setSellers(sellers.map(seller =>
        seller.id === sellerId ? { ...seller, status: newStatus } : seller
      ))
      toast.success('Status updated successfully')
    } catch (error) {
      toast.error('Failed to update status')
      console.error('Error updating status:', error)
    }
  }

  const handleKycStatusChange = async (sellerId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/sellers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sellerId, kyc_status: newStatus })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setSellers(sellers.map(seller =>
        seller.id === sellerId ? { ...seller, kyc_status: newStatus } : seller
      ))
      toast.success('KYC status updated successfully')
    } catch (error) {
      toast.error('Failed to update KYC status')
      console.error('Error updating KYC status:', error)
    }
  }

  const handleTopScorerChange = async (sellerId: string, newScore: number) => {
    try {
      const response = await fetch('/api/admin/sellers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sellerId, top_scorer: newScore })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setSellers(sellers.map(seller =>
        seller.id === sellerId ? { ...seller, top_scorer: newScore } : seller
      ))
      toast.success('Top scorer updated successfully')
    } catch (error) {
      toast.error('Failed to update top scorer')
      console.error('Error updating top scorer:', error)
    }
  }

  const handleDelete = async (sellerId: string) => {
    if (!confirm('Are you sure you want to delete this seller?')) return

    try {
      const response = await fetch(`/api/admin/sellers?id=${sellerId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setSellers(sellers.filter(seller => seller.id !== sellerId))
      toast.success('Seller deleted successfully')
    } catch (error) {
      toast.error('Failed to delete seller')
      console.error('Error deleting seller:', error)
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedSellers.length === 0) {
      toast.error('Please select at least one seller')
      return
    }

    if (!confirm(`Are you sure you want to ${action} the selected sellers?`)) return

    try {
      let updates = {}
      switch (action) {
        case 'delete':
          await Promise.all(
            selectedSellers.map(id =>
              fetch(`/api/admin/sellers?id=${id}`, { method: 'DELETE' })
            )
          )
          setSellers(sellers.filter(seller => !selectedSellers.includes(seller.id)))
          break
        case 'activate':
          updates = { status: 'active' }
          break
        case 'deactivate':
          updates = { status: 'inactive' }
          break
        case 'verify-kyc':
          updates = { kyc_status: 'verified' }
          break
        case 'pending-kyc':
          updates = { kyc_status: 'pending' }
          break
      }

      if (Object.keys(updates).length > 0) {
        const response = await fetch('/api/admin/sellers/bulk', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedSellers, updates })
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error)

        setSellers(sellers.map(seller =>
          selectedSellers.includes(seller.id)
            ? { ...seller, ...updates }
            : seller
        ))
      }

      setSelectedSellers([])
      toast.success('Bulk action completed successfully')
    } catch (error) {
      toast.error('Failed to perform bulk action')
      console.error('Error performing bulk action:', error)
    }
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sellers</h1>
        <Link
          href="/admin/dashboard/sellers/add"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Seller
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedSellers.length > 0 && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => handleBulkAction('delete')}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Delete Selected
          </button>
          <button
            onClick={() => handleBulkAction('activate')}
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          >
            Activate Selected
          </button>
          <button
            onClick={() => handleBulkAction('deactivate')}
            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
          >
            Deactivate Selected
          </button>
          <button
            onClick={() => handleBulkAction('verify-kyc')}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Verify KYC
          </button>
          <button
            onClick={() => handleBulkAction('pending-kyc')}
            className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
          >
            Mark KYC Pending
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={selectedSellers.length === sellers.length}
                  onChange={(e) => {
                    setSelectedSellers(
                      e.target.checked ? sellers.map(s => s.id) : []
                    )
                  }}
                />
              </th>
              <th
                className="p-3 text-left cursor-pointer"
                onClick={() => handleSort('business_name')}
              >
                Business Name
                {sortBy === 'business_name' && (
                  <span>{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
              <th className="p-3">Image</th>
              <th className="p-3">Status</th>
              <th className="p-3">KYC</th>
              <th
                className="p-3 cursor-pointer"
                onClick={() => handleSort('top_scorer')}
              >
                Top Scorer
                {sortBy === 'top_scorer' && (
                  <span>{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((seller) => (
              <tr key={seller.id} className="border-t">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedSellers.includes(seller.id)}
                    onChange={(e) => {
                      setSelectedSellers(
                        e.target.checked
                          ? [...selectedSellers, seller.id]
                          : selectedSellers.filter(id => id !== seller.id)
                      )
                    }}
                  />
                </td>
                <td className="p-3">
                  <div>
                    <div className="font-medium">{seller.business_name}</div>
                    <div className="text-sm text-gray-500">{seller.email}</div>
                  </div>
                </td>
                <td className="p-3">
                  {seller.profile_image_url ? (
                    <Image
                      src={seller.profile_image_url}
                      alt={seller.business_name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 text-xl">
                        {seller.business_name[0]}
                      </span>
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <select
                    value={seller.status}
                    onChange={(e) => handleStatusChange(seller.id, e.target.value)}
                    className={`border rounded p-1 ${
                      seller.status === 'active'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>
                <td className="p-3">
                  <select
                    value={seller.kyc_status}
                    onChange={(e) => handleKycStatusChange(seller.id, e.target.value)}
                    className={`border rounded p-1 ${
                      seller.kyc_status === 'verified'
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }`}
                  >
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                  </select>
                </td>
                <td className="p-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={seller.top_scorer}
                    onChange={(e) => handleTopScorerChange(seller.id, parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center">{seller.top_scorer}%</div>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/dashboard/sellers/${seller.id}`}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/dashboard/sellers/${seller.id}/edit`}
                      className="text-green-500 hover:text-green-700"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(seller.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
} 