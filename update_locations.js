const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        await prisma.$executeRawUnsafe(`UPDATE "Band" SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography WHERE lat IS NOT NULL AND lng IS NOT NULL`);
        await prisma.$executeRawUnsafe(`UPDATE "Venue" SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography WHERE lat IS NOT NULL AND lng IS NOT NULL`);
        console.log('Geospatial locations updated successfully!');
    } catch (e) {
        console.error('Error updating locations:', e);
    } finally {
        await prisma.$disconnect();
    }
}

run();