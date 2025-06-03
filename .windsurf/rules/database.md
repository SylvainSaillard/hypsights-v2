---
trigger: glob
globs: **/*.sql
---

# Database Development Standards

## Mandatory RLS Policies
Every table MUST have these RLS policies:

```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- User access policy
CREATE POLICY "user_access_table_name" ON table_name FOR ALL
USING (
  user_id = auth.uid() OR 
  current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'admin'
);

-- Service role policy (for Edge Functions)
CREATE POLICY "service_role_table_name" ON table_name FOR ALL TO service_role
USING (true) WITH CHECK (true);
```

## Table Standards
- Always include `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- Include `created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`
- Include `updated_at` for mutable data
- Use meaningful foreign key constraints
- Add appropriate indexes for query optimization
- Test RLS policies with real user data immediately after creation

## Required Indexes
```sql
-- User-based queries (critical for RLS performance)
CREATE INDEX idx_table_name_user_id ON table_name(user_id);

-- Timestamp queries
CREATE INDEX idx_table_name_created_at ON table_name(created_at);

-- Status-based queries (if applicable)
CREATE INDEX idx_table_name_status ON table_name(status);

-- Composite indexes for common query patterns
CREATE INDEX idx_table_name_user_status ON table_name(user_id, status);
```

## Testing Strategy
- **Test RLS policies immediately** after creation with real JWT tokens
- **Verify user isolation** - users should only see their own data
- **Test admin access** - admins should see all data
- **Performance test** - indexes should optimize user-filtered queries
- **No shortcuts** - always test with actual authentication flow

## Database Migration Best Practices
```sql
-- Always include safety checks
DO $$
BEGIN
  -- Check if table exists before creating
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'table_name') THEN
    CREATE TABLE table_name (...);
    
    -- Enable RLS immediately
    ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "user_access_table_name" ON table_name FOR ALL
    USING (user_id = auth.uid() OR current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'admin');
    
    -- Create indexes
    CREATE INDEX idx_table_name_user_id ON table_name(user_id);
  END IF;
END $$;
```

## Edge Function Database Access
```sql
-- Edge Functions must use service_role for data operations
-- Example query pattern in Edge Functions:
SELECT * FROM table_name 
WHERE user_id = $1  -- Always filter by user_id from JWT
ORDER BY created_at DESC;

-- Never bypass RLS in Edge Functions
-- Let RLS policies handle user isolation automatically
```

## i18n Tables Pattern
```sql
-- Translations table for multi-language support
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  locale TEXT NOT NULL, -- 'en', 'fr', 'es'
  value TEXT NOT NULL,
  context TEXT, -- Optional context for translators
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(key, locale)
);

CREATE INDEX idx_translations_key_locale ON translations(key, locale);

-- RLS for translations (public read, admin write)
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "translations_public_read" ON translations FOR SELECT
USING (true);

CREATE POLICY "translations_admin_write" ON translations FOR INSERT, UPDATE, DELETE
USING (current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'admin');
```

## User Metadata Pattern
```sql
-- Pattern for user-specific settings and quotas
CREATE TABLE users_metadata (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  fast_search_limit INTEGER DEFAULT 3,
  fast_search_used INTEGER DEFAULT 0,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-create trigger for new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users_metadata (user_id, fast_search_limit, fast_search_used)
  VALUES (NEW.id, 3, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS for user metadata
ALTER TABLE users_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_metadata" ON users_metadata FOR ALL
USING (user_id = auth.uid() OR current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'admin');
```

## Data Types Standards
- Use **UUID** for all primary keys
- Use **TIMESTAMP WITH TIME ZONE** for all timestamps  
- Use **JSONB** for flexible metadata
- Use **TEXT** for variable-length strings
- Use appropriate **constraints and checks**
- Use **ENUM types** for fixed value lists when appropriate

## Performance Guidelines
- **Index all foreign keys** for join performance
- **Composite indexes** for common query patterns (user_id + status)
- **Partial indexes** for filtered queries when appropriate
- **Monitor query performance** with real data volumes
- **Use EXPLAIN ANALYZE** to verify index usage

## Testing Checklist
- [ ] RLS policies prevent cross-user data access
- [ ] Admin users can access all data when needed
- [ ] Service role can read/write for Edge Functions
- [ ] Indexes improve query performance significantly
- [ ] Triggers work correctly for user creation
- [ ] Foreign key constraints prevent orphaned data
- [ ] Data types handle expected value ranges

## FORBIDDEN Practices
- ❌ Tables without RLS policies
- ❌ Bypassing RLS in application code
- ❌ Missing user_id foreign keys on user data
- ❌ Using SERIAL instead of UUID for primary keys
- ❌ Storing timestamps without timezone information
- ❌ Creating tables without appropriate indexes