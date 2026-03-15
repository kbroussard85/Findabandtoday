const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const venue = await prisma.venue.findFirst({ include: { user: true } });
  if (venue) {
    console.log("VENUE USER ID:", venue.userId);
  } else {
    console.log("No venue found.");
  }
}

main().finally(() => prisma.$disconnect());
