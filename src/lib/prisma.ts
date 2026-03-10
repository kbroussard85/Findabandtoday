import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    model: {
      band: {
        async findNearby(lat: number, lng: number, radiusMeters: number, query?: string, genre?: string, limit: number = 20, offset: number = 0) {
          const queryPart = query ? `%${query}%` : null;
          const genrePart = genre || null;

          // If there's a specific query, we relax the location constraint to allow "Global Search"
          // If no query, we strictly enforce the radius
          return prisma.$queryRaw`
            SELECT DISTINCT b.id, b.name, b.lat, b.lng, b.bio, b.media, b."audioUrlPreview"
            FROM "Band" b
            LEFT JOIN "_BandGenres" bg ON b.id = bg."A"
            LEFT JOIN "Genre" g ON bg."B" = g.id
            WHERE (
              -- EITHER within radius
              ST_DWithin(
                b.location,
                ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
                ${radiusMeters}
              )
              OR 
              -- OR it's a specific text match (Global Search fallback)
              (${queryPart} IS NOT NULL AND (b.name ILIKE ${queryPart} OR b.bio ILIKE ${queryPart}))
            )
            AND (${queryPart} IS NULL OR b.name ILIKE ${queryPart} OR b.bio ILIKE ${queryPart})
            AND (${genrePart} IS NULL OR g.name = ${genrePart})
            ORDER BY b.name ASC
            LIMIT ${limit} OFFSET ${offset}
          `;
        },
      },
      venue: {
        async findNearby(lat: number, lng: number, radiusMeters: number, query?: string, genre?: string, limit: number = 20, offset: number = 0) {
          const queryPart = query ? `%${query}%` : null;
          const genrePart = genre || null;

          return prisma.$queryRaw`
            SELECT DISTINCT v.id, v.name, v.lat, v.lng, v.capacity, v.bio, v.media
            FROM "Venue" v
            LEFT JOIN "_VenueGenres" vg ON v.id = vg."A"
            LEFT JOIN "Genre" g ON vg."B" = g.id
            WHERE (
              ST_DWithin(
                v.location,
                ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
                ${radiusMeters}
              )
              OR 
              (${queryPart} IS NOT NULL AND (v.name ILIKE ${queryPart} OR v.bio ILIKE ${queryPart}))
            )
            AND (${queryPart} IS NULL OR v.name ILIKE ${queryPart} OR v.bio ILIKE ${queryPart})
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
