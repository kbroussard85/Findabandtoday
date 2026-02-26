import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getSession } from "@auth0/nextjs-auth0";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  bandMedia: f({
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
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);

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
      console.log("Venue upload complete", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
