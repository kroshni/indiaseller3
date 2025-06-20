import { cassandraClient } from './cassandra'

export async function initializeDatabase() {
  try {
    // Create keyspace if not exists
    await cassandraClient.execute(`
      CREATE KEYSPACE IF NOT EXISTS indiaseller3
      WITH replication = {
        'class': 'SimpleStrategy',
        'replication_factor': 1
      }
    `)

    // Use the keyspace
    await cassandraClient.execute('USE indiaseller3')

    // Create users table
    await cassandraClient.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid,
        email text,
        name text,
        password text,
        user_type text,
        created_at timestamp,
        updated_at timestamp,
        PRIMARY KEY (id)
      )
    `)

    // Create email index for users
    await cassandraClient.execute(`
      CREATE INDEX IF NOT EXISTS users_email_idx ON users (email)
    `)

    // Create user type index for users
    await cassandraClient.execute(`
      CREATE INDEX IF NOT EXISTS users_type_idx ON users (user_type)
    `)

    // Create categories table
    await cassandraClient.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id uuid,
        name text,
        slug text,
        description text,
        status text,
        created_at timestamp,
        updated_at timestamp,
        PRIMARY KEY (id)
      )
    `)

    // Create slug index for categories
    await cassandraClient.execute(`
      CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories (slug)
    `)

    // Create status index for categories
    await cassandraClient.execute(`
      CREATE INDEX IF NOT EXISTS categories_status_idx ON categories (status)
    `)

    // Create brands table
    await cassandraClient.execute(`
      CREATE TABLE IF NOT EXISTS brands (
        id uuid,
        name text,
        logo_url text,
        description text,
        website_url text,
        status text,
        created_at timestamp,
        updated_at timestamp,
        PRIMARY KEY (id)
      )
    `)

    // Create status index for brands
    await cassandraClient.execute(`
      CREATE INDEX IF NOT EXISTS brands_status_idx ON brands (status)
    `)

    // Create name index for brands
    await cassandraClient.execute(`
      CREATE INDEX IF NOT EXISTS brands_name_idx ON brands (name)
    `)

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  } finally {
    // Don't shut down the client here as it's used by other parts of the application
  }
}

export default {
  initializeDatabase
} 