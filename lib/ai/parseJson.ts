/**
 * Defensive JSON parsing for model output.
 *
 * Even with responseMimeType=application/json, models occasionally:
 *   - wrap output in ```json ... ``` fences
 *   - prepend a stray sentence
 *   - emit trailing commentary
 *
 * We extract the largest {...} block and parse that.
 */

export function parseModelJson<T = unknown>(raw: string): T {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  const candidate =
    firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
      ? cleaned.slice(firstBrace, lastBrace + 1)
      : cleaned;

  try {
    return JSON.parse(candidate) as T;
  } catch (err) {
    throw new Error(
      `Model returned invalid JSON. First 200 chars: ${cleaned.slice(0, 200)}`,
    );
  }
}
