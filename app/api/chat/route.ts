import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export async function POST(req: Request) {
  try {
    const { messages, systemContext } = await req.json();

    const enhancedSystemContext = `You are Wayfare AI, a helpful travel assistant for the Wayfare app specializing in international travel planning and safety.

IMPORTANT GUIDELINES:
- Keep responses SHORT and conversational (2-3 sentences max)
- Use simple formatting with line breaks for readability
- Only answer questions related to travel, safety, documents, packing, customs, and destinations
- If asked about non-travel topics, politely redirect to travel-related questions
- Be friendly but concise
- Use emojis sparingly (1-2 per response max)

${systemContext || ""}

Focus on being helpful for travel planning while keeping responses brief and easy to read.`;

    const result = await streamText({
      model: google("gemini-1.5-flash"),
      system: enhancedSystemContext,
      messages,
      maxTokens: 300, // Reduced to keep responses shorter
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Error processing chat request", { status: 500 });
  }
}
