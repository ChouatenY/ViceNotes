// /api/createNoteBook

import { db } from "@/lib/db";
import { $notes } from "@/lib/db/schema";
import { generateImage, generateImagePrompt } from "@/lib/openai";
import { NextResponse } from "next/server";

// Remove edge runtime to avoid potential issues
// export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, userId = "default-user" } = body;

    // Default image URL in case OpenAI fails - using profile.jpg from public directory
    let image_url = "/profile.jpg";

    try {
      // Try to generate an image with OpenAI, but don't block if it fails
      const image_description = await generateImagePrompt(name);
      if (image_description) {
        const generated_url = await generateImage(image_description);
        if (generated_url) {
          image_url = generated_url;
        }
      }
    } catch (error) {
      console.error("Error generating image:", error);
      // Continue with the default image URL
    }

    // Create the note in the database
    const note_ids = await db
      .insert($notes)
      .values({
        name,
        userId,
        imageUrl: image_url,
      })
      .returning({
        insertedId: $notes.id,
      });

    return NextResponse.json({
      note_id: note_ids[0].insertedId,
    });
  } catch (error) {
    console.error("Error creating notebook:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to create notebook" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
