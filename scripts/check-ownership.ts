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
    const owners = await prisma.$queryRaw`
      SELECT tablename, tableowner 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public';
    `;
    console.log('--- Table Ownership ---');
    console.table(owners);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
