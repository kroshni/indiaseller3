'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { validateEmail, validatePassword, validateName } from '@/lib/utils/validation'

const userTypeOptions = [
  { value: 'customer', label: 'Customer' },
  { value: 'seller', label: 'Seller' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
  }>({})

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const userType = formData.get('userType') as string

    // Validate inputs
    const nameValidation = validateName(name)
    const passwordValidation = validatePassword(password)
    const isEmailValid = validateEmail(email)

    const newErrors: typeof errors = {}

    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.message
    }

    if (!isEmailValid) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: userType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      // Redirect to login page on success
      router.push('/login?registered=true')
    } catch (error) {
      setErrors({
        email: error instanceof Error ? error.message : 'Registration failed',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Select
              id="userType"
              name="userType"
              label="Register as"
              options={userTypeOptions}
              defaultValue="customer"
            />

            <Input
              id="name"
              name="name"
              type="text"
              label="Full Name"
              autoComplete="name"
              required
              error={errors.name}
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
              autoComplete="new-password"
              required
              error={errors.password}
              helperText={!errors.password && "Password must be at least 8 characters long with uppercase, lowercase, and numbers"}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
} 