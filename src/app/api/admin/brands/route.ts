import { NextResponse } from 'next/server'
import { cassandraClient } from '@/lib/db/cassandra'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { v4 as uuidv4 } from 'uuid'

// GET /api/admin/brands
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''

    let query = 'SELECT * FROM brands'
    let params: any[] = []

    if (status) {
      query += ' WHERE status = ? ALLOW FILTERING'
      params.push(status)
    }

    const result = await cassandraClient.execute(query, params, { prepare: true })
    const total = result.rows.length
    const brands = result.rows.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      brands,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching brands:', error)
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 })
  }
}

// POST /api/admin/brands
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, logo_url = '', description = '', website_url = '', status = 'active' } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const id = uuidv4()
    const now = new Date()

    // Insert into brands table
    await cassandraClient.execute(
      `INSERT INTO brands (id, name, logo_url, description, website_url, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, logo_url, description, website_url, status, now, now],
      { prepare: true }
    )

    return NextResponse.json({
      id,
      name,
      logo_url,
      description,
      website_url,
      status,
      created_at: now,
      updated_at: now
    })
  } catch (error) {
    console.error('Error creating brand:', error)
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 })
  }
}

// PUT /api/admin/brands/[id]
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, logo_url, description, website_url, status } = body

    if (!id || !name) {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 })
    }

    const now = new Date()

    // Get current brand
    const currentBrand = await cassandraClient.execute(
      'SELECT * FROM brands WHERE id = ?',
      [id],
      { prepare: true }
    )

    if (currentBrand.rows.length === 0) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    // Update brands table
    await cassandraClient.execute(
      `UPDATE brands 
       SET name = ?, logo_url = ?, description = ?, website_url = ?, status = ?, updated_at = ?
       WHERE id = ?`,
      [name, logo_url, description, website_url, status, now, id],
      { prepare: true }
    )

    return NextResponse.json({
      id,
      name,
      logo_url,
      description,
      website_url,
      status,
      updated_at: now
    })
  } catch (error) {
    console.error('Error updating brand:', error)
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 })
  }
}

// DELETE /api/admin/brands/[id]
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

    // Get brand to check if it exists
    const brand = await cassandraClient.execute(
      'SELECT * FROM brands WHERE id = ?',
      [id],
      { prepare: true }
    )

    if (brand.rows.length === 0) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    // Delete from brands table
    await cassandraClient.execute(
      'DELETE FROM brands WHERE id = ?',
      [id],
      { prepare: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting brand:', error)
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 })
  }
} 