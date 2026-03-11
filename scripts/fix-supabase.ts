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
      '_prisma_migrations', 'Band', 'Gig', 'Venue', 'User', 'BandMember', 
      'VenueMember', 'BookingAgreement', 'Offer', 'OfferHistory', 
      'Availability', '_BandGenres', 'Genre', '_VenueGenres', 
      'artist_media', 'profiles', 'engagements', 'Rating'
    ];

    console.log('\n--- Granting Permissions to Roles ---');
    await prisma.$executeRawUnsafe('GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;');
    await prisma.$executeRawUnsafe('GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role, authenticated;');
    await prisma.$executeRawUnsafe('GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, authenticated;');
    await prisma.$executeRawUnsafe('GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role, authenticated;');

    console.log('\n--- Enabling Row Level Security (RLS) ---');
    for (const table of tables) {
      if (table === '_prisma_migrations') continue;
      console.log(`Enabling RLS on "${table}"...`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "public"."${table}" ENABLE ROW LEVEL SECURITY;`);
    }

    console.log('\n--- Creating Default Policies (Allow everything for Service Role) ---');
    for (const table of tables) {
      if (table === '_prisma_migrations') continue;
      console.log(`Adding bypass policy for "${table}"...`);
      // This ensures Prisma (using postgres/service_role) continues to work
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = '${table}' AND policyname = 'service_role_bypass'
          ) THEN
            EXECUTE 'CREATE POLICY service_role_bypass ON "public"."${table}" FOR ALL TO service_role USING (true) WITH CHECK (true)';
          END IF;
        END
        $$;
      `);
    }

    console.log('\nSuccess! RLS enabled and service_role bypass policy added.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
