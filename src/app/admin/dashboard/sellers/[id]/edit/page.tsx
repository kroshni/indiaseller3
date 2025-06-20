'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import MultiStepForm from '@/components/ui/MultiStepForm'
import Image from 'next/image'

interface Category {
  id: string
  name: string
}

interface FormData {
  name: string
  email: string
  phone: string
  profile_image_url: string
  password: string
  business_name: string
  gstin: string
  pan: string
  bank_name: string
  account_number: string
  ifsc_code: string
  is_product_seller: boolean
  is_service_seller: boolean
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
  documents: Array<{
    document_type: string
    document_url: string
  }>
  addresses: Array<{
    address_type: string
    address_line1: string
    address_line2: string
    city: string
    state: string
    postal_code: string
    country: string
    location_image_url: string
    is_default: boolean
  }>
  gallery: Array<{
    image_url: string
    caption: string
  }>
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DOCUMENT_TYPES = ['Business Registration', 'Tax Certificate', 'Identity Proof', 'Address Proof', 'Other']
const ADDRESS_TYPES = ['Business', 'Warehouse', 'Branch', 'Other']

export default function EditSellerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    profile_image_url: '',
    password: '',
    business_name: '',
    gstin: '',
    pan: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    is_product_seller: false,
    is_service_seller: false,
    business_category: '',
    product_types: [],
    profession: '',
    service_category: '',
    service_description: '',
    experience_years: 0,
    available_days: [],
    daily_timings: {},
    pricing_type: 'fixed',
    pricing_value: 0,
    service_mode: 'on-site',
    operating_radius: 0,
    documents: [{ document_type: '', document_url: '' }],
    addresses: [{
      address_type: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      location_image_url: '',
      is_default: true
    }],
    gallery: [{ image_url: '', caption: '' }]
  })

  useEffect(() => {
    fetchCategories()
    fetchSellerData()
  }, [params.id])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setCategories(data.categories)
    } catch (error) {
      toast.error('Failed to fetch categories')
      console.error('Error fetching categories:', error)
    }
  }

  const fetchSellerData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/sellers/${params.id}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      const { seller, documents, addresses, gallery } = data
      setFormData({
        ...seller,
        documents: documents.length > 0 ? documents : [{ document_type: '', document_url: '' }],
        addresses: addresses.length > 0 ? addresses : [{
          address_type: '',
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          postal_code: '',
          country: '',
          location_image_url: '',
          is_default: true
        }],
        gallery: gallery.length > 0 ? gallery : [{ image_url: '', caption: '' }]
      })
    } catch (error) {
      toast.error('Failed to fetch seller details')
      console.error('Error fetching seller details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleMultiSelect = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter(v => v !== value)
        : [...prev[name], value]
    }))
  }

  const handleDocumentChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map((doc, i) =>
        i === index ? { ...doc, [field]: value } : doc
      )
    }))
  }

  const handleAddressChange = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) =>
        i === index ? { ...addr, [field]: value } : addr
      )
    }))
  }

  const handleGalleryChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const addDocument = () => {
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, { document_type: '', document_url: '' }]
    }))
  }

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, {
        address_type: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        location_image_url: '',
        is_default: false
      }]
    }))
  }

  const addGalleryItem = () => {
    setFormData(prev => ({
      ...prev,
      gallery: [...prev.gallery, { image_url: '', caption: '' }]
    }))
  }

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error('Please fill in all required fields')
        return
      }

      // Validate seller type
      if (!formData.is_product_seller && !formData.is_service_seller) {
        toast.error('Please select at least one seller type')
        return
      }

      // Validate business details
      if (!formData.business_name || !formData.business_category) {
        toast.error('Please fill in business details')
        return
      }

      // Clean up empty documents, addresses, and gallery items
      const cleanedFormData = {
        ...formData,
        documents: formData.documents.filter(doc => doc.document_type && doc.document_url),
        addresses: formData.addresses.filter(addr => addr.address_line1 && addr.city),
        gallery: formData.gallery.filter(item => item.image_url)
      }

      const response = await fetch(`/api/admin/sellers/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedFormData)
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update seller')
      }

      toast.success('Seller updated successfully')
      router.push('/admin/dashboard/sellers')
    } catch (error) {
      console.error('Error updating seller:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update seller')
    }
  }

  // Reuse the render functions from Add Seller page
  const renderSellerType = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Seller Type</h3>
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_product_seller"
            checked={formData.is_product_seller}
            onChange={handleCheckboxChange}
            className="w-5 h-5"
          />
          <span>Product-Based Seller</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_service_seller"
            checked={formData.is_service_seller}
            onChange={handleCheckboxChange}
            className="w-5 h-5"
          />
          <span>Service-Based Seller</span>
        </label>
      </div>
    </div>
  )

  const renderPersonalDetails = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            placeholder="Leave blank to keep current password"
          />
        </div>
        <div className="col-span-2">
          <label className="block mb-1">Profile Image URL</label>
          <input
            type="text"
            name="profile_image_url"
            value={formData.profile_image_url}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
          {formData.profile_image_url && (
            <div className="mt-2">
              <Image
                src={formData.profile_image_url}
                alt="Profile Preview"
                width={100}
                height={100}
                className="rounded-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderBusinessDetails = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Business Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Business Name</label>
          <input
            type="text"
            name="business_name"
            value={formData.business_name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Category</label>
          <select
            name="business_category"
            value={formData.business_category}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">GSTIN</label>
          <input
            type="text"
            name="gstin"
            value={formData.gstin}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">PAN</label>
          <input
            type="text"
            name="pan"
            value={formData.pan}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Bank Name</label>
          <input
            type="text"
            name="bank_name"
            value={formData.bank_name}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Account Number</label>
          <input
            type="text"
            name="account_number"
            value={formData.account_number}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">IFSC Code</label>
          <input
            type="text"
            name="ifsc_code"
            value={formData.ifsc_code}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
    </div>
  )

  const renderProductSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Product Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Business Category</label>
          <select
            name="business_category"
            value={formData.business_category}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1">Product Types</label>
          <input
            type="text"
            placeholder="Enter comma-separated product types"
            value={formData.product_types.join(', ')}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              product_types: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
            }))}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
    </div>
  )

  const renderServiceSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Service Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Profession / Service Type</label>
          <input
            type="text"
            name="profession"
            value={formData.profession}
            onChange={handleInputChange}
            placeholder="e.g., Doctor, Plumber"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Service Category</label>
          <input
            type="text"
            name="service_category"
            value={formData.service_category}
            onChange={handleInputChange}
            placeholder="e.g., Medical, Repair"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="col-span-2">
          <label className="block mb-1">Service Description</label>
          <textarea
            name="service_description"
            value={formData.service_description}
            onChange={handleInputChange}
            rows={3}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Years of Experience</label>
          <input
            type="number"
            name="experience_years"
            value={formData.experience_years}
            onChange={handleInputChange}
            min="0"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Available Days</label>
          <div className="grid grid-cols-2 gap-2">
            {DAYS_OF_WEEK.map(day => (
              <label key={day} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.available_days.includes(day)}
                  onChange={() => handleMultiSelect('available_days', day)}
                  className="w-4 h-4"
                />
                <span>{day}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block mb-1">Daily Timings</label>
          <div className="space-y-2">
            <div>
              <label className="text-sm">Morning</label>
              <input
                type="time"
                value={formData.daily_timings.morning || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  daily_timings: { ...prev.daily_timings, morning: e.target.value }
                }))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="text-sm">Evening</label>
              <input
                type="time"
                value={formData.daily_timings.evening || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  daily_timings: { ...prev.daily_timings, evening: e.target.value }
                }))}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>
        <div>
          <label className="block mb-1">Pricing Type</label>
          <select
            name="pricing_type"
            value={formData.pricing_type}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="fixed">Fixed</option>
            <option value="variable">Variable</option>
            <option value="hourly">Per Hour</option>
            <option value="per_session">Per Session</option>
            <option value="per_visit">Per Visit</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Pricing Value (₹)</label>
          <input
            type="number"
            name="pricing_value"
            value={formData.pricing_value}
            onChange={handleInputChange}
            min="0"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Service Mode</label>
          <select
            name="service_mode"
            value={formData.service_mode}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="on-site">On-Site</option>
            <option value="remote">Remote</option>
            <option value="both">Both</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Operating Radius (km)</label>
          <input
            type="number"
            name="operating_radius"
            value={formData.operating_radius}
            onChange={handleInputChange}
            min="0"
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
    </div>
  )

  const renderAddresses = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Addresses</h3>
      {formData.addresses.map((address, index) => (
        <div key={index} className="p-4 border rounded mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Address Type</label>
              <select
                value={address.address_type}
                onChange={(e) => handleAddressChange(index, 'address_type', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Type</option>
                {ADDRESS_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Address Line 1</label>
              <input
                type="text"
                value={address.address_line1}
                onChange={(e) => handleAddressChange(index, 'address_line1', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Address Line 2</label>
              <input
                type="text"
                value={address.address_line2}
                onChange={(e) => handleAddressChange(index, 'address_line2', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1">City</label>
              <input
                type="text"
                value={address.city}
                onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1">State</label>
              <input
                type="text"
                value={address.state}
                onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Postal Code</label>
              <input
                type="text"
                value={address.postal_code}
                onChange={(e) => handleAddressChange(index, 'postal_code', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Country</label>
              <input
                type="text"
                value={address.country}
                onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="col-span-2">
              <label className="block mb-1">Location Image URL</label>
              <input
                type="text"
                value={address.location_image_url}
                onChange={(e) => handleAddressChange(index, 'location_image_url', e.target.value)}
                className="w-full p-2 border rounded"
              />
              {address.location_image_url && (
                <div className="mt-2">
                  <Image
                    src={address.location_image_url}
                    alt="Location Preview"
                    width={200}
                    height={150}
                    className="rounded"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={address.is_default}
                  onChange={(e) => handleAddressChange(index, 'is_default', e.target.checked)}
                  className="mr-2"
                />
                Set as Default
              </label>
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addAddress}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Add Another Address
      </button>
    </div>
  )

  const renderDocuments = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Documents</h3>
      {formData.documents.map((doc, index) => (
        <div key={index} className="p-4 border rounded mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Document Type</label>
              <select
                value={doc.document_type}
                onChange={(e) => handleDocumentChange(index, 'document_type', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Type</option>
                {DOCUMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Document URL</label>
              <input
                type="text"
                value={doc.document_url}
                onChange={(e) => handleDocumentChange(index, 'document_url', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addDocument}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Add Another Document
      </button>
    </div>
  )

  const renderGallery = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Gallery</h3>
      <div className="grid grid-cols-3 gap-4">
        {formData.gallery.map((item, index) => (
          <div key={index} className="p-4 border rounded">
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Image URL</label>
                <input
                  type="text"
                  value={item.image_url}
                  onChange={(e) => handleGalleryChange(index, 'image_url', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Caption</label>
                <input
                  type="text"
                  value={item.caption}
                  onChange={(e) => handleGalleryChange(index, 'caption', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              {item.image_url && (
                <div className="mt-2">
                  <Image
                    src={item.image_url}
                    alt={item.caption || `Gallery Image ${index + 1}`}
                    width={200}
                    height={200}
                    className="rounded"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addGalleryItem}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Add Another Image
      </button>
    </div>
  )

  const steps = [
    { title: 'Seller Type', content: renderSellerType() },
    { title: 'Personal Details', content: renderPersonalDetails() },
    { title: 'Business Details', content: renderBusinessDetails() },
    ...(formData.is_product_seller ? [{ title: 'Product Details', content: renderProductSection() }] : []),
    ...(formData.is_service_seller ? [{ title: 'Service Details', content: renderServiceSection() }] : []),
    { title: 'Addresses', content: renderAddresses() },
    { title: 'Documents', content: renderDocuments() },
    { title: 'Gallery', content: renderGallery() }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Seller</h1>
      <MultiStepForm steps={steps} onSubmit={handleSubmit} />
    </div>
  )
} 