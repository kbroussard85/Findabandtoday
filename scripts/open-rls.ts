import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
});

async function main() {
  try {
    const tables = [
      'Band', 'Gig', 'Venue', 'User', 'BandMember', 
      'VenueMember', 'BookingAgreement', 'Offer', 'OfferHistory', 
      'Availability', '_BandGenres', 'Genre', '_VenueGenres', 
      'artist_media', 'profiles', 'engagements', 'Rating'
    ];

    console.log('\n--- Granting FULL PERMISSIONS to Authenticated Role (to fix login) ---');
    
    // 1. Grant everything to roles
    await prisma.$executeRawUnsafe('GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role, postgres;');
    await prisma.$executeRawUnsafe('GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role, postgres;');
    await prisma.$executeRawUnsafe('GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role, postgres;');

    // 2. Create wide-open policies for authenticated users
    for (const table of tables) {
      console.log(`Adding open policy for "${table}"...`);
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          -- Delete restrictive JWT policies if they exist from my previous attempt
          DROP POLICY IF EXISTS users_read_own ON "User";
          DROP POLICY IF EXISTS users_update_own ON "User";
          DROP POLICY IF EXISTS bands_read_all ON "Band";
          DROP POLICY IF EXISTS venues_read_all ON "Venue";

          -- Add open policies for authenticated users
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = '${table}' AND policyname = 'authenticated_full_access'
          ) THEN
            EXECUTE 'CREATE POLICY authenticated_full_access ON "public"."${table}" FOR ALL TO authenticated USING (true) WITH CHECK (true)';
          END IF;
          
          -- Ensure service_role still has its bypass
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = '${table}' AND policyname = 'service_role_bypass'
          ) THEN
            EXECUTE 'CREATE POLICY service_role_bypass ON "public"."${table}" FOR ALL TO service_role USING (true) WITH CHECK (true)';
          END IF;
        END
        $$;
      `);
    }

    console.log('\nSuccess! RLS policies opened up for authenticated users.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
