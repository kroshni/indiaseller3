'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Toaster, toast } from 'react-hot-toast'

export default function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'admin'
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
        redirect: false
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        // Successful login
        const redirectPath = formData.userType === 'admin' ? '/admin/dashboard' : 
                           formData.userType === 'seller' ? '/seller/dashboard' : 
                           '/dashboard'
        router.push(redirectPath)
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <Toaster position="top-center" />
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
  )
} 