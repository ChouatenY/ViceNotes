import { OpenAIStream, StreamingTextResponse } from "ai";
// /api/completion

// Use edge runtime for streaming responses
export const runtime = 'edge';

// Import the OpenAI client from the Vercel AI SDK
import OpenAI from 'openai';

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // extract the prompt from the body
    const { prompt } = await req.json();

    console.log("Received completion request with prompt:", prompt);

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "OpenAI API key is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // For very short prompts, provide a simple completion
    if (!prompt || prompt.trim().length < 5) {
      // Create a simple text stream for short prompts that simulates word-by-word streaming
      const encoder = new TextEncoder();
      const words = " is a popular programming language used for various applications.".split(" ");

      const stream = new ReadableStream({
        async start(controller) {
          let text = "";
          for (const word of words) {
            text += word + " ";
            controller.enqueue(encoder.encode(word + " "));
            // Add a small delay between words to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          controller.close();
        },
      });

      return new StreamingTextResponse(stream);
    }

    try {
      // Create a streaming completion using the Vercel AI SDK
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful AI embedded in a notion text editor app that is used to autocomplete sentences.
                The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
            AI is a well-behaved and well-mannered individual.
            AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.`,
          },
          {
            role: "user",
            content: `
            I am writing a piece of text in a notion text editor app.
            Help me complete my train of thought here: ##${prompt}##
            keep the tone of the text consistent with the rest of the text.
            keep the response short and sweet.
            `,
          },
        ],
        stream: true,
        max_tokens: 100,
        temperature: 0.7,
      });

      console.log("OpenAI API response received");

      // Convert the response to a stream
      const stream = OpenAIStream(response);
      return new StreamingTextResponse(stream);
    } catch (error) {
      console.error("Error calling OpenAI API:", error);

      // Provide a fallback response if OpenAI API fails
      const encoder = new TextEncoder();
      const words = " is a versatile programming language with many applications in software development.".split(" ");

      const fallbackStream = new ReadableStream({
        async start(controller) {
          let text = "";
          for (const word of words) {
            text += word + " ";
            controller.enqueue(encoder.encode(word + " "));
            // Add a small delay between words to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          controller.close();
        },
      });
      return new StreamingTextResponse(fallbackStream);
    }
  } catch (error) {
    console.error("Error in completion API route:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate completion" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
