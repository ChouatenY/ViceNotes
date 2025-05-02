import { NextRequest, NextResponse } from "next/server";

// Set to nodejs runtime for better compatibility
export const runtime = 'nodejs';

// Define API constants
const MODEL_NAME = "gemini-1.5-flash"; // Use the standard model name for v1 API
const API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent`;

// Function to stream text with artificial delays
async function createTextStream(text: string) {
  const encoder = new TextEncoder();
  const words = text.split(" ");

  return new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(word + " "));
        // Add a small delay between words to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      controller.close();
    },
  });
}

// Function to call Gemini API directly using fetch
async function callGeminiAPI(prompt: string, apiKey: string) {
  console.log(`Calling Gemini API directly with model: ${MODEL_NAME}`);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `I'm writing text in a document and need you to continue it without repeating anything I've already written.

Here's my text: "${prompt}"

Important: Do NOT repeat any part of my text. Only add NEW content that continues naturally from where I left off. Keep your continuation short (1-2 sentences) and make sure it flows seamlessly.`
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.7,
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error (${response.status}): ${errorText}`);
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// Get a fallback response based on the prompt
function getFallbackResponse(prompt: string) {
  if (prompt.toLowerCase().includes("kotlin")) {
    return " is a modern programming language developed by JetBrains. It's concise, safe, and fully interoperable with Java, making it excellent for Android development.";
  } else if (prompt.toLowerCase().includes("python")) {
    return " is known for its simplicity and readability. It's widely used in data science, machine learning, web development, and automation.";
  } else if (prompt.toLowerCase().includes("javascript")) {
    return " is the language of the web. It powers interactive websites and can be used for both frontend and backend development with Node.js.";
  } else {
    return " is a versatile programming language with many applications in software development. It offers a good balance of performance, readability, and developer productivity.";
  }
}

export async function POST(req: NextRequest) {
  try {
    // Extract the prompt from the request body
    const { prompt } = await req.json();

    console.log("Received completion request with prompt:", prompt);

    // For very short prompts, provide a simple completion
    if (!prompt || prompt.trim().length < 5) {
      const text = " is a popular programming language used for various applications.";
      const stream = await createTextStream(text);

      return new Response(stream);
    }

    try {
      // Get the API key
      const apiKey = process.env.GEMINI_API_KEY || "";
      console.log("Using Gemini API key:", apiKey ? "API key is set" : "No API key");

      // If no API key, use fallback
      if (!apiKey) {
        console.log("No Gemini API key found, using fallback response");
        const fallbackText = getFallbackResponse(prompt);
        const stream = await createTextStream(fallbackText);
        return new Response(stream);
      }

      // Call the Gemini API directly
      const responseText = await callGeminiAPI(prompt, apiKey);
      console.log("Gemini response:", responseText);

      // Create a stream from the response
      const stream = await createTextStream(responseText);

      return new Response(stream);
    } catch (error) {
      console.error("Error calling Gemini API:", error);

      // Log more detailed error information
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);

        // Log API configuration for debugging
        console.error("API URL:", API_URL);
        console.error("Model name:", MODEL_NAME);
        console.error("API key present:", !!process.env.GEMINI_API_KEY);
      }

      // Create a fallback response based on the error
      let fallbackText = getFallbackResponse(prompt);

      // Add error information to the fallback text for debugging
      if (process.env.NODE_ENV === "development") {
        fallbackText += " [Note: AI completion failed. Please check console for errors.]";
      }

      const stream = await createTextStream(fallbackText);
      return new Response(stream);
    }
  } catch (error) {
    console.error("Error in completion API route:", error);
    return NextResponse.json(
      { error: "Failed to generate completion" },
      { status: 500 }
    );
  }
}
