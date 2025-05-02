"use client";
import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import TipTapMenuBar from "./TipTapMenuBar";
import { Button } from "./ui/button";
import { useDebounce } from "@/lib/useDebounce";
import { useMutation } from "@tanstack/react-query";
import Text from "@tiptap/extension-text";
import axios from "axios";
import { NoteType } from "@/lib/db/schema";
import { useCompletion } from "ai/react";
import { toast } from "sonner";

type Props = { note: NoteType };

const TipTapEditor = ({ note }: Props) => {
  const [editorState, setEditorState] = React.useState(
    note.editorState || `<h1>${note.name}</h1>`
  );
  const { complete, completion, isLoading, stop } = useCompletion({
    api: "/api/gemini-completion", // Use our new Gemini API route
    onFinish: () => {
      // Reset lastCompletion when a completion finishes
      console.log("Completion finished, resetting state");
      setTimeout(() => {
        lastCompletion.current = "";
      }, 300);
    },
  });
  const saveNote = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/api/saveNote", {
        noteId: note.id,
        editorState,
      });
      return response.data;
    },
  });
  const customText = Text.extend({
    addKeyboardShortcuts() {
      return {
        "Shift-a": () => {
          // Reset the completion state
          lastCompletion.current = "";

          // Get the current cursor position
          const { from } = this.editor.state.selection;

          // Get text before the cursor (up to 100 characters)
          const textBefore = this.editor.getText().slice(Math.max(0, from - 200), from);

          // Take the last 30-50 words for context
          const words = textBefore.split(/\s+/);
          const prompt = words.slice(Math.max(0, words.length - 50)).join(" ").trim();

          console.log("AI completion triggered with prompt:", prompt);

          // Stop any ongoing completion
          stop();

          // Start a new completion
          complete(prompt);
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    autofocus: true,
    extensions: [StarterKit, customText],
    content: editorState,
    onUpdate: ({ editor }) => {
      setEditorState(editor.getHTML());
    },
  });
  const lastCompletion = React.useRef("");

  React.useEffect(() => {
    if (!completion || !editor) return;

    // Get the difference between the current completion and what we've already inserted
    const diff = completion.slice(lastCompletion.current.length);

    // If there's new content to insert
    if (diff) {
      console.log("Received new completion chunk:", diff);

      // Update our record of what we've inserted
      lastCompletion.current = completion;

      // Insert the new content
      editor.commands.insertContent(diff);
    }
  }, [completion, editor]);

  const debouncedEditorState = useDebounce(editorState, 500);
  React.useEffect(() => {
    // save to db
    if (debouncedEditorState === "") return;
    saveNote.mutate(undefined, {
      onSuccess: (data) => {
        console.log("success update!", data);
        // Show a subtle toast notification for successful save
        toast.success("Note saved", {
          position: "bottom-right",
          duration: 1500,
          style: {
            backgroundColor: "#e2dac4",
            color: "#47423e",
            border: "1px solid #47423e"
          }
        });
      },
      onError: (err) => {
        console.error(err);
        toast.error("Failed to save note");
      },
    });
  }, [debouncedEditorState]);
  return (
    <>
      <div className="flex">
        {editor && <TipTapMenuBar editor={editor} />}
        <Button disabled variant={"outline"}>
          {saveNote.isLoading ? "Saving..." : "Saved"}
        </Button>
      </div>

      <div className="prose prose-sm w-full mt-4">
        <EditorContent editor={editor} />
      </div>
      <div className="h-4"></div>
      <span className="text-sm">
        Tip: Press{" "}
        <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
          Shift + A
        </kbd>{" "}
        for AI autocomplete
      </span>
    </>
  );
};

export default TipTapEditor;
