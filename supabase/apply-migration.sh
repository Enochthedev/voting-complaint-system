#!/bin/bash

# Script to apply Supabase migrations
# Usage: ./apply-migration.sh <migration-file>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if migration file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: No migration file specified${NC}"
    echo "Usage: ./apply-migration.sh <migration-file>"
    echo "Example: ./apply-migration.sh migrations/001_create_users_table_extension.sql"
    exit 1
fi

MIGRATION_FILE="$1"

# Check if file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}Error: Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}Applying migration: $MIGRATION_FILE${NC}"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}Supabase CLI not found. Please apply the migration manually via the Supabase Dashboard.${NC}"
    echo ""
    echo "Steps:"
    echo "1. Go to your Supabase project dashboard"
    echo "2. Navigate to SQL Editor"
    echo "3. Copy and paste the contents of: $MIGRATION_FILE"
    echo "4. Click 'Run' to execute"
    echo ""
    echo "Or install Supabase CLI: https://supabase.com/docs/guides/cli"
    exit 0
fi

# Apply migration using Supabase CLI
echo -e "${GREEN}Executing migration...${NC}"
supabase db execute --file "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migration applied successfully!${NC}"
    
    # Optionally generate TypeScript types
    echo -e "${YELLOW}Generating TypeScript types...${NC}"
    supabase gen types typescript --local > ../src/types/database.types.ts 2>/dev/null || \
    supabase gen types typescript > ../src/types/database.types.ts 2>/dev/null || \
    echo -e "${YELLOW}Note: Could not auto-generate types. You may need to run 'supabase gen types typescript' manually.${NC}"
    
    echo -e "${GREEN}✓ Done!${NC}"
else
    echo -e "${RED}✗ Migration failed${NC}"
    exit 1
fi
