#!/bin/bash

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "Error: psql command not found. Please install PostgreSQL client tools."
    exit 1
fi

# Check for required environment variables
if [[ -z "$SUPABASE_DB_URL" ]]; then
    echo "Error: SUPABASE_DB_URL environment variable is not set."
    echo "Please set it with your Supabase database connection string."
    echo "Example: postgresql://postgres:yourpassword@db.yourproject.supabase.co:5432/postgres"
    exit 1
fi

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up UPA Summer Championships database...${NC}"

# Function to run SQL files
run_sql_file() {
    local file=$1
    echo -e "${GREEN}Running ${file}...${NC}"
    psql "$SUPABASE_DB_URL" -f "$file"
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}Warning: There was an error running ${file}${NC}"
    fi
}

# Run initialization script
echo -e "${YELLOW}Initializing database schema...${NC}"
run_sql_file "$(dirname "$0")/init-db.sql"

# Ask if user wants to seed with sample data
read -p "Do you want to seed the database with sample data? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Seeding database with sample data...${NC}"
    run_sql_file "$(dirname "$0")/seed-db.sql"
    echo -e "${GREEN}✓ Database seeded successfully!${NC}"
else
    echo -e "${YELLOW}Skipping data seeding.${NC}"
fi

echo -e "${GREEN}✓ Database setup complete!${NC}"
echo "You can now start the application with 'npm run dev'"
