import PDFDocument from "pdfkit";

export function createTextPdfBuffer(text) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 48,
      size: "A4",
    });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (error) => reject(error));

    doc.font("Helvetica");
    doc.fontSize(12);
    doc.text(text || "", {
      align: "left",
      lineGap: 4,
    });
    doc.end();
  });
}


