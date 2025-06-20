import { Client } from 'cassandra-driver'

// Create Cassandra client with minimal configuration
export const cassandraClient = new Client({
  contactPoints: ['127.0.0.1:9042'],
  localDataCenter: 'datacenter1',
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
    await cassandraClient.execute(`
      CREATE KEYSPACE IF NOT EXISTS indiaseller3
      WITH replication = {
        'class': 'SimpleStrategy',
        'replication_factor': 1
      }
    `)

    // Switch to our keyspace
    await cassandraClient.execute('USE indiaseller3')
    console.log('Using keyspace: indiaseller3')

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