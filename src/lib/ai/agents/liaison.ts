import { aiClient } from "../client";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

interface DraftOfferParams {
  senderType: 'BAND' | 'VENUE' | 'ADMIN';
  senderProfile: {
    name: string;
    bio?: string | null;
    negotiationPrefs?: Record<string, unknown> | null;
  };
  recipientProfile: {
    name: string;
    bio?: string | null;
  };
  gigDetails: {
    date: Date;
    suggestedAmount: number;
    message?: string;
  };
  venueAgreementText?: string | null;
}

/**
 * AI Liaison Agent: Drafts professional booking offers between bands and venues.
 */
export async function draftLiaisonOffer({
  senderType,
  senderProfile,
  recipientProfile,
  gigDetails,
  venueAgreementText
}: DraftOfferParams) {
  const isBandSender = senderType === 'BAND';
  
  const systemPrompt = isBandSender 
    ? `You are "The Liaison", a professional talent agent representing the band "${senderProfile.name}". 
       Your goal is to draft a compelling, professional, and concise booking pitch to the venue "${recipientProfile.name}". 
       Focus on professionalism, reliability, and the value the band brings to the venue.`
    : `You are "The Liaison", a professional talent booker for the venue "${senderProfile.name}". 
       Your goal is to draft a professional booking offer to the band "${recipientProfile.name}". 
       Focus on the venue's reputation and why this gig is a great opportunity for the band.`;

  const agreementContext = venueAgreementText ? `\n    - Venue Contract Clauses: ${venueAgreementText}` : '';

  const humanPrompt = `
    Draft a message for the following booking offer:
    - Sender: ${senderProfile.name} (${senderType})
    - Recipient: ${recipientProfile.name}
    - Date: ${gigDetails.date.toDateString()}
    - Suggested Amount: $${gigDetails.suggestedAmount}
    - Custom Context: ${gigDetails.message || "N/A"}${agreementContext}
    
    The message should be professional, polite, and under 150 words.
    Do not include placeholders like "[Your Name]". Sign off as "The FABT Liaison".
  `;

  const response = await aiClient.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(humanPrompt)
  ]);

  return response.content;
}
