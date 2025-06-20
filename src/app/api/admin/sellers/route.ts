import { NextResponse } from 'next/server'
import { getCassandraClient } from '@/lib/db/cassandra'
import { v4 as uuidv4 } from 'uuid'
import { hash } from 'bcryptjs'
import { types } from 'cassandra-driver'

// GET /api/admin/sellers
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'business_name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    const client = await getCassandraClient()
    // Ensure we're using the correct keyspace
    await client.execute('USE indiaseller3')

    let query = 'SELECT * FROM sellers'
    let conditions = []
    let params = []

    if (search) {
      conditions.push('(business_name LIKE ? OR email LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }

    if (status) {
      conditions.push('status = ?')
      params.push(status)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ') + ' ALLOW FILTERING'
    }

    const result = await client.execute(query, params, { prepare: true })
    
    // Manual sorting since Cassandra doesn't support ORDER BY without partition key
    let sellers = result.rows
    sellers.sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      }
      return aValue < bValue ? 1 : -1
    })

    const total = sellers.length
    sellers = sellers.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      sellers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching sellers:', error)
    return NextResponse.json({ error: 'Failed to fetch sellers' }, { status: 500 })
  }
}

// POST /api/admin/sellers
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const now = new Date()
    const sellerId = types.Uuid.random()

    // Start a batch operation
    const batch = []

    // Create user account
    const hashedPassword = await hash(data.password, 12)
    batch.push({
      query: `
        INSERT INTO users (
          id, email, password, role, name,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      params: [
        sellerId,
        data.email,
        hashedPassword,
        'seller',
        data.name,
        now,
        now
      ]
    })

    // Create seller record
    batch.push({
      query: `
        INSERT INTO sellers (
          id, name, email, phone, profile_image_url,
          business_name, gstin, pan, bank_name,
          account_number, ifsc_code, is_product_seller,
          is_service_seller, business_category, product_types,
          profession, service_category, service_description,
          experience_years, available_days, daily_timings,
          pricing_type, pricing_value, service_mode,
          operating_radius, status, kyc_status, top_scorer,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      params: [
        sellerId,
        data.name,
        data.email,
        data.phone,
        data.profile_image_url || null,
        data.business_name,
        data.gstin || null,
        data.pan || null,
        data.bank_name || null,
        data.account_number || null,
        data.ifsc_code || null,
        data.is_product_seller || false,
        data.is_service_seller || false,
        data.business_category || null,
        data.product_types || null,
        data.profession || null,
        data.service_category || null,
        data.service_description || null,
        data.experience_years || null,
        data.available_days || null,
        data.daily_timings || null,
        data.pricing_type || null,
        data.pricing_value || null,
        data.service_mode || null,
        data.operating_radius || null,
        'active',
        'pending',
        0,
        now,
        now
      ]
    })

    // Add documents if provided
    if (data.documents?.length) {
      data.documents.forEach((doc: any) => {
        if (doc.document_type && doc.document_url) {
          batch.push({
            query: `
              INSERT INTO seller_documents (
                seller_id, document_type, document_url,
                created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?)
            `,
            params: [sellerId, doc.document_type, doc.document_url, now, now]
          })
        }
      })
    }

    // Add addresses if provided
    if (data.addresses?.length) {
      data.addresses.forEach((addr: any) => {
        if (addr.address_line1 && addr.city) {
          batch.push({
            query: `
              INSERT INTO seller_addresses (
                seller_id, address_type, address_line1, address_line2,
                city, state, postal_code, country, location_image_url,
                is_default, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            params: [
              sellerId,
              addr.address_type,
              addr.address_line1,
              addr.address_line2 || '',
              addr.city,
              addr.state,
              addr.postal_code,
              addr.country,
              addr.location_image_url || '',
              addr.is_default || false,
              now,
              now
            ]
          })
        }
      })
    }

    // Add gallery items if provided
    if (data.gallery?.length) {
      data.gallery.forEach((item: any) => {
        if (item.image_url) {
          batch.push({
            query: `
              INSERT INTO seller_gallery (
                seller_id, image_url, caption,
                created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?)
            `,
            params: [sellerId, item.image_url, item.caption || '', now, now]
          })
        }
      })
    }

    // Execute all inserts in batch
    await client.batch(batch, { prepare: true })

    return NextResponse.json({
      message: 'Seller created successfully',
      sellerId: sellerId.toString()
    })
  } catch (error) {
    console.error('Error creating seller:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create seller' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/sellers
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updateFields } = body

    if (!id) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 })
    }

    const client = await getCassandraClient()
    // Ensure we're using the correct keyspace
    await client.execute('USE indiaseller3')

    // Get current seller
    const currentSeller = await client.execute(
      'SELECT * FROM sellers WHERE id = ?',
      [id],
      { prepare: true }
    )

    if (currentSeller.rows.length === 0) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    const now = new Date()
    const oldEmail = currentSeller.rows[0].email

    // If email is being updated, check if new email exists
    if (updateFields.email && updateFields.email !== oldEmail) {
      const checkEmail = await client.execute(
        'SELECT * FROM sellers_by_email WHERE email = ?',
        [updateFields.email],
        { prepare: true }
      )

      if (checkEmail.rows.length > 0) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
      }
    }

    // Update sellers table
    const updateQuery = `UPDATE sellers SET ${Object.keys(updateFields)
      .map(field => `${field} = ?`)
      .join(', ')}, updated_at = ? WHERE id = ?`

    await client.execute(
      updateQuery,
      [...Object.values(updateFields), now, id],
      { prepare: true }
    )

    // Update sellers_by_email table if email changed
    if (updateFields.email && updateFields.email !== oldEmail) {
      await client.execute(
        'DELETE FROM sellers_by_email WHERE email = ?',
        [oldEmail],
        { prepare: true }
      )
      await client.execute(
        'INSERT INTO sellers_by_email (email, seller_id) VALUES (?, ?)',
        [updateFields.email, id],
        { prepare: true }
      )
    }

    return NextResponse.json({
      id,
      ...updateFields,
      updated_at: now
    })
  } catch (error) {
    console.error('Error updating seller:', error)
    return NextResponse.json({ error: 'Failed to update seller' }, { status: 500 })
  }
}

// DELETE /api/admin/sellers
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 })
    }

    const client = await getCassandraClient()
    // Ensure we're using the correct keyspace
    await client.execute('USE indiaseller3')

    // Get seller to delete email reference
    const seller = await client.execute(
      'SELECT email FROM sellers WHERE id = ?',
      [id],
      { prepare: true }
    )

    if (seller.rows.length === 0) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    const email = seller.rows[0].email

    // Delete from sellers table
    await client.execute(
      'DELETE FROM sellers WHERE id = ?',
      [id],
      { prepare: true }
    )

    // Delete from sellers_by_email table
    await client.execute(
      'DELETE FROM sellers_by_email WHERE email = ?',
      [email],
      { prepare: true }
    )

    // Delete related records
    await Promise.all([
      client.execute('DELETE FROM seller_documents WHERE seller_id = ?', [id], { prepare: true }),
      client.execute('DELETE FROM seller_addresses WHERE seller_id = ?', [id], { prepare: true }),
      client.execute('DELETE FROM seller_gallery WHERE seller_id = ?', [id], { prepare: true }),
      client.execute('DELETE FROM seller_certifications WHERE seller_id = ?', [id], { prepare: true })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting seller:', error)
    return NextResponse.json({ error: 'Failed to delete seller' }, { status: 500 })
  }
}

// PATCH /api/admin/sellers/bulk
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { ids, updates } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Seller IDs are required' }, { status: 400 })
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const client = await getCassandraClient()
    // Ensure we're using the correct keyspace
    await client.execute('USE indiaseller3')

    const now = new Date()
    const updateQuery = `UPDATE sellers SET ${Object.keys(updates)
      .map(field => `${field} = ?`)
      .join(', ')}, updated_at = ? WHERE id = ?`

    // Update each seller
    await Promise.all(
      ids.map(id =>
        client.execute(
          updateQuery,
          [...Object.values(updates), now, id],
          { prepare: true }
        )
      )
    )

    return NextResponse.json({
      success: true,
      updated: ids.length
    })
  } catch (error) {
    console.error('Error performing bulk update:', error)
    return NextResponse.json({ error: 'Failed to perform bulk update' }, { status: 500 })
  }
} 