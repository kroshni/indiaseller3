import { v4 as uuidv4 } from 'uuid'
import { executeQuery } from './cassandra'

// User related functions
export async function createUser(userData: {
  email: string
  name: string
  role: string
  password_hash: string
}) {
  const id = uuidv4()
  const now = new Date().toISOString()
  
  const query = `
    INSERT INTO users (id, email, name, role, password_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `
  const params = [id, userData.email, userData.name, userData.role, userData.password_hash, now, now]
  
  await executeQuery(query, params)
  return { id, ...userData, created_at: now, updated_at: now }
}

export async function getUserByEmail(email: string) {
  const query = 'SELECT * FROM users WHERE email = ? ALLOW FILTERING'
  const results = await executeQuery(query, [email])
  return results[0]
}

export async function getUserById(id: string) {
  const query = 'SELECT * FROM users WHERE id = ?'
  const results = await executeQuery(query, [id])
  return results[0]
}

// Product related functions
export async function createProduct(productData: {
  seller_id: string
  name: string
  description: string
  price: number
  category: string
  images?: string[]
}) {
  const id = uuidv4()
  const now = new Date().toISOString()
  
  const query = `
    INSERT INTO products (id, seller_id, name, description, price, category, images, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  const params = [
    id,
    productData.seller_id,
    productData.name,
    productData.description,
    productData.price,
    productData.category,
    productData.images || [],
    now,
    now
  ]
  
  await executeQuery(query, params)
  return { id, ...productData, created_at: now, updated_at: now }
}

export async function getProductById(id: string) {
  const query = 'SELECT * FROM products WHERE id = ?'
  const results = await executeQuery(query, [id])
  return results[0]
}

export async function getProductsBySeller(sellerId: string) {
  const query = 'SELECT * FROM products WHERE seller_id = ? ALLOW FILTERING'
  return await executeQuery(query, [sellerId])
}

// Category related functions
export async function createCategory(categoryData: {
  name: string
  slug: string
  parent_id?: string
}) {
  const id = uuidv4()
  const now = new Date().toISOString()
  
  const query = `
    INSERT INTO categories (id, name, slug, parent_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `
  const params = [id, categoryData.name, categoryData.slug, categoryData.parent_id || null, now, now]
  
  await executeQuery(query, params)
  return { id, ...categoryData, created_at: now, updated_at: now }
}

export async function getCategoryById(id: string) {
  const query = 'SELECT * FROM categories WHERE id = ?'
  const results = await executeQuery(query, [id])
  return results[0]
}

export async function getAllCategories() {
  const query = 'SELECT * FROM categories'
  return await executeQuery(query, [])
}

// Service related functions
export async function createService(serviceData: {
  provider_id: string
  name: string
  description: string
  category: string
  price_range: string
  location: string
}) {
  const id = uuidv4()
  const now = new Date().toISOString()
  
  const query = `
    INSERT INTO services (id, provider_id, name, description, category, price_range, location, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  const params = [
    id,
    serviceData.provider_id,
    serviceData.name,
    serviceData.description,
    serviceData.category,
    serviceData.price_range,
    serviceData.location,
    now,
    now
  ]
  
  await executeQuery(query, params)
  return { id, ...serviceData, created_at: now, updated_at: now }
}

export async function getServiceById(id: string) {
  const query = 'SELECT * FROM services WHERE id = ?'
  const results = await executeQuery(query, [id])
  return results[0]
}

export async function getServicesByProvider(providerId: string) {
  const query = 'SELECT * FROM services WHERE provider_id = ? ALLOW FILTERING'
  return await executeQuery(query, [providerId])
} 