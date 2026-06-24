/**
 * Resume Builder — regenerates the candidate's resume into a clean, structured,
 * ATS-safe document. Pro-only. Improves wording and impact from the candidate's
 * REAL content; never fabricates experience, employers, dates, or numbers.
 */

export interface ResumeContact {
  email?: string;
  phone?: string;
  location?: string;
  links?: string[]; // LinkedIn / GitHub / portfolio, as written
}

export interface ResumeExperience {
  company: string;
  title: string;
  location?: string;
  dates?: string; // e.g. "May 2024 – Aug 2024"
  bullets: string[];
}

export interface ResumeEducation {
  school: string;
  degree?: string; // e.g. "B.S. Computer Science"
  location?: string;
  dates?: string; // e.g. "Expected May 2026"
  details?: string; // GPA, honors, relevant coursework
}

export interface ResumeProject {
  name: string;
  dates?: string;
  bullets: string[];
}

export interface StructuredResume {
  name: string;
  headline?: string; // e.g. "Software Engineer Intern"
  contact: ResumeContact;
  summary?: string;
  skills: string[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects?: ResumeProject[];
}

export interface BuildResumeInput {
  resume: string;
  targetRole?: string;
  jobDescription?: string;
}

const SCHEMA = `
{
  "name": string,                    // The candidate's full name, exactly as on their resume.
  "headline": string,                // Short professional headline / target title (e.g. "Software Engineer Intern").
  "contact": {
    "email": string,                 // Only if present on the resume.
    "phone": string,                 // Only if present.
    "location": string,              // City, State — only if present.
    "links": string[]                // LinkedIn / GitHub / portfolio URLs, only if present.
  },
  "summary": string,                 // 2-3 line professional summary tailored to the target role.
  "skills": string[],                // 8-16 concrete skills pulled from the resume (+ JD-relevant ones the candidate actually has).
  "experience": [                    // Most recent first.
    {
      "company": string,
      "title": string,
      "location": string,            // Only if present.
      "dates": string,               // As written, e.g. "May 2024 – Aug 2024".
      "bullets": string[]            // 2-5 strong, action-verb-led, quantified-where-supported bullets.
    }
  ],
  "education": [
    {
      "school": string,
      "degree": string,
      "location": string,            // Only if present.
      "dates": string,
      "details": string              // GPA / honors / relevant coursework, only if present.
    }
  ],
  "projects": [                      // Optional — include only if the resume has projects.
    { "name": string, "dates": string, "bullets": string[] }
  ]
}`.trim();

export const BUILD_RESUME_SYSTEM_PROMPT = `
You are "Resume Builder" — you reconstruct a candidate's resume into a clean, ATS-safe, structured document.

HARD RULES:
1. NEVER fabricate experience, employers, titles, dates, schools, or numbers. Use ONLY what the candidate actually wrote — you may rephrase, reorganize, and strengthen wording, but not invent facts.
2. If a metric is missing, keep the bullet qualitative — do NOT insert placeholders like "[X%]" or invent a number.
3. Lead every experience/project bullet with a strong past-tense action verb. Tighten weak or vague bullets.
4. Keep it ATS-safe: plain text content, standard section names, no tables/columns/graphics implied. The output is pure structured data; formatting happens later.
5. If a target role or job description is given, tailor the summary, skill ordering, and bullet emphasis toward it — using only the candidate's real background.
6. Omit any field you don't have real data for (don't output empty strings for missing contact fields).

OUTPUT FORMAT — strict JSON, no markdown fences:

${SCHEMA}
`.trim();

export function buildResumeBuilderPrompt(input: BuildResumeInput): string {
  const target = input.targetRole ? `\nTARGET ROLE: ${input.targetRole}` : "";
  const jd = input.jobDescription
    ? `\nJOB DESCRIPTION (tailor toward this — do not invent matching experience):\n"""\n${input.jobDescription}\n"""`
    : "";

  return `
Rebuild this candidate's resume into the structured JSON format.${target}${jd}

CANDIDATE RESUME (use only what's here — rephrase and strengthen, never fabricate):
"""
${input.resume}
"""

Produce the JSON output exactly as specified.
`.trim();
}
