-- Enable RLS on spatial_ref_sys
ALTER TABLE "public"."spatial_ref_sys" ENABLE ROW LEVEL SECURITY;

-- Allow service_role to do everything
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'spatial_ref_sys' AND policyname = 'service_role_bypass'
  ) THEN
    CREATE POLICY service_role_bypass ON "public"."spatial_ref_sys" FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END
$$;

-- IMPORTANT: Allow EVERYONE to read this table. 
-- PostGIS needs this for coordinate transformations.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'spatial_ref_sys' AND policyname = 'allow_read_all'
  ) THEN
    CREATE POLICY allow_read_all ON "public"."spatial_ref_sys" FOR SELECT TO public USING (true);
  END IF;
END
$$;
