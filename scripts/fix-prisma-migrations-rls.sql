ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = '_prisma_migrations' AND policyname = 'service_role_bypass'
  ) THEN
    CREATE POLICY service_role_bypass ON "public"."_prisma_migrations" FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END
$$;
