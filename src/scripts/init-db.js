const { Client } = require('cassandra-driver');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const client = new Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1',
  credentials: {
    username: 'cassandra',
    password: 'cassandra'
  },
  protocolOptions: {
    port: 9043
  }
});

async function initDatabase() {
  try {
    await client.connect();
    console.log('Connected to Cassandra');

    // Create keyspace
    await client.execute(`
      CREATE KEYSPACE IF NOT EXISTS indiaseller3
      WITH replication = {
        'class': 'SimpleStrategy',
        'replication_factor': 1
      }
    `);

    console.log('Created keyspace');

    // Use keyspace
    await client.execute('USE indiaseller3');

    // Create users table
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
    `);

    console.log('Created users table');

    // Create admin user
    const id = uuidv4();
    const now = new Date().toISOString();
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const query = `
      INSERT INTO users (id, email, name, role, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      id,
      'admin@indiaseller.com',
      'Admin User',
      'admin',
      hashedPassword,
      now,
      now
    ];

    await client.execute(query, params, { prepare: true });
    console.log('Admin user created successfully');
    console.log('Admin credentials:');
    console.log('Email: admin@indiaseller.com');
    console.log('Password: admin123');

    await client.shutdown();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

initDatabase(); 