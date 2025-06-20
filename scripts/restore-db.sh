#!/bin/bash

if [ -z "$1" ]; then
  echo "Please provide the backup file name"
  echo "Usage: ./restore-db.sh <backup_file_name>"
  exit 1
fi

BACKUP_FILE=$1

# Stop Cassandra service
echo "Stopping Cassandra..."
docker stop indiaseller_cassandra

# Clear existing data
echo "Clearing existing data..."
docker exec indiaseller_cassandra rm -rf /var/lib/cassandra/data/indiaseller3/*

# Extract backup
echo "Restoring from backup..."
docker exec indiaseller_cassandra sh -c "cd /var/lib/cassandra/data/indiaseller3 && \
  tar xzf /backups/${BACKUP_FILE}"

# Start Cassandra service
echo "Starting Cassandra..."
docker start indiaseller_cassandra

echo "Restore completed. Please wait a few minutes for Cassandra to start up." 