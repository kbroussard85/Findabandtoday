# Part 3: Data Architecture (The "Brick" Schema)

We use **Prisma** with **PostgreSQL** and **PostGIS**. This allows for complex geospatial math required for tour routing.

```prisma
// schema.prisma

datasource db {  
  provider = "postgresql"  
  url      = env("DATABASE_URL")  
}

generator client {  
  provider = "prisma-client-js"  
}

enum UserRole {  
  BAND  
  VENUE  
}

model User {  
  id               String    @id @default(cuid())  
  auth0Id          String    @unique  
  email            String    @unique  
  role             UserRole  
  stripeCustomerId String?   @unique  
  isPaid           Boolean   @default(false)  
  subscriptionTier String?   // "ARTIST_BIZ", "VENUE_COMMAND", "MAXIMIZER"  
  createdAt        DateTime  @default(now())

  bandProfile      Band?  
  venueProfile     Venue?  
}

model Band {  
  id               String   @id @default(cuid())  
  userId           String   @unique  
  user             User     @relation(fields: [userId], references: [id])  
  name             String  
  lat              Float?  
  lng              Float?  
  searchRadius     Int      @default(50) // 5 to 500 miles  
  audioUrlPreview  String?  // 15s snippet  
  audioUrlFull     String?  // Gated behind isPaid  
  taxStatus        Boolean  @default(false) // Verified I-9  
  gigs             Gig[]  
}

model Venue {  
  id               String   @id @default(cuid())  
  userId           String   @unique  
  user             User     @relation(fields: [userId], references: [id])  
  name             String  
  lat              Float?  
  lng              Float?  
  capacity         Int?  
  gigs             Gig[]  
}

model Gig {  
  id             String    @id @default(cuid())  
  status         String    @default("PENDING") // PENDING, DEPOSIT_HELD, COMPLETED  
  payout         Float  
  contractUrl    String?   // AI-Generated PDF Link  
  bandId         String  
  band           Band      @relation(fields: [bandId], references: [id])  
  venueId        String  
  venue          Venue     @relation(fields: [venueId], references: [id])  
}
```
