"use client";

import { Document, Page, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingBottom: 54,
    paddingHorizontal: 54,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#1a1a1a",
    lineHeight: 1.5,
  },
  para: { marginBottom: 10 },
});

export default function LetterPdf({ text }: { text: string }) {
  // Blocks separated by blank lines; \n inside a block renders as a line break.
  const paras = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <Document title="Cover Letter" creator="FireThis" producer="FireThis">
      <Page size="A4" style={styles.page}>
        {paras.map((p, i) => (
          <Text key={i} style={styles.para}>
            {p}
          </Text>
        ))}
      </Page>
    </Document>
  );
}
