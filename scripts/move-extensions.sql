CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_trgm (the one specifically flagged)
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Move uuid-ossp (also good practice)
ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;

-- Note: PostGIS CANNOT be moved after installation.
-- This is normal and you can safely ignore the PostGIS warning in Supabase 
-- if it continues to flag it.
