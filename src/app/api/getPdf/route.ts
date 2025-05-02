import { db } from "@/lib/db";
import { $notes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Explicitly set to node runtime to avoid edge runtime issues
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const noteId = url.searchParams.get("noteId");

    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    const notes = await db
      .select()
      .from($notes)
      .where(eq($notes.id, parseInt(noteId)));

    if (notes.length === 0) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    const note = notes[0];
    
    return NextResponse.json({ 
      note: {
        id: note.id,
        name: note.name,
        editorState: note.editorState || `<h1>${note.name}</h1>`,
      } 
    });
  } catch (error) {
    console.error("Error fetching note for PDF:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }
}
