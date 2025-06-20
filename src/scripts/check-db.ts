import { initCassandra } from '../lib/db/cassandra'

async function checkConnection() {
  try {
    console.log('Attempting to connect to Cassandra...')
    const client = await initCassandra()
    console.log('Successfully connected to Cassandra!')
    
    // Test query
    const result = await client.execute('SELECT release_version FROM system.local')
    console.log('Cassandra version:', result.first().release_version)
    
    await client.shutdown()
    console.log('Connection closed successfully')
  } catch (error) {
    console.error('Error connecting to Cassandra:', error)
  }
}

checkConnection() 