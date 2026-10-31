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

    const pdfBlob = pdf.output('blob');
    const safeFileName = `${(fileName || 'Resume').replace(/[\/\\?%*:|"<>]/g, '_')}_Resume.pdf`;
    saveAs(pdfBlob, safeFileName);
  } finally {
    if (wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
    }
  }
}

