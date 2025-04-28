#!/bin/bash

# Load environment variables
source .env

# Create database
echo "Creating database..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" || true

# Run migrations
echo "Running migrations..."
for file in $(ls src/db/migrations/*.sql | sort); do
    echo "Running $file..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f $file
done 