export class PDFUtil {
  static downloadPdfBytes(pdfBytes: ArrayBuffer) {
    if (pdfBytes.byteLength > 0) {
      //chrrome/ff/safari/edge working
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(pdfBlob);
      link.download = `${this.randomGuid()}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  }
  private static randomGuid = () => [...Array(12)].map(() => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
}
