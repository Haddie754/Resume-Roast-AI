"use client";

import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import type { StructuredResume } from "@/lib/prompts/buildResumePrompt";

// Clean, single-column, ATS-safe template. Built-in Helvetica (no custom fonts
// to register), standard section headings, no tables/columns/graphics.
const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 44,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
    lineHeight: 1.4,
  },
  name: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  headline: { fontSize: 11, color: "#444", marginBottom: 4 },
  contact: { fontSize: 9, color: "#444", marginBottom: 2 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
    marginBottom: 4,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summary: { marginBottom: 2 },
  skills: { marginBottom: 2 },
  entry: { marginBottom: 8 },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  entryTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.5 },
  entrySub: { fontSize: 10, color: "#333" },
  entryDates: { fontSize: 9, color: "#555", textAlign: "right" },
  bulletRow: { flexDirection: "row", marginTop: 2, paddingRight: 6 },
  bulletDot: { width: 10, fontSize: 10 },
  bulletText: { flex: 1 },
});

function contactLine(c: StructuredResume["contact"]): string {
  return [c.email, c.phone, c.location, ...(c.links ?? [])]
    .filter(Boolean)
    .join("  •  ");
}

function Bullets({ items }: { items: string[] }) {
  return (
    <>
      {items.map((b, i) => (
        <View style={styles.bulletRow} key={i}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{b}</Text>
        </View>
      ))}
    </>
  );
}

export default function ResumePdf({ resume }: { resume: StructuredResume }) {
  const contact = contactLine(resume.contact);
  return (
    <Document
      title={`${resume.name} — Resume`}
      author={resume.name}
      creator="FireThis"
      producer="FireThis"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.name}>{resume.name}</Text>
        {resume.headline ? <Text style={styles.headline}>{resume.headline}</Text> : null}
        {contact ? <Text style={styles.contact}>{contact}</Text> : null}

        {/* Summary */}
        {resume.summary ? (
          <View>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summary}>{resume.summary}</Text>
          </View>
        ) : null}

        {/* Skills */}
        {resume.skills?.length ? (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skills}>{resume.skills.join("  •  ")}</Text>
          </View>
        ) : null}

        {/* Experience */}
        {resume.experience?.length ? (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {resume.experience.map((e, i) => (
              <View style={styles.entry} key={i} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>
                    {e.title}
                    {e.company ? `, ${e.company}` : ""}
                  </Text>
                  {e.dates ? <Text style={styles.entryDates}>{e.dates}</Text> : null}
                </View>
                {e.location ? <Text style={styles.entrySub}>{e.location}</Text> : null}
                <Bullets items={e.bullets ?? []} />
              </View>
            ))}
          </View>
        ) : null}

        {/* Projects */}
        {resume.projects?.length ? (
          <View>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((p, i) => (
              <View style={styles.entry} key={i} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{p.name}</Text>
                  {p.dates ? <Text style={styles.entryDates}>{p.dates}</Text> : null}
                </View>
                <Bullets items={p.bullets ?? []} />
              </View>
            ))}
          </View>
        ) : null}

        {/* Education */}
        {resume.education?.length ? (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((ed, i) => (
              <View style={styles.entry} key={i} wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{ed.school}</Text>
                  {ed.dates ? <Text style={styles.entryDates}>{ed.dates}</Text> : null}
                </View>
                {ed.degree ? <Text style={styles.entrySub}>{ed.degree}</Text> : null}
                {ed.details ? <Text style={styles.entrySub}>{ed.details}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
