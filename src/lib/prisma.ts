import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    model: {
      band: {
        async findNearby(lat: number, lng: number, radiusMeters: number, query?: string, genre?: string, limit: number = 20, offset: number = 0) {
          const queryPart = query ? `%${query.trim()}%` : null;
          const genrePart = genre || null;
          
          // Check if we have a real location (not just 0,0)
          const hasLocation = lat !== 0 || lng !== 0;

          return prisma.$queryRaw`
            SELECT b.id, b.name, b.lat, b.lng, b.bio, b.media, b."audioUrlPreview",
              COALESCE((SELECT AVG(stars) FROM "Rating" WHERE "bandId" = b.id), 0) as average_rating,
              CASE 
                -- Priority 1: Direct name match
                WHEN (${queryPart}::text IS NOT NULL AND (b.name ILIKE ${queryPart}::text OR b.bio ILIKE ${queryPart}::text)) THEN 1
                -- Priority 2: Within Radius (Only if location is provided)
                WHEN (${hasLocation}::boolean AND b.location IS NOT NULL AND ST_DWithin(b.location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusMeters})) THEN 2
                -- Priority 3: Everyone else (Global Fallback)
                ELSE 3
              END as search_priority
            FROM "Band" b
            LEFT JOIN "_BandGenres" bg ON b.id = bg."A"
            LEFT JOIN "Genre" g ON bg."B" = g.id
            WHERE (
              -- If no location and no query, show EVERYONE (1=1)
              -- If location exists, ST_DWithin is enforced unless a query matches
              (${!hasLocation}::boolean AND ${queryPart}::text IS NULL) 
              OR 
              (${queryPart}::text IS NOT NULL AND (b.name ILIKE ${queryPart}::text OR b.bio ILIKE ${queryPart}::text))
              OR
              (${hasLocation}::boolean AND b.location IS NOT NULL AND ST_DWithin(b.location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusMeters}))
              OR
              -- Final fallback to ensure the grid is NEVER empty if data exists
              (${queryPart}::text IS NULL)
            )
            AND (${genrePart}::text IS NULL OR g.name = ${genrePart}::text)
            GROUP BY b.id
            ORDER BY search_priority ASC, average_rating DESC, b.name ASC
            LIMIT ${limit} OFFSET ${offset}
          `;
        },
      },
      venue: {
        async findNearby(lat: number, lng: number, radiusMeters: number, query?: string, genre?: string, limit: number = 20, offset: number = 0) {
          const queryPart = query ? `%${query.trim()}%` : null;
          const genrePart = genre || null;
          const hasLocation = lat !== 0 || lng !== 0;

          return prisma.$queryRaw`
            SELECT v.id, v.name, v.lat, v.lng, v.capacity, v.bio, v.media,
              CASE 
                WHEN (${queryPart}::text IS NOT NULL AND (v.name ILIKE ${queryPart}::text OR v.bio ILIKE ${queryPart}::text)) THEN 1
                WHEN (${hasLocation}::boolean AND v.location IS NOT NULL AND ST_DWithin(v.location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusMeters})) THEN 2
                ELSE 3
              END as search_priority
            FROM "Venue" v
            LEFT JOIN "_VenueGenres" vg ON v.id = vg."A"
            LEFT JOIN "Genre" g ON vg."B" = g.id
            WHERE (
              (${!hasLocation}::boolean AND ${queryPart}::text IS NULL) 
              OR 
              (${queryPart}::text IS NOT NULL AND (v.name ILIKE ${queryPart}::text OR v.bio ILIKE ${queryPart}::text))
              OR
              (${hasLocation}::boolean AND v.location IS NOT NULL AND ST_DWithin(v.location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusMeters}))
              OR
              (${queryPart}::text IS NULL)
            )
            AND (${genrePart}::text IS NULL OR g.name = ${genrePart}::text)
            GROUP BY v.id
            ORDER BY search_priority ASC, v.name ASC
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
