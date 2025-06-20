import { NextRequest, NextResponse } from 'next/server'
import { cassandraClient as client } from '@/lib/db/cassandra'
import { hash } from 'bcryptjs'
import { types } from 'cassandra-driver'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch seller details
    const sellerResult = await client.execute(
      'SELECT * FROM sellers WHERE id = ?',
      [types.Uuid.fromString(params.id)],
      { prepare: true }
    )
    
    // Fetch seller's documents
    const documentsResult = await client.execute(
      'SELECT * FROM seller_documents WHERE seller_id = ?',
      [types.Uuid.fromString(params.id)],
      { prepare: true }
    )
    
    // Fetch seller's addresses
    const addressesResult = await client.execute(
      'SELECT * FROM seller_addresses WHERE seller_id = ?',
      [types.Uuid.fromString(params.id)],
      { prepare: true }
    )
    
    // Fetch seller's gallery
    const galleryResult = await client.execute(
      'SELECT * FROM seller_gallery WHERE seller_id = ?',
      [types.Uuid.fromString(params.id)],
      { prepare: true }
    )

    if (sellerResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      seller: sellerResult.rows[0],
      documents: documentsResult.rows,
      addresses: addressesResult.rows,
      gallery: galleryResult.rows
    })
  } catch (error) {
    console.error('Error fetching seller:', error)
    return NextResponse.json(
      { error: 'Failed to fetch seller details' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const now = new Date()
    const sellerId = types.Uuid.fromString(params.id)
    
    // Start a batch operation
    const batch = []
    
    // Update seller details
    const sellerFields = [
      'name',
      'email',
      'phone',
      'profile_image_url',
      'business_name',
      'gstin',
      'pan',
      'bank_name',
      'account_number',
      'ifsc_code',
      'is_product_seller',
      'is_service_seller',
      'business_category',
      'product_types',
      'profession',
      'service_category',
      'service_description',
      'experience_years',
      'available_days',
      'daily_timings',
      'pricing_type',
      'pricing_value',
      'service_mode',
      'operating_radius',
      'updated_at'
    ]

    const updateFields = sellerFields
      .filter(field => data[field] !== undefined || field === 'updated_at')
      .map(field => `${field} = ?`)
      .join(', ')

    const updateValues = sellerFields
      .filter(field => data[field] !== undefined || field === 'updated_at')
      .map(field => field === 'updated_at' ? now : data[field])

    batch.push({
      query: `UPDATE sellers SET ${updateFields} WHERE id = ?`,
      params: [...updateValues, sellerId]
    })

    // Update user record if password is changed
    if (data.password && data.password.trim()) {
      const hashedPassword = await hash(data.password, 12)
      batch.push({
        query: 'UPDATE users SET password = ?, updated_at = ? WHERE email = ?',
        params: [hashedPassword, now, data.email]
      })
    }

    // Update documents
    if (data.documents) {
      // Delete existing documents
      batch.push({
        query: 'DELETE FROM seller_documents WHERE seller_id = ?',
        params: [sellerId]
      })

      // Insert new documents
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

    // Update addresses
    if (data.addresses) {
      // Delete existing addresses
      batch.push({
        query: 'DELETE FROM seller_addresses WHERE seller_id = ?',
        params: [sellerId]
      })

      // Insert new addresses
      data.addresses.forEach((addr: any) => {
        if (addr.address_line1 && addr.city) {
          batch.push({
            query: `
              INSERT INTO seller_addresses (
                seller_id, address_type, address_line1, address_line2,
                city, state, postal_code, country, location_image_url, is_default,
                created_at, updated_at
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

    // Update gallery
    if (data.gallery) {
      // Delete existing gallery items
      batch.push({
        query: 'DELETE FROM seller_gallery WHERE seller_id = ?',
        params: [sellerId]
      })

      // Insert new gallery items
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

    // Execute all updates in batch
    await client.batch(batch, { prepare: true })

    return NextResponse.json({ message: 'Seller updated successfully' })
  } catch (error) {
    console.error('Error updating seller:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update seller' },
      { status: 500 }
    )
  }
} 