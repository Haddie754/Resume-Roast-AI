import {
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TabStopPosition,
  TabStopType,
  TextRun,
} from "docx";
import type { StructuredResume } from "@/lib/prompts/buildResumePrompt";

// Generates a clean, ATS-safe .docx from the same StructuredResume the PDF uses.
// Runs client-side (Packer.toBlob) — no server compute.

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 220, after: 80 },
    border: {
      bottom: { color: "CCCCCC", space: 1, style: BorderStyle.SINGLE, size: 6 },
    },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 22 })],
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 40 },
    children: [new TextRun({ text, size: 20 })],
  });
}

function entryHeader(left: string, right?: string): Paragraph {
  const children = [new TextRun({ text: left, bold: true, size: 21 })];
  if (right) children.push(new TextRun({ text: `\t${right}`, size: 18, color: "555555" }));
  return new Paragraph({
    spacing: { before: 100, after: 20 },
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children,
  });
}

function subline(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 20 },
    children: [new TextRun({ text, size: 19, color: "333333" })],
  });
}

export async function buildResumeDocx(resume: StructuredResume): Promise<Blob> {
  const c = resume.contact;
  const contact = [c.email, c.phone, c.location, ...(c.links ?? [])]
    .filter(Boolean)
    .join("   •   ");

  const children: Paragraph[] = [
    new Paragraph({ children: [new TextRun({ text: resume.name, bold: true, size: 40 })] }),
  ];

  if (resume.headline) {
    children.push(
      new Paragraph({
        spacing: { after: 20 },
        children: [new TextRun({ text: resume.headline, size: 22, color: "444444" })],
      }),
    );
  }
  if (contact) {
    children.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: contact, size: 18, color: "444444" })],
      }),
    );
  }

  if (resume.summary) {
    children.push(sectionHeading("Summary"));
    children.push(new Paragraph({ children: [new TextRun({ text: resume.summary, size: 20 })] }));
  }

  if (resume.skills?.length) {
    children.push(sectionHeading("Skills"));
    children.push(
      new Paragraph({ children: [new TextRun({ text: resume.skills.join("   •   "), size: 20 })] }),
    );
  }

  if (resume.experience?.length) {
    children.push(sectionHeading("Experience"));
    for (const e of resume.experience) {
      children.push(entryHeader(`${e.title}${e.company ? `, ${e.company}` : ""}`, e.dates));
      if (e.location) children.push(subline(e.location));
      for (const b of e.bullets ?? []) children.push(bullet(b));
    }
  }

  if (resume.projects?.length) {
    children.push(sectionHeading("Projects"));
    for (const p of resume.projects) {
      children.push(entryHeader(p.name, p.dates));
      for (const b of p.bullets ?? []) children.push(bullet(b));
    }
  }

  if (resume.education?.length) {
    children.push(sectionHeading("Education"));
    for (const ed of resume.education) {
      children.push(entryHeader(ed.school, ed.dates));
      if (ed.degree) children.push(subline(ed.degree));
      if (ed.details) children.push(subline(ed.details));
    }
  }

  const doc = new Document({
    creator: "FireThis",
    title: `${resume.name} — Resume`,
    sections: [
      {
        properties: { page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } } },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}
