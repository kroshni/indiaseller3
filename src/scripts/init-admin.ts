import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import cassandraClient from '../lib/db/cassandra'

async function createAdminUser() {
  try {
    // Wait for connection
    await cassandraClient.connect()
    console.log('Connected to Cassandra')

    // Initialize keyspace
    await cassandraClient.execute(`
      CREATE KEYSPACE IF NOT EXISTS indiaseller3
      WITH replication = {
        'class': 'SimpleStrategy',
        'replication_factor': 1
      }
    `)
    console.log('Keyspace created/verified')

    // Use the keyspace
    await cassandraClient.execute('USE indiaseller3')
    console.log('Using keyspace')

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

    // Wait a bit to ensure indices are ready
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check if admin already exists
    const result = await cassandraClient.execute(
      'SELECT * FROM users WHERE email = ? ALLOW FILTERING',
      ['admin@indiaseller.com']
    )

    if (result.rows.length > 0) {
      console.log('Admin user already exists')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10)

    // Create admin user
    const userId = uuidv4()
    const now = new Date()

    await cassandraClient.execute(`
      INSERT INTO users (
        id, email, name, user_type, password, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      'admin@indiaseller.com',
      'Admin User',
      'admin',
      hashedPassword,
      now,
      now
    ], { prepare: true })

    console.log('Admin user created successfully')
  } catch (error) {
    console.error('Error creating admin user:', error)
    throw error
  } finally {
    // Close the client connection
    await cassandraClient.shutdown()
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('Admin initialization complete')
    process.exit(0)
  })
  .catch(err => {
    console.error('Failed to initialize admin:', err)
    process.exit(1)
  }) 