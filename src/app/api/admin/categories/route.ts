import { NextResponse } from 'next/server'
import { getCassandraClient } from '@/lib/db/cassandra'
import { v4 as uuidv4 } from 'uuid'
import slugify from 'slugify'

// GET /api/admin/categories
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const client = await getCassandraClient()
    // Ensure we're using the correct keyspace
    await client.execute('USE indiaseller3')

    let query = 'SELECT * FROM categories'
    let conditions = []
    let params = []

    if (search) {
      conditions.push('name LIKE ?')
      params.push(`%${search}%`)
    }

    if (status) {
      conditions.push('status = ?')
      params.push(status)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ') + ' ALLOW FILTERING'
    }

    const result = await client.execute(query, params, { prepare: true })
    const total = result.rows.length
    const categories = result.rows.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// POST /api/admin/categories
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description = '', status = 'active' } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const client = await getCassandraClient()
    // Ensure we're using the correct keyspace
    await client.execute('USE indiaseller3')

    // Generate slug
    const slug = slugify(name, { lower: true, strict: true })

    // Check if slug already exists
    const checkSlug = await client.execute(
      'SELECT * FROM categories_by_slug WHERE slug = ?',
      [slug],
      { prepare: true }
    )

    if (checkSlug.rows.length > 0) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 400 })
    }

    const id = uuidv4()
    const now = new Date()

    // Insert into categories table
    await client.execute(
      `INSERT INTO categories (id, name, slug, description, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, slug, description, status, now, now],
      { prepare: true }
    )

    // Insert into categories_by_slug table
    await client.execute(
      'INSERT INTO categories_by_slug (slug, category_id) VALUES (?, ?)',
      [slug, id],
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
    })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

// PUT /api/admin/categories
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, description = '', status = 'active' } = body

    if (!id || !name) {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 })
    }

    const client = await getCassandraClient()
    // Ensure we're using the correct keyspace
    await client.execute('USE indiaseller3')

    // Generate new slug
    const newSlug = slugify(name, { lower: true, strict: true })

    // Get current category
    const currentCategory = await client.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id],
      { prepare: true }
    )

    if (currentCategory.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const oldSlug = currentCategory.rows[0].slug

    // Check if new slug already exists (if name changed)
    if (newSlug !== oldSlug) {
      const checkSlug = await client.execute(
        'SELECT * FROM categories_by_slug WHERE slug = ?',
        [newSlug],
        { prepare: true }
      )

      if (checkSlug.rows.length > 0) {
        return NextResponse.json({ error: 'Category with this name already exists' }, { status: 400 })
      }
    }

    const now = new Date()

    // Update categories table
    await client.execute(
      `UPDATE categories 
       SET name = ?, slug = ?, description = ?, status = ?, updated_at = ?
       WHERE id = ?`,
      [name, newSlug, description, status, now, id],
      { prepare: true }
    )

    // Update categories_by_slug table
    if (newSlug !== oldSlug) {
      await client.execute(
        'DELETE FROM categories_by_slug WHERE slug = ?',
        [oldSlug],
        { prepare: true }
      )
      await client.execute(
        'INSERT INTO categories_by_slug (slug, category_id) VALUES (?, ?)',
        [newSlug, id],
        { prepare: true }
      )
    }

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

// DELETE /api/admin/categories
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const client = await getCassandraClient()
    // Ensure we're using the correct keyspace
    await client.execute('USE indiaseller3')

    // Get category to delete its slug reference
    const category = await client.execute(
      'SELECT slug FROM categories WHERE id = ?',
      [id],
      { prepare: true }
    )

    if (category.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const slug = category.rows[0].slug

    // Delete from categories table
    await client.execute(
      'DELETE FROM categories WHERE id = ?',
      [id],
      { prepare: true }
    )

    // Delete from categories_by_slug table
    await client.execute(
      'DELETE FROM categories_by_slug WHERE slug = ?',
      [slug],
      { prepare: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
} 