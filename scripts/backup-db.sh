#!/bin/bash

# Get current date for backup file name
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="indiaseller_backup_${BACKUP_DATE}"

# Create backup directory if it doesn't exist
mkdir -p backups

# Create a snapshot of the database
echo "Creating snapshot..."
docker exec indiaseller_cassandra nodetool snapshot indiaseller3 -t $BACKUP_NAME

# Copy the snapshot to the backup directory
echo "Copying snapshot to backup directory..."
docker exec indiaseller_cassandra sh -c "cd /var/lib/cassandra/data/indiaseller3 && \
  tar czf /backups/${BACKUP_NAME}.tar.gz */snapshots/${BACKUP_NAME}"

# Clean up the snapshot
echo "Cleaning up snapshot..."
docker exec indiaseller_cassandra nodetool clearsnapshot -t $BACKUP_NAME

echo "Backup completed: backups/${BACKUP_NAME}.tar.gz" 