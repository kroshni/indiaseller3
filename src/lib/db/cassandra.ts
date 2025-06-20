import { Client } from 'cassandra-driver'

// Create Cassandra client with minimal configuration
export const cassandraClient = new Client({
  contactPoints: ['127.0.0.1:9042'],
  localDataCenter: 'datacenter1',
  keyspace: 'indiaseller3',  // Set default keyspace
  credentials: {
    username: 'cassandra',
    password: 'cassandra'
  },
  queryOptions: {
    prepare: true,
    isIdempotent: true
  },
  pooling: {
    maxRequestsPerConnection: 1024
  },
  socketOptions: {
    readTimeout: 10000
  },
  // Explicitly disable optional features
  sslOptions: undefined,
  encoding: {
    useUndefinedAsUnset: true,
    copyBuffer: false
  },
  // Prevent loading of optional modules
  isMetadataSyncEnabled: false
})

// Initialize connection and keyspace
async function initCassandra() {
  try {
    await cassandraClient.connect()
    console.log('Connected to Cassandra')

    // Create keyspace if it doesn't exist
    // We need to create this without being connected to a keyspace
    const systemClient = new Client({
      contactPoints: ['127.0.0.1:9042'],
      localDataCenter: 'datacenter1',
      credentials: {
        username: 'cassandra',
        password: 'cassandra'
      }
    })

    await systemClient.connect()
    
    await systemClient.execute(`
      CREATE KEYSPACE IF NOT EXISTS indiaseller3
      WITH replication = {
        'class': 'SimpleStrategy',
        'replication_factor': 1
      }
    `)

    await systemClient.shutdown()

    // Initialize tables
    await initTables()
    console.log('Tables initialized successfully')
  } catch (error) {
    console.error('Error initializing Cassandra:', error)
    throw error
  }
}

async function initTables() {
  try {
    // Create users table
    await cassandraClient.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid,
        email text,
        name text,
        user_type text,
        password text,
        created_at timestamp,
        updated_at timestamp,
        PRIMARY KEY (id)
      )
    `)
    console.log('Users table created/verified')

    // Wait a bit to ensure table is fully created
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create indices
    await cassandraClient.execute(`
      CREATE INDEX IF NOT EXISTS users_email_idx ON users (email)
    `)
    console.log('Email index created/verified')

    await cassandraClient.execute(`
      CREATE INDEX IF NOT EXISTS users_type_idx ON users (user_type)
    `)
    console.log('User type index created/verified')

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
    console.log('Categories table created/verified')

    // Create category indices
    await cassandraClient.execute(`
      CREATE INDEX IF NOT EXISTS categories_slug_idx ON categories (slug)
    `)
    await cassandraClient.execute(`
      CREATE INDEX IF NOT EXISTS categories_status_idx ON categories (status)
    `)
    console.log('Category indices created/verified')

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
    console.log('Brands table created/verified')

    // Create brand indices
    await cassandraClient.execute(`
      CREATE INDEX IF NOT EXISTS brands_status_idx ON brands (status)
    `)
    console.log('Brand indices created/verified')

  } catch (error) {
    console.error('Error creating tables:', error)
    throw error
  }
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