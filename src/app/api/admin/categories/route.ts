import { NextResponse } from 'next/server'
import { cassandraClient } from '@/lib/db/cassandra'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { v4 as uuidv4 } from 'uuid'
import slugify from 'slugify'

// Helper function to generate slug
function generateSlug(name: string): string {
  return slugify(name, { lower: true, strict: true })
}

// GET /api/admin/categories
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await cassandraClient.execute(
      'SELECT * FROM categories',
      [],
      { prepare: true }
    )

    if (!result || !result.rows) {
      throw new Error('No data returned from database')
    }

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/admin/categories
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { name, description, status } = data

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    const id = uuidv4()
    const slug = generateSlug(name)
    const now = new Date()

    await cassandraClient.execute(
      `
      INSERT INTO categories (
        id, name, slug, description, status,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        name,
        slug,
        description || '',
        status || 'active',
        now,
        now
      ],
      { prepare: true }
    )

    return NextResponse.json({
      id,
      name,
      slug,
      description,
      status,
      created_at: now,
      updated_at: now
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/categories/[id]
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, description = '', status = 'active' } = body

    if (!id || !name) {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 })
    }

    // Generate new slug
    const newSlug = generateSlug(name)

    // Get current category
    const currentCategory = await cassandraClient.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id],
      { prepare: true }
    )

    if (currentCategory.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const now = new Date()

    // Update categories table
    await cassandraClient.execute(
      `UPDATE categories 
       SET name = ?, slug = ?, description = ?, status = ?, updated_at = ?
       WHERE id = ?`,
      [name, newSlug, description, status, now, id],
      { prepare: true }
    )

    return NextResponse.json({
      id,
      name,
      slug: newSlug,
      description,
      status,
      updated_at: now
    })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Get category to check if it exists
    const category = await cassandraClient.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id],
      { prepare: true }
    )

    if (category.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Delete from categories table
    await cassandraClient.execute(
      'DELETE FROM categories WHERE id = ?',
      [id],
      { prepare: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
} 