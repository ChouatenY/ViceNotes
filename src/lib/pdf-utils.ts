"use client";

import { toast } from "sonner";

/**
 * Utility function to convert HTML content to a downloadable PDF
 * This creates a temporary container, renders the HTML content, and generates a PDF
 */
export const generatePDF = async (noteId: number | undefined, noteName: string, htmlContent: string) => {
  // Dynamically import jsPDF and html2canvas to avoid SSR issues
  const { default: jsPDF } = await import('jspdf');
  const { default: html2canvas } = await import('html2canvas');

  try {
    // Create a temporary container for the content
    const container = document.createElement('div');
    container.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #47423e; border-bottom: 2px solid #e2dac4; padding-bottom: 10px;">${noteName}</h1>
        </div>
        <div class="tiptap-content" style="line-height: 1.6; color: #333;">
          ${htmlContent}
        </div>
      </div>
    `;

    // Add styles for TipTap content
    const style = document.createElement('style');
    style.textContent = `
      .tiptap-content h1 { font-size: 24px; margin-top: 24px; margin-bottom: 16px; color: #47423e; }
      .tiptap-content h2 { font-size: 20px; margin-top: 20px; margin-bottom: 14px; color: #47423e; }
      .tiptap-content h3 { font-size: 18px; margin-top: 18px; margin-bottom: 12px; color: #47423e; }
      .tiptap-content p { margin-bottom: 16px; }
      .tiptap-content ul, .tiptap-content ol { margin-bottom: 16px; padding-left: 20px; }
      .tiptap-content li { margin-bottom: 8px; }
      .tiptap-content blockquote { border-left: 4px solid #e2dac4; padding-left: 16px; margin-left: 0; color: #666; }
      .tiptap-content code { background-color: #f5f5f5; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
      .tiptap-content pre { background-color: #f5f5f5; padding: 16px; border-radius: 4px; overflow-x: auto; font-family: monospace; }
      .tiptap-content img { max-width: 100%; height: auto; }
    `;
    container.appendChild(style);

    // Apply some basic styling to the container
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '800px'; // Fixed width for better PDF formatting

    // Add to document body temporarily
    document.body.appendChild(container);

    // Use html2canvas to capture the content
    const canvas = await html2canvas(container, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff', // Ensure white background
      onclone: (clonedDoc) => {
        // Additional processing on the cloned document if needed
        const clonedContainer = clonedDoc.querySelector('.tiptap-content');
        if (clonedContainer) {
          // Force all images to load before capturing
          const images = clonedContainer.querySelectorAll('img');
          images.forEach(img => {
            if (img.complete) return;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
          });
        }
      }
    });

    // Create PDF document (A4 format)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Get PDF dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/png');

    // Calculate dimensions to fit content on page
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Calculate the ratio to fit the width of the PDF
    const ratio = pdfWidth / imgWidth * 0.9; // 90% of page width

    // Calculate the scaled dimensions
    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;

    // Calculate margins to center the content
    const marginX = (pdfWidth - scaledWidth) / 2;
    const marginY = 10; // Top margin

    // If the content fits on one page
    if (scaledHeight < (pdfHeight - marginY * 2)) {
      pdf.addImage(imgData, 'PNG', marginX, marginY, scaledWidth, scaledHeight);
    } else {
      // For multi-page content, we need to split it across pages
      let remainingHeight = scaledHeight;
      let currentPosition = 0;

      // Available height on the first page
      const firstPageAvailableHeight = pdfHeight - (marginY * 2);

      // Add first page content
      pdf.addImage(
        imgData,
        'PNG',
        marginX,
        marginY,
        scaledWidth,
        scaledHeight,
        undefined,
        'FAST',
        0,
        currentPosition / ratio
      );

      // Subtract the height we've already used
      remainingHeight -= firstPageAvailableHeight;
      currentPosition += firstPageAvailableHeight / ratio;

      // Add additional pages as needed
      while (remainingHeight > 0) {
        pdf.addPage();

        const pageAvailableHeight = pdfHeight - (marginY * 2);
        const heightToUse = Math.min(remainingHeight, pageAvailableHeight);

        pdf.addImage(
          imgData,
          'PNG',
          marginX,
          marginY,
          scaledWidth,
          scaledHeight,
          undefined,
          'FAST',
          0,
          currentPosition / ratio
        );

        remainingHeight -= heightToUse;
        currentPosition += heightToUse / ratio;
      }
    }

    // Save the PDF
    pdf.save(`${noteName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);

    // Clean up
    document.body.removeChild(container);

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF. Please try again.');
    return false;
  }
};
