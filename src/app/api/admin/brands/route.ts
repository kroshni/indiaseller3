import { NextResponse } from 'next/server'
import { getCassandraClient } from '@/lib/db/cassandra'
import { v4 as uuidv4 } from 'uuid'

// GET /api/admin/brands
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const client = await getCassandraClient()
    let query = 'SELECT * FROM brands'
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
    const body = await request.json()
    const { name, logo_url = '', description = '', website_url = '', status = 'active' } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Check if brand name already exists
    const checkName = await cassandraClient.execute(
      'SELECT * FROM brands_by_name WHERE name = ?',
      [name],
      { prepare: true }
    )

    if (checkName.rows.length > 0) {
      return NextResponse.json({ error: 'Brand with this name already exists' }, { status: 400 })
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

    // Insert into brands_by_name table
    await cassandraClient.execute(
      'INSERT INTO brands_by_name (name, brand_id) VALUES (?, ?)',
      [name, id],
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

// PUT /api/admin/brands
export async function PUT(request: Request) {
  try {
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

    const oldName = currentBrand.rows[0].name

    // Check if new name already exists (if name changed)
    if (name !== oldName) {
      const checkName = await cassandraClient.execute(
        'SELECT * FROM brands_by_name WHERE name = ?',
        [name],
        { prepare: true }
      )

      if (checkName.rows.length > 0) {
        return NextResponse.json({ error: 'Brand with this name already exists' }, { status: 400 })
      }
    }

    // Update brands table
    await cassandraClient.execute(
      `UPDATE brands 
       SET name = ?, logo_url = ?, description = ?, website_url = ?, status = ?, updated_at = ?
       WHERE id = ?`,
      [name, logo_url, description, website_url, status, now, id],
      { prepare: true }
    )

    // Update brands_by_name table
    if (name !== oldName) {
      await cassandraClient.execute(
        'DELETE FROM brands_by_name WHERE name = ?',
        [oldName],
        { prepare: true }
      )
      await cassandraClient.execute(
        'INSERT INTO brands_by_name (name, brand_id) VALUES (?, ?)',
        [name, id],
        { prepare: true }
      )
    }

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

// DELETE /api/admin/brands
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Get brand to delete its name reference
    const brand = await cassandraClient.execute(
      'SELECT name FROM brands WHERE id = ?',
      [id],
      { prepare: true }
    )

    if (brand.rows.length === 0) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
    }

    const name = brand.rows[0].name

    // Delete from brands table
    await cassandraClient.execute(
      'DELETE FROM brands WHERE id = ?',
      [id],
      { prepare: true }
    )

    // Delete from brands_by_name table
    await cassandraClient.execute(
      'DELETE FROM brands_by_name WHERE name = ?',
      [name],
      { prepare: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting brand:', error)
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 })
  }
} 