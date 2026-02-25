// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['query'],
  }).$extends({
    model: {
      band: {
        async findNearby(lat: number, lng: number, radiusInMeters: number) {
          return await prisma.$queryRawUnsafe(`
            SELECT *, ST_AsText(location) as location_text
            FROM "Band"
            WHERE ST_DWithin(
              location,
              ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
              $3
            )
          `, lng, lat, radiusInMeters);
        },
      },
      venue: {
        async findNearby(lat: number, lng: number, radiusInMeters: number) {
          return await prisma.$queryRawUnsafe(`
            SELECT *, ST_AsText(location) as location_text
            FROM "Venue"
            WHERE ST_DWithin(
              location,
              ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
              $3
            )
          `, lng, lat, radiusInMeters);
        },
      },
    },
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;

