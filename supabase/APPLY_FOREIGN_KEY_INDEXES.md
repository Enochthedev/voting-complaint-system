# Apply Foreign Key Indexes Migration

## Quick Apply Instructions

### Step 1: Open Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `tnenutksxxdhamlyogto`
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Migration

1. Click **New Query**
2. Copy the entire contents of `migrations/016_add_foreign_key_indexes.sql`
3. Paste into the SQL Editor
4. Click **Run** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)

### Step 3: Verify Success

You should see:
```
Success. No rows returned
```

This means the index was created successfully!

### Step 4: Verify All Foreign Keys Have Indexes

Run the verification script to confirm all foreign keys are indexed:

1. In SQL Editor, click **New Query**
2. Copy the contents of `verify-foreign-key-indexes.sql`
3. Paste and click **Run**

Expected result: All foreign keys should show "✓ Indexed" status

## What This Migration Does

- ✅ Adds index on `complaints.opened_by` foreign key
- ✅ Documents all existing foreign key indexes (23 already existed)
- ✅ Ensures 100% foreign key index coverage (24/24 indexed)

## Performance Impact

- **Positive**: Faster JOIN operations on complaints.opened_by
- **Minimal overhead**: Index creation is fast (< 1 second)
- **No downtime**: Uses `CREATE INDEX IF NOT EXISTS` for safety

## Rollback (if needed)

If you need to remove the index:

```sql
DROP INDEX IF EXISTS public.idx_complaints_opened_by;
```

## Already Applied?

If you see an error like "relation already exists", the migration was already applied. This is safe to ignore.

## Next Steps

After applying this migration:
- ✅ All foreign keys are indexed
- ✅ Database is optimized for JOIN performance
- ⏭️ Continue with Task 2.1: Set Up Supabase Auth

## Questions?

See `FOREIGN_KEY_INDEXES_SUMMARY.md` for detailed documentation.
