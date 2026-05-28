/**
 * The FireThis mascot. Renders /public/mascot.png.
 * Size and effects are controlled via Tailwind classes passed in `className`
 * (e.g. "h-8 w-8" for a logo, "h-28 w-28" for the hero).
 *
 * Drop your mascot artwork at `public/mascot.png` — ideally a transparent PNG
 * so it sits cleanly on the dark background.
 */
export default function Mascot({
  className = "h-8 w-8",
  alt = "FireThis mascot",
}: {
  className?: string;
  alt?: string;
}) {
  // Plain <img> (not next/image) — it's a small static logo, no optimization needed.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/mascot.png" alt={alt} className={className} />;
}
