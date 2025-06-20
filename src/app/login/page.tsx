'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { validateEmail } from '@/lib/utils/validation'

const userTypeOptions = [
  { value: 'customer', label: 'Customer' },
  { value: 'seller', label: 'Seller' },
  { value: 'admin', label: 'Admin' },
]

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    general?: string
  }>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Registration successful! Please log in.')
    }
  }, [searchParams])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setErrors({})
    setSuccessMessage(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const userType = formData.get('userType') as string

    // Validate email
    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' })
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        userType,
        redirect: false,
      })

      if (result?.error) {
        setErrors({ general: 'Invalid email or password' })
        return
      }

      // Redirect based on user type
      switch (userType) {
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
    } catch (error) {
      setErrors({ general: 'An error occurred during login' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
              {successMessage}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Select
              id="userType"
              name="userType"
              label="Login as"
              options={userTypeOptions}
              defaultValue="customer"
            />

            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              autoComplete="email"
              required
              error={errors.email}
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              autoComplete="current-password"
              required
              error={errors.password}
            />

            {errors.general && (
              <div className="text-red-600 text-sm">
                {errors.general}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account?</span>{' '}
              <Link
                href="/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Register now
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 