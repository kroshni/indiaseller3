import { NextRequest, NextResponse } from 'next/server'
import { cassandraClient } from '@/lib/db/cassandra'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { types } from 'cassandra-driver'

// Helper function to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// GET /api/admin/categories/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await cassandraClient.execute(
      'SELECT * FROM categories WHERE id = ?',
      [types.Uuid.fromString(params.id)],
      { prepare: true }
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/categories/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const slug = generateSlug(name)
    const now = new Date()

    await cassandraClient.execute(
      `
      UPDATE categories
      SET name = ?, slug = ?, description = ?,
          status = ?, updated_at = ?
      WHERE id = ?
      `,
      [
        name,
        slug,
        description || '',
        status || 'active',
        now,
        types.Uuid.fromString(params.id)
      ],
      { prepare: true }
    )

    // Fetch updated category
    const result = await cassandraClient.execute(
      'SELECT * FROM categories WHERE id = ?',
      [types.Uuid.fromString(params.id)],
      { prepare: true }
    )

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await cassandraClient.execute(
      'DELETE FROM categories WHERE id = ?',
      [types.Uuid.fromString(params.id)],
      { prepare: true }
    )

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
} 