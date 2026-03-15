import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getSession } from "@auth0/nextjs-auth0";
import { logger } from '@/lib/logger';

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  bandMedia: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    audio: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      const session = await getSession();
      const user = session?.user;

      // If you throw, the user will not be able to upload
      if (!user) throw new Error("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.sub };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      logger.info({ err: metadata.userId }, "Upload complete for userId:");
      logger.info({ err: file.url }, "file url");

      // !!! Note: We will handle the database sync in the frontend onUploadComplete 
      // or here if we want more security. For now, we'll log it.
      return { uploadedBy: metadata.userId };
    }),

  venueMedia: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getSession();
      const user = session?.user;
      if (!user) throw new Error("Unauthorized");
      return { userId: user.sub };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      logger.info({ err: file.url }, "Venue upload complete");
      return { uploadedBy: metadata.userId };
    }),

  systemDocs: f({
    pdf: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getSession();
      const user = session?.user;
      
      // Strict Check: Only allow system-level uploads from authenticated users
      // or verified server-side calls (using UPLOADTHING_SECRET via utapi)
      if (!user) throw new Error("Unauthorized");
      
      return { system: true, userId: user.sub };
    })
    .onUploadComplete(async ({ file }) => {
      logger.info({ err: file.url }, "System document uploaded:");
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
