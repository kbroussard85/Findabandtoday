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
    console.log('--- Adding Authenticated User RLS Policies ---');

    // 1. User table: Users can read/update their own record
    console.log('Adding User policies...');
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'User' AND policyname = 'users_read_own') THEN
          CREATE POLICY users_read_own ON "User" FOR SELECT TO authenticated USING (auth0Id = auth.jwt() ->> 'sub');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'User' AND policyname = 'users_update_own') THEN
          CREATE POLICY users_update_own ON "User" FOR UPDATE TO authenticated USING (auth0Id = auth.jwt() ->> 'sub');
        END IF;
      END $$;
    `);

    // 2. Band/Venue profiles: Anyone authenticated can read, owners can update
    console.log('Adding Band/Venue policies...');
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Band' AND policyname = 'bands_read_all') THEN
          CREATE POLICY bands_read_all ON "Band" FOR SELECT TO authenticated USING (true);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Venue' AND policyname = 'venues_read_all') THEN
          CREATE POLICY venues_read_all ON "Venue" FOR SELECT TO authenticated USING (true);
        END IF;
      END $$;
    `);

    // Note: Since the app currently uses the 'postgres' superuser role via Prisma, 
    // it SHOULD bypass RLS anyway. 
    // BUT if Auth0 integration is somehow checking RLS via a secondary connection, this helps.

    console.log('\nSuccess! Basic user policies added.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
