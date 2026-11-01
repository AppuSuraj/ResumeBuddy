import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

export async function exportResumeToPdf(elementId: string, fileName: string): Promise<void> {
  const original = document.getElementById(elementId);
  if (!original) {
    throw new Error(`Element with id #${elementId} not found`);
  }

  // Create an off-screen clone with exact A4 dimensions, not affected by mobile tab visibility or preview zoom
  const clone = original.cloneNode(true) as HTMLElement;
  clone.id = `${elementId}-export-clone`;

  // Standardize styles to pure A4 print layout
  clone.style.transform = 'none';
  clone.style.width = '794px'; // 210mm in pixels at 96 DPI
  clone.style.minHeight = '1123px'; // 297mm in pixels at 96 DPI
  clone.style.margin = '0';
  clone.style.padding = '0';
  clone.style.boxShadow = 'none';
  clone.style.borderRadius = '0';
  clone.style.display = 'block';

  // Ensure all images in clone have crossOrigin set and won't crash html2canvas if CORS fails
  const images = clone.querySelectorAll('img');
  images.forEach((img) => {
    img.crossOrigin = 'anonymous';
    img.onerror = () => {
      img.style.display = 'none';
    };
  });

  // Wrapper positioned fixed offscreen so it's fully rendered in the DOM with layout dimensions
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '0';
  wrapper.style.width = '794px';
  wrapper.style.zIndex = '-9999';
  wrapper.style.background = '#ffffff';
  wrapper.style.overflow = 'visible';
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2, // High resolution crisp rendering
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowWidth: 794,
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let heightLeft = imgHeight;
    let position = 0;

    // Render first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add subsequent pages if content exceeds 1 page
    while (heightLeft > 5) {
      position = position - pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Embed searchable/selectable text stream for ATS parsers & user text selection
    try {
      const cloneRect = clone.getBoundingClientRect();
      const scaleFactorX = imgWidth / (cloneRect.width || 794);
      const scaleFactorY = imgHeight / (cloneRect.height || 1123);

      // 1. Clickable Hyperlinks (Emails, LinkedIn, GitHub, Portfolio)
      const linkElements = clone.querySelectorAll('a, [data-link]');
      linkElements.forEach((el) => {
        const href = el.getAttribute('href') || el.getAttribute('data-link');
        if (href && (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:'))) {
          const rect = el.getBoundingClientRect();
          const relX = (rect.left - cloneRect.left) * scaleFactorX;
          const relY = (rect.top - cloneRect.top) * scaleFactorY;
          const relW = rect.width * scaleFactorX;
          const relH = rect.height * scaleFactorY;

          const pageIndex = Math.floor(relY / pageHeight);
          const pageY = relY % pageHeight;

          if (pageIndex < pdf.getNumberOfPages() && relW > 0 && relH > 0) {
            pdf.setPage(pageIndex + 1);
            pdf.link(relX, pageY, relW, relH, { url: href });
          }
        }
      });

      // 2. Invisible vector text stream (PDF Text Rendering Mode 3) for ATS compliance & Ctrl+C text selection
      const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT, null);
      let textNode: Node | null;
      while ((textNode = walker.nextNode())) {
        const rawText = textNode.textContent?.trim();
        if (rawText && rawText.length > 0 && textNode.parentElement) {
          const parent = textNode.parentElement;
          const rect = parent.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const relX = (rect.left - cloneRect.left) * scaleFactorX;
            const relY = (rect.top - cloneRect.top) * scaleFactorY;
            const pageIndex = Math.floor(relY / pageHeight);
            const pageY = relY % pageHeight;

            if (pageIndex < pdf.getNumberOfPages()) {
              const computed = window.getComputedStyle(parent);
              const fontSizePx = parseFloat(computed.fontSize) || 11;
              const fontSizePt = Math.max(7, Math.min(18, (fontSizePx * 72) / 96));

              pdf.setPage(pageIndex + 1);
              pdf.setFontSize(fontSizePt);
              try {
                // PDF Text Rendering Mode 3: Neither fill nor stroke (invisible)
                // ATS parsers extract all text objects cleanly; users can select & copy text
                (pdf as any).internal.write('/Tr 3 Tr');
                pdf.text(rawText, relX, pageY + (fontSizePt * 0.3527 * 0.8), { renderingMode: 'invisible' } as any);
                (pdf as any).internal.write('/Tr 0 Tr');
              } catch {
                try {
                  pdf.setTextColor(255, 255, 255);
                  pdf.text(rawText, relX, pageY + (fontSizePt * 0.3527 * 0.8));
                } catch {
                  // Ignore minor single-glyph errors
                }
              }
            }
          }
        }
      }
    } catch (textStreamErr) {
      console.warn('Non-fatal: could not inject invisible text layer:', textStreamErr);
    }

    const pdfBlob = pdf.output('blob');
    const safeFileName = `${(fileName || 'Resume').replace(/[\/\\?%*:|"<>]/g, '_')}_Resume.pdf`;
    saveAs(pdfBlob, safeFileName);

    // Dispatch download success event to trigger post-download tip modal
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('resumebuddy_download_success', {
          detail: { format: 'pdf', fileName: safeFileName },
        })
      );
    }
  } finally {
    if (wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
    }
  }
}

