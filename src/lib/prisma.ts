import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    model: {
      band: {
        async findNearby(lat: number, lng: number, radiusMeters: number, query?: string, genre?: string, limit: number = 20, offset: number = 0) {
          const queryPart = query ? `%${query.trim()}%` : null;
          const genrePart = genre || null;

          // CASCADE LOGIC:
          // 1. First Priority: In Location
          // 2. Second Priority: Match Genre (if provided)
          // 3. Third Priority: Everyone else
          return prisma.$queryRaw`
            SELECT DISTINCT b.id, b.name, b.lat, b.lng, b.bio, b.media, b."audioUrlPreview",
              CASE 
                -- Priority 1: Text match (User is specifically looking for you)
                WHEN (${queryPart} IS NOT NULL AND (b.name ILIKE ${queryPart} OR b.bio ILIKE ${queryPart})) THEN 1
                -- Priority 2: Within Radius
                WHEN ST_DWithin(b.location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusMeters}) THEN 2
                -- Priority 3: Match Genre
                WHEN (${genrePart} IS NOT NULL AND EXISTS (SELECT 1 FROM "_BandGenres" bg JOIN "Genre" g ON bg."B" = g.id WHERE bg."A" = b.id AND g.name = ${genrePart})) THEN 3
                -- Priority 4: Fallback (Everyone else)
                ELSE 4
              END as search_priority
            FROM "Band" b
            LEFT JOIN "_BandGenres" bg ON b.id = bg."A"
            LEFT JOIN "Genre" g ON bg."B" = g.id
            WHERE 
              -- If a query exists, we MUST match it OR be part of the fallback browse
              (${queryPart} IS NULL OR b.name ILIKE ${queryPart} OR b.bio ILIKE ${queryPart} OR 1=1)
            ORDER BY search_priority ASC, b.name ASC
            LIMIT ${limit} OFFSET ${offset}
          `;
        },
      },
      venue: {
        async findNearby(lat: number, lng: number, radiusMeters: number, query?: string, genre?: string, limit: number = 20, offset: number = 0) {
          const queryPart = query ? `%${query.trim()}%` : null;
          const genrePart = genre || null;

          return prisma.$queryRaw`
            SELECT DISTINCT v.id, v.name, v.lat, v.lng, v.capacity, v.bio, v.media,
              CASE 
                WHEN (${queryPart} IS NOT NULL AND (v.name ILIKE ${queryPart} OR v.bio ILIKE ${queryPart})) THEN 1
                WHEN ST_DWithin(v.location, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusMeters}) THEN 2
                WHEN (${genrePart} IS NOT NULL AND EXISTS (SELECT 1 FROM "_VenueGenres" vg JOIN "Genre" g ON vg."B" = g.id WHERE vg."A" = v.id AND g.name = ${genrePart})) THEN 3
                ELSE 4
              END as search_priority
            FROM "Venue" v
            LEFT JOIN "_VenueGenres" vg ON v.id = vg."A"
            LEFT JOIN "Genre" g ON vg."B" = g.id
            WHERE 
              (${queryPart} IS NULL OR v.name ILIKE ${queryPart} OR v.bio ILIKE ${queryPart} OR 1=1)
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
