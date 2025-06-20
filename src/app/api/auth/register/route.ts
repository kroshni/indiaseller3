import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db/cassandra'
import { randomUUID } from 'crypto'
// In a real application, use a proper password hashing library like bcrypt
// import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, role } = body

    // Basic validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUsers = await executeQuery(
      'SELECT email FROM users WHERE email = ? ALLOW FILTERING',
      [email]
    )

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      )
    }

    // In a real application, hash the password
    // const hashedPassword = await bcrypt.hash(password, 10)
    const hashedPassword = password // TODO: Replace with proper hashing

    // Create new user
    const userId = randomUUID()
    const now = new Date()

    await executeQuery(
      `INSERT INTO users (
        id,
        email,
        name,
        role,
        password_hash,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        email,
        name,
        role,
        hashedPassword,
        now,
        now,
      ]
    )

    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 