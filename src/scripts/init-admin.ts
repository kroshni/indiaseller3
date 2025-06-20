import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import { cassandraClient } from '@/lib/db/cassandra'

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const checkQuery = 'SELECT * FROM users WHERE email = ? AND user_type = ? ALLOW FILTERING'
    const checkResult = await cassandraClient.execute(checkQuery, ['admin@indiaseller.com', 'admin'], { prepare: true })

    if (checkResult.rows.length > 0) {
      console.log('Admin user already exists')
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const userId = uuidv4()
    const now = new Date()

    const query = `
      INSERT INTO users (id, email, name, user_type, password, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    const params = [
      userId,
      'admin@indiaseller.com',
      'Admin User',
      'admin',
      hashedPassword,
      now,
      now
    ]

    await cassandraClient.execute(query, params, { prepare: true })
    console.log('Admin user created successfully')
  } catch (error) {
    console.error('Error creating admin user:', error)
    throw error
  }
}

// Run the script
createAdminUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to create admin user:', error)
    process.exit(1)
  }) 