import type { StructuredResume } from "@/lib/prompts/buildResumePrompt";

/**
 * Editable working copy of a generated resume. Every list item and bullet
 * carries an `include` flag so the user can trim content (e.g. drop the oldest
 * job to hit one page), and all text is editable. fromDraft() turns it back
 * into a StructuredResume for the preview + PDF/DOCX — dropping excluded items.
 *
 * All client-side: editing/toggling never hits the AI or the server.
 */

export interface DraftBullet {
  text: string;
  include: boolean;
}

export interface DraftExperience {
  include: boolean;
  title: string;
  company: string;
  location: string;
  dates: string;
  bullets: DraftBullet[];
}

export interface DraftProject {
  include: boolean;
  name: string;
  dates: string;
  bullets: DraftBullet[];
}

export interface DraftEducation {
  include: boolean;
  school: string;
  degree: string;
  location: string;
  dates: string;
  details: string;
}

export interface DraftResume {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  links: string[];
  summary: string;
  skillsText: string; // comma/newline separated, split on export
  experience: DraftExperience[];
  projects: DraftProject[];
  education: DraftEducation[];
}

const s = (v: string | undefined | null): string => v ?? "";

export function toDraft(r: StructuredResume): DraftResume {
  return {
    name: s(r.name),
    headline: s(r.headline),
    email: s(r.contact?.email),
    phone: s(r.contact?.phone),
    location: s(r.contact?.location),
    links: r.contact?.links ?? [],
    summary: s(r.summary),
    skillsText: (r.skills ?? []).join(", "),
    experience: (r.experience ?? []).map((e) => ({
      include: true,
      title: s(e.title),
      company: s(e.company),
      location: s(e.location),
      dates: s(e.dates),
      bullets: (e.bullets ?? []).map((b) => ({ text: b, include: true })),
    })),
    projects: (r.projects ?? []).map((p) => ({
      include: true,
      name: s(p.name),
      dates: s(p.dates),
      bullets: (p.bullets ?? []).map((b) => ({ text: b, include: true })),
    })),
    education: (r.education ?? []).map((ed) => ({
      include: true,
      school: s(ed.school),
      degree: s(ed.degree),
      location: s(ed.location),
      dates: s(ed.dates),
      details: s(ed.details),
    })),
  };
}

const u = (v: string): string | undefined => {
  const t = v.trim();
  return t.length ? t : undefined;
};

export function fromDraft(d: DraftResume): StructuredResume {
  return {
    name: d.name.trim(),
    headline: u(d.headline),
    contact: {
      email: u(d.email),
      phone: u(d.phone),
      location: u(d.location),
      links: d.links.length ? d.links : undefined,
    },
    summary: u(d.summary),
    skills: d.skillsText
      .split(/[,\n]/)
      .map((x) => x.trim())
      .filter(Boolean),
    experience: d.experience
      .filter((e) => e.include)
      .map((e) => ({
        title: e.title.trim(),
        company: e.company.trim(),
        location: u(e.location),
        dates: u(e.dates),
        bullets: e.bullets.filter((b) => b.include).map((b) => b.text.trim()).filter(Boolean),
      })),
    projects: d.projects
      .filter((p) => p.include)
      .map((p) => ({
        name: p.name.trim(),
        dates: u(p.dates),
        bullets: p.bullets.filter((b) => b.include).map((b) => b.text.trim()).filter(Boolean),
      })),
    education: d.education
      .filter((ed) => ed.include)
      .map((ed) => ({
        school: ed.school.trim(),
        degree: u(ed.degree),
        location: u(ed.location),
        dates: u(ed.dates),
        details: u(ed.details),
      })),
  };
}
