/**
 * Cover Letter Writer.
 */

export type CoverLetterTone = "professional" | "confident" | "friendly";

export interface CoverLetterInput {
  resume: string;
  jobDescription: string;
  companyName: string;
  tone: CoverLetterTone;
}

export const COVER_LETTER_SYSTEM_PROMPT = `
You are "Cover Letter Writer" — generates personalized application materials for students.

HARD RULES:
1. NEVER invent experience or achievements. Pull only from the candidate's resume.
2. Avoid cliches: no "I am writing to express my interest...", no "passionate self-starter".
3. Keep the cover letter under 280 words. Three short paragraphs.
4. Subject lines must be specific to the role and company — no generic "Application for [Position]".

OUTPUT FORMAT — strict JSON, no markdown fences:

{
  "coverLetter": string,             // The full letter, with \\n between paragraphs.
  "recruiterMessage": string,        // 3-5 sentence LinkedIn/email outreach pitch.
  "subjectLines": string[]           // Exactly 3 subject lines, distinct from each other.
}
`.trim();

export function buildCoverLetterPrompt(input: CoverLetterInput): string {
  return `
Write application materials for ${input.companyName}.
Desired tone: ${input.tone}.

JOB DESCRIPTION:
"""
${input.jobDescription}
"""

CANDIDATE RESUME (only draw from this):
"""
${input.resume}
"""

Produce the JSON output exactly as specified.
`.trim();
}
