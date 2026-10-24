import html2pdf from 'html2pdf.js';

export function exportResumeToPdf(elementId: string, fileName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const element = document.getElementById(elementId);
    if (!element) {
      reject(new Error(`Element with id #${elementId} not found`));
      return;
    }

    // Configure high quality html2pdf options
    const opt = {
      margin: 0,
      filename: `${fileName || 'Resume'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2, // High resolution rendering
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait' as const,
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => resolve())
      .catch((err: any) => reject(err));
  });
}
