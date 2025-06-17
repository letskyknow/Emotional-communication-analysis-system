#!/bin/sh

echo "Waiting for PostgreSQL to be ready..."

# Extract database connection info from DATABASE_URL
if [ -n "$DATABASE_URL" ]; then
  # Parse DATABASE_URL format: postgresql://user:password@host:port/database
  DB_HOST=$(echo $DATABASE_URL | sed -E 's/.*@([^:]+):.*/\1/')
  DB_PORT=$(echo $DATABASE_URL | sed -E 's/.*:([0-9]+)\/.*/\1/')
  DB_USER=$(echo $DATABASE_URL | sed -E 's/.*\/\/([^:]+):.*/\1/')
  DB_PASS=$(echo $DATABASE_URL | sed -E 's/.*\/\/[^:]+:([^@]+)@.*/\1/')
  DB_NAME=$(echo $DATABASE_URL | sed -E 's/.*\/([^?]+).*/\1/')
else
  DB_HOST=${DATABASE_HOST:-postgres}
  DB_PORT=${DATABASE_PORT:-5432}
  DB_USER=${POSTGRES_USER:-emotion_user}
  DB_PASS=${POSTGRES_PASSWORD:-emotion_pass}
  DB_NAME=${POSTGRES_DB:-emotion_db}
fi

MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1" > /dev/null 2>&1; then
    echo "PostgreSQL is ready!"
    break
  else
    echo "Waiting for PostgreSQL... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT + 1))
  fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "Failed to connect to PostgreSQL after $MAX_RETRIES attempts"
  exit 1
fi

# Check if database is already initialized
if PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1 FROM users LIMIT 1" > /dev/null 2>&1; then
  echo "Database already initialized, skipping seed..."
else
  echo "First time setup, seeding database..."
  npm run seed
fi

echo "Database initialization completed!"