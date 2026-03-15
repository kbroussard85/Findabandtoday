import { http, HttpResponse } from 'msw';
import llmResponses from '../fixtures/llm-responses.json';

export const handlers = [
  http.post('https://api.openai.com/v1/chat/completions', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(llmResponses.error_invalid_api_key, { status: 401 });
    }

    const body = await request.json() as any;
    const messages = body.messages || [];
    const lastMessage = messages[messages.length - 1]?.content || '';
    const systemMessage = messages.find((m: any) => m.role === 'system')?.content || '';
    
    let response = llmResponses.negotiation_success;
    
    if (systemMessage.includes('Liaison')) {
      response = llmResponses.liaison_draft;
    } else if (systemMessage.includes('Maximizer')) {
      response = llmResponses.maximizer_rank;
    } else if (lastMessage.toLowerCase().includes('counter')) {
      response = llmResponses.negotiation_counter;
    } else if (lastMessage.toLowerCase().includes('reject')) {
      response = llmResponses.negotiation_rejected;
    }
    
    return HttpResponse.json(response);
  }),

  http.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', async ({ request }) => {
    const body = await request.json() as any;
    const systemInstruction = body.systemInstruction?.parts?.[0]?.text || '';
    const lastMessage = body.contents?.[0]?.parts?.[0]?.text || '';
    
    let content = "AI Mock Response";
    
    if (systemInstruction.includes('Liaison')) {
      content = llmResponses.liaison_draft.choices[0].message.content;
    } else if (systemInstruction.includes('Maximizer')) {
      content = llmResponses.maximizer_rank.choices[0].message.content;
    } else if (lastMessage.toLowerCase().includes('counter')) {
      content = llmResponses.negotiation_counter.choices[0].message.content;
    } else if (lastMessage.toLowerCase().includes('reject')) {
      content = llmResponses.negotiation_rejected.choices[0].message.content;
    } else {
      content = llmResponses.negotiation_success.choices[0].message.content;
    }
    
    return HttpResponse.json({
      candidates: [{
        content: {
          parts: [{ text: content }]
        }
      }]
    });
  }),
];
