declare module 'pdf-parse' {
  interface PdfData {
    text: string;
    numpages: number;
    info: object;
  }
  function pdf(buffer: Buffer): Promise<PdfData>;
  export = pdf;
}
