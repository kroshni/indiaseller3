import { Client } from 'cassandra-driver'

const client = new Client({
  contactPoints: [process.env.CASSANDRA_CONTACT_POINT || 'localhost'],
  localDataCenter: process.env.CASSANDRA_LOCAL_DC || 'datacenter1',
  keyspace: 'indiaseller3',
  credentials: {
    username: process.env.CASSANDRA_USERNAME || 'cassandra',
    password: process.env.CASSANDRA_PASSWORD || 'cassandra',
  },
  protocolOptions: {
    port: 9043  // Updated port
  }
})

export async function initCassandra() {
  try {
    await client.connect()
    console.log('Connected to Cassandra')

    // Create keyspace if it doesn't exist
    await client.execute(`
      CREATE KEYSPACE IF NOT EXISTS indiaseller3
      WITH replication = {
        'class': 'SimpleStrategy',
        'replication_factor': 1
      }
    `)

    // Switch to our keyspace
    await client.execute('USE indiaseller3')

    // Initialize tables
    await initTables()

    return client
  } catch (error) {
    console.error('Error connecting to Cassandra:', error)
    throw error
  }
}

async function initTables() {
  // Users table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY,
      email text,
      name text,
      role text,
      password_hash text,
      created_at timestamp,
      updated_at timestamp
    )
  `)

  // Products table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id uuid PRIMARY KEY,
      seller_id uuid,
      name text,
      description text,
      price decimal,
      category text,
      images list<text>,
      created_at timestamp,
      updated_at timestamp
    )
  `)

  // Categories table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id uuid PRIMARY KEY,
      name text,
      slug text,
      parent_id uuid,
      created_at timestamp,
      updated_at timestamp
    )
  `)

  // Services table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS services (
      id uuid PRIMARY KEY,
      provider_id uuid,
      name text,
      description text,
      category text,
      price_range text,
      location text,
      created_at timestamp,
      updated_at timestamp
    )
  `)
}

// Helper functions for common database operations
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const result = await client.execute(query, params, { prepare: true })
    return result.rows
  } catch (error) {
    console.error('Error executing query:', error)
    throw error
  }
}

export default client 