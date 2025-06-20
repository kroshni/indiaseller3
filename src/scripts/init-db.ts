import { cassandraClient } from '../lib/db/cassandra'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

async function initDatabase() {
  try {
    // Create keyspace
    await cassandraClient.execute(`
      CREATE KEYSPACE IF NOT EXISTS indiaseller3
      WITH replication = {
        'class': 'SimpleStrategy',
        'replication_factor': 1
      }
    `)

    // Use keyspace
    await cassandraClient.execute('USE indiaseller3')

    // Create users table
    await cassandraClient.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY,
        email text,
        name text,
        password text,
        user_type text,
        created_at timestamp,
        updated_at timestamp
      )
    `)

    // Create admin user if not exists
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const adminId = uuidv4()
    const now = new Date()

    const checkQuery = 'SELECT * FROM users WHERE email = ? AND user_type = ? ALLOW FILTERING'
    const checkResult = await cassandraClient.execute(checkQuery, ['admin@indiaseller.com', 'admin'], { prepare: true })

    if (checkResult.rows.length === 0) {
      const query = `
        INSERT INTO users (id, email, name, user_type, password, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
      const params = [
        adminId,
        'admin@indiaseller.com',
        'Admin User',
        'admin',
        hashedPassword,
        now,
        now
      ]

      await cassandraClient.execute(query, params, { prepare: true })
      console.log('Admin user created successfully')
    } else {
      console.log('Admin user already exists')
    }

    console.log('Database initialization completed successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  } finally {
    await cassandraClient.shutdown()
  }
}

initDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1)) 