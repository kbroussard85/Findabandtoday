import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    model: {
      band: {
        async findNearby(lat: number, lng: number, radiusMeters: number) {
          return prisma.$queryRaw`
            SELECT id, name, lat, lng, "audioUrlPreview"
            FROM "Band"
            WHERE ST_DWithin(
              location,
              ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
              ${radiusMeters}
            )
          `;
        },
      },
      venue: {
        async findNearby(lat: number, lng: number, radiusMeters: number) {
          return prisma.$queryRaw`
            SELECT id, name, lat, lng, capacity
            FROM "Venue"
            WHERE ST_DWithin(
              location,
              ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
              ${radiusMeters}
            )
          `;
        },
      },
    },
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
