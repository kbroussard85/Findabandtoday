'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";
import { generateContractBuffer } from "@/lib/documents/generator";
import { utapi } from "@/lib/uploadthing-server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function runAINegotiator(engagementId: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  // 1. Fetch data from the "Vault Brain" for both parties
  const gig = await prisma.gig.findUnique({
    where: { id: engagementId },
    include: {
      band: {
        include: { user: { include: { vaultAssets: true } } }
      },
      venue: {
        include: { user: { include: { vaultAssets: true } } }
      }
    }
  });

  if (!gig) throw new Error("Gig not found");

  // Extract Vault Assets
  const venueVault = gig.venue.user.vaultAssets.find(v => v.assetType === 'agreement_template')?.rawText || "Standard venue terms apply.";
  const artistRider = gig.band.user.vaultAssets.find(v => v.assetType === 'rider')?.rawText || "No specific rider provided.";
  const artistPlot = gig.band.user.vaultAssets.find(v => v.assetType === 'stage_plot')?.rawText || "Standard stage plot.";

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const prompt = `
    Act as a Legal Music Industry Agent. Create a Performance Agreement.
    
    VENUE TERMS: ${venueVault}
    ARTIST DOCS:
      - Rider: ${artistRider}
      - Stage Plot Details: ${artistPlot}
    
    EVENT DETAILS:
      - Date: ${gig.date.toISOString()}
      - Venue: ${gig.venue.name}
      - Artist: ${gig.band.name}
      - Payout: $${gig.totalAmount} (Deduct 5% FABT Platform Fee)
    
    Output ONLY the professional contract text including I-9 requirements and Stage Plot references. 
    Use clear, binding language.
  `;

  const result = await model.generateContent(prompt);
  const contractText = result.response.text();

  // 2. Generate PDF Buffer
  const pdfBuffer = await generateContractBuffer({
    gigId: gig.id,
    artistName: gig.band.name,
    venueName: gig.venue.name,
    eventDate: gig.date.toDateString(),
    payout: `$${gig.totalAmount}`,
    terms: contractText
  });

  // 3. Upload to UploadThing
  const file = new File([new Uint8Array(pdfBuffer)], `contract-${gig.id}.pdf`, { type: 'application/pdf' });
  const uploadResponse = await utapi.uploadFiles(file);

  if (!uploadResponse.data) {
    throw new Error('Failed to upload contract to storage');
  }

  const contractUrl = uploadResponse.data.url;

  // 4. Update Gig with Contract URL
  await prisma.gig.update({
    where: { id: engagementId },
    data: {
      contractUrl: contractUrl,
      status: 'CONFIRMED'
    }
  });

  return { success: true, contractUrl }; 
}
