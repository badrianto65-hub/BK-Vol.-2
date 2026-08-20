import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportElementToPdf = async (
  elementId: string,
  filename: string = 'dokumen-bk.pdf'
): Promise<boolean> => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id #${elementId} not found`);
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return false;
  }
};

export const triggerPrintModal = (elementId: string) => {
  const printElement = document.getElementById(elementId);
  if (!printElement) return;

  const windowUrl = 'about:blank';
  const uniqueName = new Date().getTime().toString();
  const printWindow = window.open(windowUrl, uniqueName, 'left=50,top=50,width=900,height=800');

  if (!printWindow) {
    // Fallback if popup blocked: print current page with CSS
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cetak Dokumen BK Vol. 2</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Times New Roman', Times, serif; background: white; color: black; }
          .no-print { display: none !important; }
        </style>
      </head>
      <body class="p-6">
        ${printElement.innerHTML}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
