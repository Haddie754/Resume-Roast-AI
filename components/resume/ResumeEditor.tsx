"use client";

import type { DraftResume } from "@/lib/resume/resumeDraft";

const inputCls =
  "w-full rounded-md border border-white/10 bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-100 outline-none focus:border-brand-500";

type Update = (mut: (d: DraftResume) => void) => void;

export default function ResumeEditor({
  draft,
  update,
}: {
  draft: DraftResume;
  update: Update;
}) {
  return (
    <div className="space-y-6 rounded-xl border border-white/10 bg-zinc-950/40 p-5">
      <p className="text-xs text-zinc-500">
        Uncheck anything to drop it (great for trimming to one page). Edit any text directly —
        the preview and downloads update live.
      </p>

      {/* Header */}
      <Group title="Header">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name">
            <input
              className={inputCls}
              value={draft.name}
              onChange={(e) => update((d) => void (d.name = e.target.value))}
            />
          </Field>
          <Field label="Headline">
            <input
              className={inputCls}
              value={draft.headline}
              onChange={(e) => update((d) => void (d.headline = e.target.value))}
            />
          </Field>
          <Field label="Email">
            <input
              className={inputCls}
              value={draft.email}
              onChange={(e) => update((d) => void (d.email = e.target.value))}
            />
          </Field>
          <Field label="Phone">
            <input
              className={inputCls}
              value={draft.phone}
              onChange={(e) => update((d) => void (d.phone = e.target.value))}
            />
          </Field>
          <Field label="Location">
            <input
              className={inputCls}
              value={draft.location}
              onChange={(e) => update((d) => void (d.location = e.target.value))}
            />
          </Field>
        </div>
      </Group>

      {/* Summary */}
      <Group title="Summary">
        <textarea
          rows={3}
          className={inputCls}
          value={draft.summary}
          onChange={(e) => update((d) => void (d.summary = e.target.value))}
        />
      </Group>

      {/* Skills */}
      <Group title="Skills">
        <textarea
          rows={2}
          className={inputCls}
          value={draft.skillsText}
          onChange={(e) => update((d) => void (d.skillsText = e.target.value))}
        />
        <p className="mt-1 text-xs text-zinc-500">Separate skills with commas.</p>
      </Group>

      {/* Experience */}
      {draft.experience.length > 0 && (
        <Group title="Experience">
          <div className="space-y-4">
            {draft.experience.map((e, i) => (
              <EntryBox
                key={i}
                include={e.include}
                onToggle={(v) => update((d) => void (d.experience[i].include = v))}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className={inputCls}
                    placeholder="Title"
                    value={e.title}
                    onChange={(ev) => update((d) => void (d.experience[i].title = ev.target.value))}
                  />
                  <input
                    className={inputCls}
                    placeholder="Company"
                    value={e.company}
                    onChange={(ev) => update((d) => void (d.experience[i].company = ev.target.value))}
                  />
                  <input
                    className={inputCls}
                    placeholder="Dates"
                    value={e.dates}
                    onChange={(ev) => update((d) => void (d.experience[i].dates = ev.target.value))}
                  />
                  <input
                    className={inputCls}
                    placeholder="Location"
                    value={e.location}
                    onChange={(ev) => update((d) => void (d.experience[i].location = ev.target.value))}
                  />
                </div>
                <BulletList
                  bullets={e.bullets}
                  onToggle={(j, v) => update((d) => void (d.experience[i].bullets[j].include = v))}
                  onEdit={(j, v) => update((d) => void (d.experience[i].bullets[j].text = v))}
                />
              </EntryBox>
            ))}
          </div>
        </Group>
      )}

      {/* Projects */}
      {draft.projects.length > 0 && (
        <Group title="Projects">
          <div className="space-y-4">
            {draft.projects.map((p, i) => (
              <EntryBox
                key={i}
                include={p.include}
                onToggle={(v) => update((d) => void (d.projects[i].include = v))}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className={inputCls}
                    placeholder="Project name"
                    value={p.name}
                    onChange={(ev) => update((d) => void (d.projects[i].name = ev.target.value))}
                  />
                  <input
                    className={inputCls}
                    placeholder="Dates"
                    value={p.dates}
                    onChange={(ev) => update((d) => void (d.projects[i].dates = ev.target.value))}
                  />
                </div>
                <BulletList
                  bullets={p.bullets}
                  onToggle={(j, v) => update((d) => void (d.projects[i].bullets[j].include = v))}
                  onEdit={(j, v) => update((d) => void (d.projects[i].bullets[j].text = v))}
                />
              </EntryBox>
            ))}
          </div>
        </Group>
      )}

      {/* Education */}
      {draft.education.length > 0 && (
        <Group title="Education">
          <div className="space-y-4">
            {draft.education.map((ed, i) => (
              <EntryBox
                key={i}
                include={ed.include}
                onToggle={(v) => update((d) => void (d.education[i].include = v))}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className={inputCls}
                    placeholder="School"
                    value={ed.school}
                    onChange={(ev) => update((d) => void (d.education[i].school = ev.target.value))}
                  />
                  <input
                    className={inputCls}
                    placeholder="Degree"
                    value={ed.degree}
                    onChange={(ev) => update((d) => void (d.education[i].degree = ev.target.value))}
                  />
                  <input
                    className={inputCls}
                    placeholder="Dates"
                    value={ed.dates}
                    onChange={(ev) => update((d) => void (d.education[i].dates = ev.target.value))}
                  />
                  <input
                    className={inputCls}
                    placeholder="Details (GPA, honors)"
                    value={ed.details}
                    onChange={(ev) => update((d) => void (d.education[i].details = ev.target.value))}
                  />
                </div>
              </EntryBox>
            ))}
          </div>
        </Group>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">{title}</h4>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

function EntryBox({
  include,
  onToggle,
  children,
}: {
  include: boolean;
  onToggle: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border border-white/10 p-3 ${include ? "" : "opacity-50"}`}
    >
      <label className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-300">
        <input
          type="checkbox"
          checked={include}
          onChange={(e) => onToggle(e.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-zinc-950 text-brand-500 focus:ring-brand-500"
        />
        Include
      </label>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function BulletList({
  bullets,
  onToggle,
  onEdit,
}: {
  bullets: { text: string; include: boolean }[];
  onToggle: (j: number, v: boolean) => void;
  onEdit: (j: number, v: string) => void;
}) {
  if (!bullets.length) return null;
  return (
    <div className="space-y-2">
      {bullets.map((b, j) => (
        <div key={j} className={`flex items-start gap-2 ${b.include ? "" : "opacity-50"}`}>
          <input
            type="checkbox"
            checked={b.include}
            onChange={(e) => onToggle(j, e.target.checked)}
            className="mt-2 h-4 w-4 shrink-0 rounded border-white/20 bg-zinc-950 text-brand-500 focus:ring-brand-500"
          />
          <textarea
            rows={2}
            className="w-full rounded-md border border-white/10 bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-100 outline-none focus:border-brand-500"
            value={b.text}
            onChange={(e) => onEdit(j, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
