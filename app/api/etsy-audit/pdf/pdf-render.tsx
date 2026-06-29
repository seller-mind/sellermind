/**
 * SM Free Etsy SEO Checker — PDF renderer.
 *
 * Uses @react-pdf/renderer. Server-side only (Node runtime).
 *
 * Layout: A4 portrait, 3 pages max
 *   - Page 1: cover + total score + grade + brutal line
 *   - Page 2: 4 dimension breakdown
 *   - Page 3: top 3 priorities + title before/after + CTA tail
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import React from "react";
import type { AuditResult, DimensionScore } from "@/lib/etsy-types";

// SellerMind design tokens (mirrored from app/globals.css)
const palette = {
  primary: "#E07A5F",
  primaryLight: "#FCEAE7",
  secondary: "#81B29A",
  secondaryLight: "#E8F3ED",
  bg: "#FFFBF8",
  text: "#3D405B",
  textMuted: "#6B6E8A",
  border: "#EDE8E4",
  gradeA: "#81B29A",
  gradeB: "#F2CC8F",
  gradeC: "#E07A5F",
  gradeD: "#C0392B",
};

const styles = StyleSheet.create({
  page: {
    padding: 36,
    backgroundColor: palette.bg,
    color: palette.text,
    fontSize: 11,
    lineHeight: 1.5,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    paddingBottom: 8,
  },
  brand: { fontSize: 13, fontFamily: "Helvetica-Bold", color: palette.primary },
  subtle: { color: palette.textMuted, fontSize: 9 },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", marginTop: 16 },
  scoreBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 14,
    padding: 18,
    backgroundColor: palette.primaryLight,
    borderRadius: 8,
  },
  scoreNumber: {
    fontSize: 48,
    fontFamily: "Helvetica-Bold",
    color: palette.primary,
  },
  gradeBadge: {
    marginLeft: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    color: "#fff",
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
  },
  brutalLine: {
    fontSize: 13,
    fontStyle: "italic",
    marginVertical: 8,
    color: palette.text,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginTop: 18,
    marginBottom: 6,
    color: palette.text,
  },
  dimCard: {
    marginVertical: 6,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: palette.primary,
    backgroundColor: "#FFFFFF",
  },
  dimRow: { flexDirection: "row", justifyContent: "space-between" },
  dimName: { fontFamily: "Helvetica-Bold", fontSize: 12 },
  dimScore: { fontFamily: "Helvetica-Bold", fontSize: 12, color: palette.primary },
  dimTake: { marginTop: 4, fontSize: 10, color: palette.textMuted },
  dimNext: { marginTop: 4, fontSize: 10 },
  priCard: {
    marginVertical: 4,
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: palette.border,
  },
  priIssue: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  priFix: { marginTop: 2, fontSize: 10, color: palette.textMuted },
  impactPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 9,
    color: "#fff",
    fontFamily: "Helvetica-Bold",
  },
  ba: { padding: 10, backgroundColor: palette.secondaryLight, marginVertical: 6 },
  baLabel: { fontFamily: "Helvetica-Bold", fontSize: 10, color: palette.secondary },
  baText: { fontSize: 10, marginTop: 2 },
  footer: {
    position: "absolute",
    left: 36,
    right: 36,
    bottom: 24,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingTop: 8,
    fontSize: 9,
    color: palette.textMuted,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

function gradeColor(g: AuditResult["overall_grade"]): string {
  return g === "A"
    ? palette.gradeA
    : g === "B"
    ? palette.gradeB
    : g === "C"
    ? palette.gradeC
    : palette.gradeD;
}

function impactColor(i: "High" | "Medium" | "Low"): string {
  return i === "High" ? palette.gradeD : i === "Medium" ? palette.primary : palette.secondary;
}

// Tiny header on each page
function Header({ listingId }: { listingId: string }) {
  return (
    <View style={styles.header} fixed>
      <Text style={styles.brand}>SellerMind · Free Etsy SEO Checker</Text>
      <Text style={styles.subtle}>Listing {listingId}</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footer} fixed>
      <Text>
        Audit your full store, track keywords, A/B test titles → thesellermind.com
      </Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function DimRow({ name, dim }: { name: string; dim: DimensionScore }) {
  return (
    <View style={styles.dimCard} wrap={false}>
      <View style={styles.dimRow}>
        <Text style={styles.dimName}>{name}</Text>
        <Text style={styles.dimScore}>{dim.score} / 25</Text>
      </View>
      <Text style={styles.dimTake}>{dim.honest_take}</Text>
      <Text style={styles.dimNext}>→ {dim.next_step}</Text>
    </View>
  );
}

function AuditDoc({ audit }: { audit: AuditResult }) {
  const date = new Date(audit.meta.parsed_at).toISOString().slice(0, 10);

  return (
    <Document title={`SellerMind Etsy Audit — ${audit.total_score}/100 — ${date}`}>
      <Page size="A4" style={styles.page}>
        <Header listingId={audit.meta.listing_id} />

        <Text style={styles.title}>Your Etsy listing SEO audit</Text>
        <Text style={styles.subtle}>Generated {date} · Free preview from TheSellerMind</Text>

        <View style={styles.scoreBox}>
          <Text style={styles.scoreNumber}>{audit.total_score}</Text>
          <Text style={[styles.scoreNumber, { fontSize: 18, marginLeft: 4, color: palette.textMuted }]}>
            /100
          </Text>
          <Text
            style={[
              styles.gradeBadge,
              { backgroundColor: gradeColor(audit.overall_grade) },
            ]}
          >
            Grade {audit.overall_grade}
          </Text>
        </View>

        <Text style={styles.brutalLine}>"{audit.one_brutal_line}"</Text>

        <Text style={styles.sectionTitle}>4-dimension breakdown</Text>
        <DimRow name="Title (0-25)" dim={audit.dimensions.title} />
        <DimRow name="Tags (0-25)" dim={audit.dimensions.tags} />
        <DimRow name="Description (0-25)" dim={audit.dimensions.description} />
        <DimRow name="Images + Alt (0-25)" dim={audit.dimensions.images_alt} />

        <Footer />
      </Page>

      <Page size="A4" style={styles.page}>
        <Header listingId={audit.meta.listing_id} />

        <Text style={styles.sectionTitle}>Top 3 priorities (sorted by impact)</Text>
        {audit.top_3_priorities.map((p, idx) => (
          <View key={idx} style={styles.priCard} wrap={false}>
            <View style={styles.dimRow}>
              <Text style={styles.priIssue}>{idx + 1}. {p.issue}</Text>
              <Text style={[styles.impactPill, { backgroundColor: impactColor(p.impact) }]}>
                {p.impact}
              </Text>
            </View>
            <Text style={styles.priFix}>→ {p.fix}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Title before / after</Text>
        <View style={styles.ba} wrap={false}>
          <Text style={styles.baLabel}>BEFORE — your current title</Text>
          <Text style={styles.baText}>{audit.title_before_after.current}</Text>
        </View>
        <View style={styles.ba} wrap={false}>
          <Text style={styles.baLabel}>AFTER — our suggested rewrite</Text>
          <Text style={styles.baText}>{audit.title_before_after.improved}</Text>
        </View>

        <Text style={styles.sectionTitle}>Want to audit your whole store?</Text>
        <Text style={{ fontSize: 10 }}>
          This is just one listing. TheSellerMind audits your entire shop, tracks
          keyword rankings over 14 days, and A/B tests title variants — all in
          one place. 14-day free trial, no card. {"\n\n"}
          → https://thesellermind.com/?utm_source=etsy-seo-checker&utm_medium=pdf_report
        </Text>

        <Text style={[styles.subtle, { marginTop: 20 }]}>
          About this audit: opinionated tool from an indie hacker (Haimo). The
          model has biases and can be wrong. Use the score as a directional
          signal, not gospel. No part of this report stores your listing — we
          only kept it long enough to compute the score.
        </Text>

        <Footer />
      </Page>
    </Document>
  );
}

export async function renderAuditPdf(audit: AuditResult): Promise<Uint8Array> {
  // @react-pdf/renderer's renderToBuffer accepts a React element. We pass the
  // typed JSX directly; the Buffer is then converted to Uint8Array for the
  // Next.js Response body.
  const buf = await renderToBuffer(<AuditDoc audit={audit} />);
  return new Uint8Array(buf);
}
