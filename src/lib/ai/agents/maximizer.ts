import prisma from "@/lib/prisma";
import { aiClient } from "../client";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { logger } from '@/lib/logger';

interface Opportunity {
  id: string;
  name: string;
  bio?: string | null;
}

/**
 * The Maximizer Agent: Ranks and suggests optimal gig opportunities.
 */
export async function getMaximizerSuggestions(userId: string, lat: number, lng: number, radiusMiles: number = 50) {
  const user = await prisma.user.findUnique({
    where: { auth0Id: userId },
    include: { bandProfile: true, venueProfile: true }
  });

  if (!user) throw new Error("User not found");

  const isBand = user.role === 'BAND';
  const radiusMeters = radiusMiles * 1609.34;

  // 1. Fetch nearby opportunities
  let opportunities: Opportunity[];
  if (isBand) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    opportunities = await (prisma.venue as any).findNearby(lat, lng, radiusMeters) as Opportunity[];
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    opportunities = await (prisma.band as any).findNearby(lat, lng, radiusMeters) as Opportunity[];
  }

  if (opportunities.length === 0) return [];

  // 2. Use AI to rank them
  const systemPrompt = `You are "The Maximizer", a tour optimization AI for the FABT platform. 
    Your goal is to rank the following opportunities for the ${isBand ? 'Band' : 'Venue'} "${isBand ? user.bandProfile?.name : user.venueProfile?.name}".
    Rank them based on cultural fit (bio comparison), geographic proximity, and potential payout.`;

  const humanPrompt = `
    User Profile: ${isBand ? user.bandProfile?.bio : user.venueProfile?.bio}
    
    Opportunities:
    ${opportunities.map((o, i) => `${i+1}. ${o.name} - Bio: ${o.bio || 'N/A'}`).join('\n')}
    
    Return a JSON array of the top 3 IDs, ranked by suitability. 
    Example: ["id1", "id2", "id3"]
    Do not include any other text.
  `;

  const response = await aiClient.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(humanPrompt)
  ]);

  try {
    const rankedIds = JSON.parse(response.content as string);
    return opportunities
      .filter(o => rankedIds.includes(o.id))
      .sort((a, b) => rankedIds.indexOf(a.id) - rankedIds.indexOf(b.id));
  } catch (e) {
    logger.error({ err: e }, "Maximizer JSON Parse Error:");
    return opportunities.slice(0, 3); // Fallback
  }
}
