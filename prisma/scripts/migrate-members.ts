import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting migration: Seeding legacy owners into new member tables...');

    // --- BANDS ---
    const bands = await prisma.band.findMany();
    console.log(`Found ${bands.length} bands. Migrating owners...`);

    let bandCount = 0;
    for (const band of bands) {
        try {
            await prisma.bandMember.upsert({
                where: {
                    bandId_userId: {
                        bandId: band.id,
                        userId: band.userId,
                    },
                },
                update: {},
                create: {
                    bandId: band.id,
                    userId: band.userId,
                    role: 'OWNER',
                },
            });
            bandCount++;
        } catch (error) {
            console.error(`Failed to migrate band owner for band ${band.id}:`, error);
        }
    }
    console.log(`Migrated ${bandCount} band owners.`);

    // --- VENUES ---
    const venues = await prisma.venue.findMany();
    console.log(`Found ${venues.length} venues. Migrating owners...`);

    let venueCount = 0;
    for (const venue of venues) {
        try {
            await prisma.venueMember.upsert({
                where: {
                    venueId_userId: {
                        venueId: venue.id,
                        userId: venue.userId,
                    },
                },
                update: {},
                create: {
                    venueId: venue.id,
                    userId: venue.userId,
                    role: 'OWNER',
                },
            });
            venueCount++;
        } catch (error) {
            console.error(`Failed to migrate venue owner for venue ${venue.id}:`, error);
        }
    }
    console.log(`Migrated ${venueCount} venue owners.`);

    console.log('Migration complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
