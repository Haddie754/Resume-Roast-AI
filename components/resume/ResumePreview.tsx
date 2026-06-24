import type { StructuredResume } from "@/lib/prompts/buildResumePrompt";

// Reliable, browser-agnostic HTML preview that mirrors the PDF/DOCX layout.
// (Embedding the actual PDF fails in Safari, so we render from the same data.)
export default function ResumePreview({ resume }: { resume: StructuredResume }) {
  const c = resume.contact;
  const contact = [c.email, c.phone, c.location, ...(c.links ?? [])]
    .filter(Boolean)
    .join("   •   ");

  return (
    <div className="max-h-[720px] overflow-y-auto rounded-xl border border-white/10 bg-white p-8 shadow-inner">
      <div className="mx-auto max-w-[660px] text-[13px] leading-relaxed text-[#1a1a1a]">
        <h1 className="text-2xl font-bold leading-tight">{resume.name}</h1>
        {resume.headline ? (
          <p className="mt-0.5 text-sm text-gray-600">{resume.headline}</p>
        ) : null}
        {contact ? <p className="mt-1 text-xs text-gray-600">{contact}</p> : null}

        {resume.summary ? (
          <Section title="Summary">
            <p>{resume.summary}</p>
          </Section>
        ) : null}

        {resume.skills?.length ? (
          <Section title="Skills">
            <p>{resume.skills.join("   •   ")}</p>
          </Section>
        ) : null}

        {resume.experience?.length ? (
          <Section title="Experience">
            {resume.experience.map((e, i) => (
              <Entry
                key={i}
                title={`${e.title}${e.company ? `, ${e.company}` : ""}`}
                dates={e.dates}
                sub={e.location}
                bullets={e.bullets}
              />
            ))}
          </Section>
        ) : null}

        {resume.projects?.length ? (
          <Section title="Projects">
            {resume.projects.map((p, i) => (
              <Entry key={i} title={p.name} dates={p.dates} bullets={p.bullets} />
            ))}
          </Section>
        ) : null}

        {resume.education?.length ? (
          <Section title="Education">
            {resume.education.map((ed, i) => (
              <Entry
                key={i}
                title={ed.school}
                dates={ed.dates}
                sub={ed.degree}
                extra={ed.details}
              />
            ))}
          </Section>
        ) : null}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h2 className="mb-1.5 border-b border-gray-300 pb-0.5 text-[11px] font-bold uppercase tracking-wide">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Entry({
  title,
  dates,
  sub,
  extra,
  bullets,
}: {
  title: string;
  dates?: string;
  sub?: string;
  extra?: string;
  bullets?: string[];
}) {
  return (
    <div className="mb-3">
      <div className="flex items-start justify-between gap-3">
        <p className="font-bold">{title}</p>
        {dates ? <p className="shrink-0 text-xs text-gray-500">{dates}</p> : null}
      </div>
      {sub ? <p className="text-gray-700">{sub}</p> : null}
      {extra ? <p className="text-gray-700">{extra}</p> : null}
      {bullets?.length ? (
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
