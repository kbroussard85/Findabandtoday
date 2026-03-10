import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    model: {
      band: {
        async findNearby(lat: number, lng: number, radiusMeters: number, query?: string, genre?: string, limit: number = 20, offset: number = 0) {
          const queryPart = query ? `%${query.trim()}%` : null;
          const genrePart = genre || null;

          // If there is a query, we do a wide search. If no query, we do a local search.
          return prisma.$queryRaw`
            SELECT DISTINCT b.id, b.name, b.lat, b.lng, b.bio, b.media, b."audioUrlPreview"
            FROM "Band" b
            LEFT JOIN "_BandGenres" bg ON b.id = bg."A"
            LEFT JOIN "Genre" g ON bg."B" = g.id
            WHERE (
              -- Match 1: Text search match (Global)
              (${queryPart} IS NOT NULL AND (b.name ILIKE ${queryPart} OR b.bio ILIKE ${queryPart}))
              OR
              -- Match 2: Within radius (Local) - only if no query or if it's just a general browse
              (
                b.location IS NOT NULL AND 
                ST_DWithin(
                  b.location,
                  ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
                  ${radiusMeters}
                )
              )
            )
            -- Apply genre filter ONLY if one is selected
            AND (${genrePart} IS NULL OR g.name = ${genrePart})
            -- If we have a text query, we MUST still satisfy the text match if radius failed
            AND (${queryPart} IS NULL OR b.name ILIKE ${queryPart} OR b.bio ILIKE ${queryPart} OR ST_DWithin(b.location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusMeters}))
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
              (
                v.location IS NOT NULL AND 
                ST_DWithin(
                  v.location,
                  ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
                  ${radiusMeters}
                )
              )
            )
            AND (${genrePart} IS NULL OR g.name = ${genrePart})
            AND (${queryPart} IS NULL OR v.name ILIKE ${queryPart} OR v.bio ILIKE ${queryPart} OR ST_DWithin(v.location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusMeters}))
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
