"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, LogOut } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import CreateNoteDialog from "@/components/CreateNoteDialog";
import Image from "next/image";
import { NoteType } from "@/lib/db/schema";
import axios from "axios";
import { auth } from "@/lib/firebase-config";
import PdfDownloadButton from "@/components/PdfDownloadButton";

type Props = {
  initialNotes: NoteType[];
};

const DashboardClient = ({ initialNotes }: Props) => {
  const { user, loading } = useAuth();
  const [notes, setNotes] = useState<NoteType[]>(initialNotes);

  // Fetch notes for the current user
  useEffect(() => {
    const fetchNotes = async () => {
      if (user) {
        try {
          console.log("Fetching notes for user:", user.id);
          const response = await axios.get(`/api/notes?userId=${user.id}`);
          if (response.data && response.data.notes) {
            setNotes(response.data.notes);
          }
        } catch (error) {
          console.error("Error fetching notes:", error);
        }
      }
    };

    if (user) {
      fetchNotes();
    }
  }, [user]);

  return (
    <div className="grainy min-h-screen">
      <div className="max-w-7xl mx-auto p-10">
        <div className="h-14"></div>
        <div className="flex justify-between items-center md:flex-row flex-col">
          <div className="flex items-center">
            <Link href="/">
              <Button className="bg-[#47423e] hover:bg-[#47423e]/90" size="sm">
                <ArrowLeft className="mr-1 w-4 h-4" />
                Back
              </Button>
            </Link>
            <div className="w-4"></div>
            <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
            <div className="w-4"></div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center">
                  <div className="bg-[#e2dac4] p-1 rounded-full border border-[#47423e]/30">
                    <Button size="icon" variant="outline" className="rounded-full bg-white">
                      <User className="h-5 w-5 text-[#47423e]" />
                    </Button>
                  </div>
                  <div className="ml-2 flex items-center">
                    <div className="mr-3">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-[#47423e]">
                          {user.name}
                        </span>
                        <span className="ml-2 text-xs bg-[#e2dac4] text-[#47423e] px-2 py-0.5 rounded-full">
                          Current User
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        ID: {user.id.substring(0, 10)}...
                      </span>
                    </div>
                    <Link href="/">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center border-[#47423e]/30 hover:bg-[#e2dac4]/30"
                      >
                        <User className="h-4 w-4 mr-1 text-[#47423e]" />
                        <span className="text-[#47423e]">Switch User</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  <Button size="icon" variant="outline" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                  <div className="ml-2">
                    <span className="text-sm font-medium">Guest User</span>
                    <div className="text-xs text-gray-500">
                      Not authenticated
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-8"></div>
        <Separator />
        <div className="h-8"></div>

        {loading ? (
          <div className="text-center">
            <h2 className="text-xl text-gray-500">Loading...</h2>
          </div>
        ) : (
          <>
            {/* if no notes, display this */}
            {notes.length === 0 && (
              <div className="text-center">
                <h2 className="text-xl text-gray-500">You have no notes yet.</h2>
              </div>
            )}

            {/* display all the notes */}
            <div className="grid sm:grid-cols-3 md:grid-cols-5 grid-cols-1 gap-3">
              <CreateNoteDialog />
              {notes.map((note) => {
                return (
                  <div key={note.id} className="relative">
                    <PdfDownloadButton noteId={note.id} noteName={note.name} />
                    <a href={`/notebook/${note.id}`}>
                      <div className="border border-stone-300 rounded-lg overflow-hidden flex flex-col hover:shadow-xl transition hover:-translate-y-1">
                        {note.imageUrl && note.imageUrl.startsWith('data:') ? (
                          // For data URLs, use an img tag instead of Next.js Image
                          <img
                            className="w-full h-[200px] object-cover"
                            alt={note.name}
                            src={note.imageUrl}
                          />
                        ) : !note.imageUrl ? (
                          // For local profile.jpg fallback, use img tag
                          <img
                            className="w-full h-[200px] object-cover"
                            alt={note.name}
                            src="/profile.jpg"
                          />
                        ) : (
                          // For regular URLs, use Next.js Image
                          <Image
                            width={400}
                            height={200}
                            alt={note.name}
                            src={note.imageUrl}
                          />
                        )}
                        <div className="p-4">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {note.name}
                          </h3>
                          <div className="h-1"></div>
                          <p className="text-sm text-gray-500">
                            {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : 'No date'}
                          </p>
                        </div>
                      </div>
                    </a>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardClient;


