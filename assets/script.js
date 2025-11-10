document.addEventListener('DOMContentLoaded', () => {
  const mergeBtn = document.getElementById('merge-btn');
  const mergeInput = document.getElementById('merge-input');
  const mergeDownload = document.getElementById('merge-download');

  const compressBtn = document.getElementById('compress-btn');
  const compressInput = document.getElementById('compress-input');
  const compressDownload = document.getElementById('compress-download');

  mergeBtn.addEventListener('click', async () => {
    const files = Array.from(mergeInput.files);
    if (!files.length) return alert('Select at least one PDF.');

    const mergedPdf = await PDFLib.PDFDocument.create();
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(bytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((p) => mergedPdf.addPage(p));
    }
    const mergedBytes = await mergedPdf.save();
    const blob = new Blob([mergedBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    mergeDownload.href = url;
    mergeDownload.download = 'merged.pdf';
    mergeDownload.classList.remove('hidden');
    mergeDownload.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  });

  compressBtn.addEventListener('click', async () => {
    const file = compressInput.files[0];
    if (!file) return alert('Select a PDF first.');

    const pdfData = await file.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 1.0 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;

      const imgData = canvas.toDataURL('image/jpeg', 0.7);
      if (i > 1) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    }

    const compressedBlob = pdf.output('blob');
    const url = URL.createObjectURL(compressedBlob);
    compressDownload.href = url;
    compressDownload.download = 'compressed.pdf';
    compressDownload.classList.remove('hidden');
    compressDownload.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  });
});
