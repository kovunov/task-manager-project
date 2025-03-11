#!/bin/bash
set -e

echo "Waiting for PostgreSQL to start..."
until pg_isready -h localhost -p 5432; do
  sleep 1
done

# Connect as postgres superuser first
psql -v ON_ERROR_STOP=1 --username "postgres" --dbname "$POSTGRES_DB" <<-EOSQL
    DO \$\$ 
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$POSTGRES_USER') THEN
            CREATE ROLE $POSTGRES_USER WITH LOGIN SUPERUSER PASSWORD '$POSTGRES_PASSWORD';
        END IF;
    END
    \$\$;
    
    CREATE DATABASE $POSTGRES_DB WITH OWNER $POSTGRES_USER;
    
    GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
EOSQL

echo "Database initialization completed"