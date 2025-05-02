import { db } from "@/lib/db";
import { $notes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import NotebookClient from "@/components/NotebookClient";

type Props = {
  params: {
    noteId: string;
  };
};

const NotebookPage = async ({ params: { noteId } }: Props) => {
  try {
    // Validate noteId
    const noteIdNum = parseInt(noteId);
    if (isNaN(noteIdNum)) {
      console.error("Invalid note ID:", noteId);
      return redirect("/dashboard");
    }

    // Fetch the note with the given ID
    const notes = await db
      .select()
      .from($notes)
      .where(eq($notes.id, noteIdNum));

    if (notes.length !== 1) {
      console.log("Note not found, redirecting to dashboard");
      return redirect("/dashboard");
    }

    const note = notes[0];
    return <NotebookClient note={note} noteId={noteId} />;
  } catch (error) {
    console.error("Error loading notebook:", error);
    // Return a simple error UI instead of redirecting
    return (
      <div className="min-h-screen grainy p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error Loading Notebook</h1>
          <p className="mb-4">There was a problem loading this notebook.</p>
          <a href="/dashboard" className="text-blue-500 underline">
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }
};

export default NotebookPage;
