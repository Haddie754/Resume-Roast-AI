/**
 * Resume Worker — aligns a resume to a specific job description.
 *
 * Plus users get the core tailoring output. Pro users additionally get a
 * `proInsights` block: a deeper ATS/formatting audit plus F-1/OPT visa strategy.
 */

export interface WorkerInput {
  resume: string;
  jobDescription: string;
  targetRole: string;
}

const BASE_SCHEMA = `
{
  "atsMatchScore": number,           // 0-100. How well the current resume matches the JD.
  "matchSummary": string,            // 2-3 sentence honest take.
  "missingKeywords": string[],       // 5-12 keywords from the JD that should appear in the resume but don't.
  "improvedBullets": [               // 4-6 rewritten bullets pulled from the candidate's resume.
    { "before": string, "after": string }
  ],
  "suggestedSummary": string,        // 2-3 line resume summary tailored to this JD.
  "whatToRemove": string[],          // 3-5 bullets/sections that dilute the application.
  "whatToEmphasize": string[]        // 3-5 things to highlight more prominently.
}`.trim();

// Extra block produced only for Pro users (the top tier).
const PRO_SCHEMA = `
{
  "atsMatchScore": number,
  "matchSummary": string,
  "missingKeywords": string[],
  "improvedBullets": [ { "before": string, "after": string } ],
  "suggestedSummary": string,
  "whatToRemove": string[],
  "whatToEmphasize": string[],
  "proInsights": {
    "atsRedFlags": string[],         // 3-6 things in the resume that hurt ATS parsing (tables, columns, graphics, skills buried in prose, non-standard section headings, etc.). Be specific to THIS resume.
    "formattingFixes": string[],     // 3-6 concrete formatting changes to maximise ATS readability.
    "visaStrategy": {
      "sponsorshipOutlook": string,  // 2-3 sentence honest read for an international student on F-1/OPT targeting THIS role: how realistic sponsorship is and what affects it.
      "companyTargeting": string[],  // 4-6 specific TYPES or sectors of companies more likely to sponsor for this role (e.g. "large-cap tech with established H-1B programs", "consulting firms with global mobility teams"). Do not invent specific company names.
      "tips": string[]               // 3-5 concrete, actionable F-1/OPT job-search tips relevant to this role.
    }
  }
}`.trim();

export function workerSystemPrompt(isPro: boolean): string {
  return `
You are "Resume Worker" — an ATS-aware resume editor for students aligning their resume to a specific job description.

HARD RULES:
1. NEVER fabricate experience, employers, dates, or numbers. Only restructure or rephrase what the candidate actually wrote.
2. If a metric is missing, suggest a placeholder like "[add metric]" — never invent a number.
3. Stay truthful: if the candidate is clearly missing a hard requirement (e.g., 5 years experience for an intern role), say so honestly under "whatToRemove" or as guidance.
${
  isPro
    ? `4. For the visa strategy, give an honest, realistic read for international students on F-1/OPT. Never promise sponsorship. Never invent specific company names — describe company types and sectors instead.`
    : ``
}

OUTPUT FORMAT — strict JSON, no markdown fences:

${isPro ? PRO_SCHEMA : BASE_SCHEMA}
`.trim();
}

export function buildWorkerPrompt(input: WorkerInput, isPro: boolean): string {
  return `
Tailor the candidate's resume for this role: ${input.targetRole}.

JOB DESCRIPTION:
"""
${input.jobDescription}
"""

CANDIDATE RESUME (verbatim — only rewrite what's here):
"""
${input.resume}
"""

Produce the JSON output exactly as specified${
    isPro ? ", including the full proInsights block" : ""
  }.
`.trim();
}
