"use client";
import React from "react";
import { Button } from "./ui/button";
import { Trash } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  noteId: number;
};

const DeleteButton = ({ noteId }: Props) => {
  const router = useRouter();
  const deleteNote = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/api/deleteNote", {
        noteId,
      });
      return response.data;
    },
  });
  return (
    <Button
      variant={"destructive"}
      size="sm"
      disabled={deleteNote.isLoading}
      onClick={() => {
        toast.promise(
          new Promise((resolve, reject) => {
            toast(
              <div className="flex flex-col gap-2">
                <p className="font-medium">Are you sure you want to delete this note?</p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      deleteNote.mutate(undefined, {
                        onSuccess: () => {
                          resolve("Note deleted successfully");
                          router.push("/dashboard");
                        },
                        onError: (err) => {
                          console.error(err);
                          reject(err);
                        },
                      });
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      resolve("Cancelled");
                      toast.dismiss();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>,
              {
                duration: 10000,
              }
            );
          }),
          {
            loading: "Deleting note...",
            success: (data) => data === "Cancelled" ? "Cancelled" : "Note deleted successfully",
            error: "Failed to delete note",
          }
        );
      }}
    >
      <Trash />
    </Button>
  );
};

export default DeleteButton;
