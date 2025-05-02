"use client";

import React from 'react';
import { Download } from 'lucide-react';
import { Button } from './ui/button';
import { generatePDF } from '@/lib/pdf-utils';
import axios from 'axios';
import { toast } from 'sonner';

type Props = {
  noteId: number | undefined;
  noteName: string;
};

const PdfDownloadButton = ({ noteId, noteName }: Props) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to the note page
    e.stopPropagation(); // Stop event propagation

    if (!noteId) {
      toast.error('Note ID is missing');
      return;
    }

    setIsLoading(true);

    try {
      // Fetch the note content
      const response = await axios.get(`/api/getPdf?noteId=${noteId}`);
      const { note } = response.data;

      if (note && note.editorState) {
        // Show a toast notification that PDF generation has started
        toast.loading('Generating PDF...', { id: 'pdf-generation' });

        // Generate and download the PDF
        const success = await generatePDF(noteId, note.name, note.editorState);

        if (success) {
          toast.success('PDF downloaded successfully', { id: 'pdf-generation' });
        } else {
          toast.error('Failed to generate PDF', { id: 'pdf-generation' });
        }
      } else {
        toast.error('Note content not found');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      className="absolute top-2 right-2 bg-white/90 hover:bg-white z-10 rounded-full p-1.5 shadow-md transition-all hover:scale-110"
      onClick={handleDownload}
      disabled={isLoading}
      title="Download as PDF"
    >
      {isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#47423e] border-t-transparent" />
      ) : (
        <Download className="h-4 w-4 text-[#47423e]" />
      )}
      <span className="sr-only">Download PDF</span>
    </Button>
  );
};

export default PdfDownloadButton;
