-- Verification script to check that all foreign keys have indexes
-- This script lists all foreign keys and their corresponding indexes

-- Query to find all foreign keys and check if they have indexes
SELECT 
    tc.table_name,
    kcu.column_name AS fk_column,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column,
    CASE 
        WHEN i.indexname IS NOT NULL THEN '✓ Indexed'
        ELSE '✗ Missing Index'
    END AS index_status,
    i.indexname AS index_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    LEFT JOIN pg_indexes i 
      ON i.tablename = tc.table_name 
      AND i.schemaname = tc.table_schema
      AND (
          -- Check if index starts with the column name (covers single and composite indexes)
          i.indexdef LIKE '%(' || kcu.column_name || ')%'
          OR i.indexdef LIKE '%(' || kcu.column_name || ',%'
      )
WHERE 
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY 
    tc.table_name,
    kcu.column_name;

-- Summary: Count of foreign keys with and without indexes
SELECT 
    COUNT(*) FILTER (WHERE i.indexname IS NOT NULL) AS indexed_fks,
    COUNT(*) FILTER (WHERE i.indexname IS NULL) AS missing_indexes,
    COUNT(*) AS total_fks
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    LEFT JOIN pg_indexes i 
      ON i.tablename = tc.table_name 
      AND i.schemaname = tc.table_schema
      AND (
          i.indexdef LIKE '%(' || kcu.column_name || ')%'
          OR i.indexdef LIKE '%(' || kcu.column_name || ',%'
      )
WHERE 
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public';
