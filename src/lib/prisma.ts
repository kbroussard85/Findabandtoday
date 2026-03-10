import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    model: {
      band: {
        async findNearby(lat: number, lng: number, radiusMeters: number, query?: string, genre?: string, limit: number = 20, offset: number = 0) {
          const queryPart = query ? `%${query.trim()}%` : null;
          const genrePart = genre || null;

          console.log('[PRISMA_DEBUG] Querying Bands with query:', queryPart);

          return prisma.$queryRaw`
            SELECT DISTINCT b.id, b.name, b.lat, b.lng, b.bio, b.media, b."audioUrlPreview"
            FROM "Band" b
            LEFT JOIN "_BandGenres" bg ON b.id = bg."A"
            LEFT JOIN "Genre" g ON bg."B" = g.id
            WHERE (
              -- 1. If it's a specific text match, we allow it GLOBAL (regardless of location)
              (${queryPart} IS NOT NULL AND (b.name ILIKE ${queryPart} OR b.bio ILIKE ${queryPart}))
              OR
              -- 2. If no query, or if it's not a name match, it must be within radius
              ST_DWithin(
                b.location,
                ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
                ${radiusMeters}
              )
            )
            AND (${genrePart} IS NULL OR g.name = ${genrePart})
            ORDER BY b.name ASC
            LIMIT ${limit} OFFSET ${offset}
          `;
        },
      },
      venue: {
        async findNearby(lat: number, lng: number, radiusMeters: number, query?: string, genre?: string, limit: number = 20, offset: number = 0) {
          const queryPart = query ? `%${query.trim()}%` : null;
          const genrePart = genre || null;

          return prisma.$queryRaw`
            SELECT DISTINCT v.id, v.name, v.lat, v.lng, v.capacity, v.bio, v.media
            FROM "Venue" v
            LEFT JOIN "_VenueGenres" vg ON v.id = vg."A"
            LEFT JOIN "Genre" g ON vg."B" = g.id
            WHERE (
              (${queryPart} IS NOT NULL AND (v.name ILIKE ${queryPart} OR v.bio ILIKE ${queryPart}))
              OR
              ST_DWithin(
                v.location,
                ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
                ${radiusMeters}
              )
            )
            AND (${genrePart} IS NULL OR g.name = ${genrePart})
            ORDER BY v.name ASC
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
