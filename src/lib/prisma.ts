import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    model: {
      band: {
        async findNearby(lat: number, lng: number, radiusMeters: number, query?: string, limit: number = 20, offset: number = 0) {
          if (query) {
            return prisma.$queryRaw`
              SELECT id, name, lat, lng, bio, media, availability, "negotiationPrefs", "audioUrlPreview"
              FROM "Band"
              WHERE ST_DWithin(
                location,
                ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
                ${radiusMeters}
              )
              AND (name ILIKE ${`%${query}%`} OR bio ILIKE ${`%${query}%`})
              LIMIT ${limit} OFFSET ${offset}
            `;
          }
          return prisma.$queryRaw`
            SELECT id, name, lat, lng, bio, media, availability, "negotiationPrefs", "audioUrlPreview"
            FROM "Band"
            WHERE ST_DWithin(
              location,
              ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
              ${radiusMeters}
            )
            LIMIT ${limit} OFFSET ${offset}
          `;
        },
      },
      venue: {
        async findNearby(lat: number, lng: number, radiusMeters: number, query?: string, limit: number = 20, offset: number = 0) {
          if (query) {
            return prisma.$queryRaw`
              SELECT id, name, lat, lng, capacity, bio, media, availability, "negotiationPrefs"
              FROM "Venue"
              WHERE ST_DWithin(
                location,
                ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
                ${radiusMeters}
              )
              AND (name ILIKE ${`%${query}%`} OR bio ILIKE ${`%${query}%`})
              LIMIT ${limit} OFFSET ${offset}
            `;
          }
          return prisma.$queryRaw`
            SELECT id, name, lat, lng, capacity, bio, media, availability, "negotiationPrefs"
            FROM "Venue"
            WHERE ST_DWithin(
              location,
              ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
              ${radiusMeters}
            )
            LIMIT ${limit} OFFSET ${offset}
          `;
        },
      },
    },
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
