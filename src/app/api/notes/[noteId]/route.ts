import { db } from "@/lib/db";
import { $notes } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Explicitly set to node runtime to avoid edge runtime issues
export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: { noteId: string } }
) {
  try {
    const noteId = params.noteId;
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    let query = db
      .select()
      .from($notes)
      .where(eq($notes.id, parseInt(noteId)));

    // If userId is provided, also filter by userId
    if (userId) {
      query = db
        .select()
        .from($notes)
        .where(
          and(eq($notes.id, parseInt(noteId)), eq($notes.userId, userId))
        );
    }

    const notes = await query;

    if (notes.length === 0) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ note: notes[0] });
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }
}
