"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import DeleteButton from "@/components/DeleteButton";
import TipTapEditor from "@/components/TipTapEditor";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NoteType } from "@/lib/db/schema";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  note: NoteType;
  noteId: string;
};

const NotebookClient = ({ note: initialNote, noteId }: Props) => {
  const { user } = useAuth();
  const router = useRouter();
  const [note, setNote] = useState<NoteType>(initialNote);
  const [loading, setLoading] = useState(false);

  // Fetch the note for the current user if available
  useEffect(() => {
    const fetchNote = async () => {
      if (user) {
        try {
          setLoading(true);
          const response = await axios.get(`/api/notes/${noteId}?userId=${user.id}`);
          if (response.data && response.data.note) {
            setNote(response.data.note);
          }
          setLoading(false);
        } catch (error) {
          console.error("Error fetching note:", error);
          setLoading(false);

          // Show an error message to the user
          if (axios.isAxiosError(error) && error.response?.status === 500) {
            // Server error
            toast.error("There was a problem loading this notebook. Please try again later.");
          }
        }
      }
    };

    if (user) {
      fetchNote();
    }
  }, [user, noteId]);

  return (
    <div className="min-h-screen grainy p-8">
      <div className="max-w-4xl mx-auto">
        <div className="border shadow-xl border-stone-200 rounded-lg p-4 flex items-center">
          <Link href="/dashboard">
            <Button
              className="bg-[#47423e] hover:bg-[#e2dac4] hover:text-[#47423e] text-[#e2dac4] transition-colors duration-300"
              size="sm"
            >
              Back
            </Button>
          </Link>
          <div className="w-3"></div>
          <span className="font-semibold">
            {user ? user.name : "Default User"}
          </span>
          <span className="inline-block mx-1">/</span>
          <span className="text-stone-500 font-semibold">{note.name}</span>
          <div className="ml-auto">
            <DeleteButton noteId={note.id} />
          </div>
        </div>

        <div className="h-4"></div>
        {loading ? (
          <div className="text-center p-8">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="border-stone-200 shadow-xl border rounded-lg px-16 py-8 w-full">
            <TipTapEditor note={note} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotebookClient;
