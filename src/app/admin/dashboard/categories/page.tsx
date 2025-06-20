'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Table from '@/components/ui/Table'
import Modal from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'

interface Category {
  id: string
  name: string
  slug: string
  description: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await fetch('/api/admin/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Category Name', sortable: true },
    { key: 'slug', label: 'Slug', sortable: true },
    { key: 'description', label: 'Description' },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    }
  ]

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    // Implement sorting logic here
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleAdd = () => {
    setIsEditMode(false)
    setSelectedCategory(null)
    setFormData({
      name: '',
      description: '',
      status: 'active'
    })
    setIsModalOpen(true)
  }

  const handleEdit = (category: Category) => {
    setIsEditMode(true)
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      status: category.status
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (category: Category) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`/api/admin/categories/${category.id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          setCategories(categories.filter(c => c.id !== category.id))
        } else {
          throw new Error('Failed to delete category')
        }
      } catch (error) {
        console.error('Error deleting category:', error)
        alert('Failed to delete category')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = isEditMode
        ? `/api/admin/categories/${selectedCategory?.id}`
        : '/api/admin/categories'
      
      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        if (isEditMode) {
          setCategories(categories.map(c => 
            c.id === selectedCategory?.id ? { ...c, ...data } : c
          ))
        } else {
          setCategories([...categories, data])
        }
        setIsModalOpen(false)
      } else {
        throw new Error('Failed to save category')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Failed to save category')
    }
  }

  const renderActions = (category: Category) => (
    <div className="flex justify-end space-x-2">
      <Button
        onClick={() => handleEdit(category)}
        className="bg-blue-500 hover:bg-blue-600"
      >
        Edit
      </Button>
      <Button
        onClick={() => handleDelete(category)}
        className="bg-red-500 hover:bg-red-600"
      >
        Delete
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Button onClick={handleAdd}>Add Category</Button>
      </div>

      <div className="flex justify-between items-center">
        <Input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={handleSearch}
          className="max-w-xs"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4">Loading categories...</div>
      ) : (
        <Table
          columns={columns}
          data={categories}
          onSort={handleSort}
          onPageChange={handlePageChange}
          currentPage={currentPage}
          totalPages={Math.ceil(categories.length / 10)}
          actions={renderActions}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditMode ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]}
          />
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
} 