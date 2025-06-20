import { Client } from 'cassandra-driver'

export const cassandraClient = new Client({
  contactPoints: ['127.0.0.1:9042'],
  localDataCenter: 'datacenter1',
  credentials: {
    username: 'cassandra',
    password: 'cassandra'
  }
})

// Initialize connection and keyspace
async function initCassandra() {
  try {
    await cassandraClient.connect()
    console.log('Connected to Cassandra')

    // Create keyspace if it doesn't exist
    await cassandraClient.execute(`
      CREATE KEYSPACE IF NOT EXISTS indiaseller3
      WITH replication = {
        'class': 'SimpleStrategy',
        'replication_factor': 1
      }
    `)

    // Switch to our keyspace
    await cassandraClient.execute('USE indiaseller3')

    // Initialize tables
    await initTables()
  } catch (error) {
    console.error('Error initializing Cassandra:', error)
    throw error
  }
}

async function initTables() {
  // Users table
  await cassandraClient.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY,
      email text,
      name text,
      user_type text,
      password text,
      created_at timestamp,
      updated_at timestamp
    )
  `)

  // Products table
  await cassandraClient.execute(`
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
  await cassandraClient.execute(`
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
  await cassandraClient.execute(`
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

// Initialize Cassandra on startup
initCassandra()
  .then(() => console.log('Cassandra initialized successfully'))
  .catch(err => console.error('Failed to initialize Cassandra:', err))

// Handle process termination
process.on('SIGTERM', () => {
  cassandraClient.shutdown()
    .then(() => process.exit(0))
})

export default cassandraClient 