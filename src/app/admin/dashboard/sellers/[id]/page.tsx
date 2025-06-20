'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

interface Seller {
  id: string
  name: string
  email: string
  phone: string
  profile_image_url: string
  business_name: string
  status: string
  kyc_status: string
  top_scorer: number
  is_product_seller: boolean
  is_service_seller: boolean
  gstin: string
  pan: string
  bank_name: string
  account_number: string
  ifsc_code: string
  business_category: string
  product_types: string[]
  profession: string
  service_category: string
  service_description: string
  experience_years: number
  available_days: string[]
  daily_timings: { [key: string]: string }
  pricing_type: string
  pricing_value: number
  service_mode: string
  operating_radius: number
  created_at: string
  updated_at: string
}

interface Document {
  id: string
  seller_id: string
  document_type: string
  document_url: string
}

interface Address {
  id: string
  seller_id: string
  address_type: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  postal_code: string
  country: string
  location_image_url: string
  is_default: boolean
}

interface GalleryItem {
  id: string
  seller_id: string
  image_url: string
  caption: string
}

export default function ViewSellerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [seller, setSeller] = useState<Seller | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSellerData()
  }, [params.id])

  const fetchSellerData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/sellers/${params.id}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setSeller(data.seller)
      setDocuments(data.documents || [])
      setAddresses(data.addresses || [])
      setGallery(data.gallery || [])
    } catch (error) {
      toast.error('Failed to fetch seller details')
      console.error('Error fetching seller details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this seller?')) return

    try {
      const response = await fetch(`/api/admin/sellers?id=${params.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      toast.success('Seller deleted successfully')
      router.push('/admin/dashboard/sellers')
    } catch (error) {
      toast.error('Failed to delete seller')
      console.error('Error deleting seller:', error)
    }
  }

  const formatTime = (time: string) => {
    if (!time) return 'Not set';
    try {
      return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (e) {
      return time;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Seller not found</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Seller Details</h1>
        <div className="flex gap-2">
          <Link
            href={`/admin/dashboard/sellers/${params.id}/edit`}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-6">
            {seller.profile_image_url ? (
              <Image
                src={seller.profile_image_url}
                alt={seller.name}
                width={100}
                height={100}
                className="rounded-full"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-3xl text-gray-500">
                  {seller.name?.[0]}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold">{seller.name}</h2>
              <p className="text-gray-600">{seller.business_name}</p>
              <p className="text-gray-600">{seller.email}</p>
              <p className="text-gray-600">{seller.phone}</p>
              <div className="mt-2 flex gap-4">
                <span className={`px-2 py-1 rounded text-sm ${
                  seller.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {seller.status}
                </span>
                <span className={`px-2 py-1 rounded text-sm ${
                  seller.kyc_status === 'verified'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  KYC: {seller.kyc_status}
                </span>
                <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                  Score: {seller.top_scorer}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Business Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium">Business Category</label>
              <p>{seller.business_category || 'Not specified'}</p>
            </div>
            <div>
              <label className="font-medium">GSTIN</label>
              <p>{seller.gstin || 'Not specified'}</p>
            </div>
            <div>
              <label className="font-medium">PAN</label>
              <p>{seller.pan || 'Not specified'}</p>
            </div>
            <div>
              <label className="font-medium">Bank Name</label>
              <p>{seller.bank_name || 'Not specified'}</p>
            </div>
            <div>
              <label className="font-medium">Account Number</label>
              <p>{seller.account_number || 'Not specified'}</p>
            </div>
            <div>
              <label className="font-medium">IFSC Code</label>
              <p>{seller.ifsc_code || 'Not specified'}</p>
            </div>
            <div>
              <label className="font-medium">Password</label>
              <p>••••••••</p>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Addresses</h3>
          {addresses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {addresses.map((address, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="font-medium">{address.address_type}</span>
                      {address.is_default && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium">Address Line 1</label>
                      <p>{address.address_line1}</p>
                    </div>
                    <div>
                      <label className="font-medium">Address Line 2</label>
                      <p>{address.address_line2 || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="font-medium">City</label>
                      <p>{address.city}</p>
                    </div>
                    <div>
                      <label className="font-medium">State</label>
                      <p>{address.state}</p>
                    </div>
                    <div>
                      <label className="font-medium">Postal Code</label>
                      <p>{address.postal_code}</p>
                    </div>
                    <div>
                      <label className="font-medium">Country</label>
                      <p>{address.country}</p>
                    </div>
                  </div>
                  {address.location_image_url && (
                    <div className="mt-4">
                      <Image
                        src={address.location_image_url}
                        alt="Location"
                        width={300}
                        height={200}
                        className="rounded-lg"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No addresses added</p>
          )}
        </div>

        {/* Documents */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Documents</h3>
          {documents.length > 0 ? (
            <div className="grid grid-cols-2 gap-6">
              {documents.map((doc, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{doc.document_type}</span>
                  </div>
                  <a
                    href={doc.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View Document
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No documents uploaded</p>
          )}
        </div>

        {/* Gallery */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Gallery</h3>
          {gallery.length > 0 ? (
            <div className="grid grid-cols-3 gap-6">
              {gallery.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <Image
                    src={item.image_url}
                    alt={item.caption || `Gallery Image ${index + 1}`}
                    width={300}
                    height={300}
                    className="rounded-lg mb-2"
                  />
                  {item.caption && (
                    <p className="text-sm text-gray-600">{item.caption}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No gallery images added</p>
          )}
        </div>

        {/* Service Details */}
        {seller.is_service_seller && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Service Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Profession</label>
                <p>{seller.profession || 'Not specified'}</p>
              </div>
              <div>
                <label className="font-medium">Service Category</label>
                <p>{seller.service_category || 'Not specified'}</p>
              </div>
              <div className="col-span-2">
                <label className="font-medium">Service Description</label>
                <p>{seller.service_description || 'Not specified'}</p>
              </div>
              <div>
                <label className="font-medium">Experience</label>
                <p>{seller.experience_years} years</p>
              </div>
              <div>
                <label className="font-medium">Available Days</label>
                <p>{seller.available_days?.join(', ') || 'Not specified'}</p>
              </div>
              <div>
                <label className="font-medium">Daily Timings</label>
                <div>
                  <p>Morning: {formatTime(seller.daily_timings?.morning)}</p>
                  <p>Evening: {formatTime(seller.daily_timings?.evening)}</p>
                </div>
              </div>
              <div>
                <label className="font-medium">Pricing</label>
                <p>
                  {seller.pricing_type} - ₹{seller.pricing_value}
                </p>
              </div>
              <div>
                <label className="font-medium">Service Mode</label>
                <p>{seller.service_mode}</p>
              </div>
              <div>
                <label className="font-medium">Operating Radius</label>
                <p>{seller.operating_radius} km</p>
              </div>
            </div>
          </div>
        )}

        {/* Product Details */}
        {seller.is_product_seller && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Product Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-medium">Product Types</label>
                <p>{seller.product_types?.join(', ') || 'Not specified'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 