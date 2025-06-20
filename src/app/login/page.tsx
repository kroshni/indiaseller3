'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Toaster, toast } from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard'
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'admin' // Default to admin
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
        redirect: false,
        callbackUrl
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Login successful!')
        // Redirect based on user type
        switch (formData.userType) {
          case 'admin':
            router.push('/admin/dashboard')
            break
          case 'seller':
            router.push('/seller/dashboard')
            break
          case 'customer':
            router.push('/dashboard')
            break
          default:
            router.push('/')
        }
      }
    } catch (error) {
      toast.error('An error occurred during login')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toaster position="top-center" />
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <Select
              value={formData.userType}
              onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'seller', label: 'Seller' },
                { value: 'customer', label: 'Customer' }
              ]}
              label="User Type"
            />
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email address"
              required
              label="Email"
            />
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Password"
              required
              label="Password"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
} 