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

export const prisma = new Proxy({} as ReturnType<typeof prismaClientSingleton>, {
  get(target, prop, receiver) {
    if (!globalThis.prismaGlobal) {
      globalThis.prismaGlobal = prismaClientSingleton();
    }
    return Reflect.get(globalThis.prismaGlobal, prop, receiver);
  }
});

if (process.env.NODE_ENV !== 'production') {
  // We don't eagerly set it here anymore to keep it lazy
}

