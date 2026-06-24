import { Document, Packer, Paragraph, TextRun } from "docx";

// Plain cover-letter .docx: blank-line-separated blocks become paragraphs;
// single newlines inside a block become soft line breaks.
export async function buildLetterDocx(text: string): Promise<Blob> {
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  const children = blocks.map(
    (block) =>
      new Paragraph({
        spacing: { after: 200 },
        children: block.split(/\n/).map(
          (line, i) =>
            new TextRun({ text: line, size: 22, ...(i > 0 ? { break: 1 } : {}) }),
        ),
      }),
  );

  const doc = new Document({
    creator: "FireThis",
    title: "Cover Letter",
    sections: [
      {
        properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}
