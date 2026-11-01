import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Palette, Shadows, Spacing, Radius } from "@/constants/theme";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: "📤",
    title: "Upload Your Resume",
    desc: "Upload your existing resume as a PDF. Our AI extracts skills, experience, education, and projects automatically.",
    color: Palette.primary,
    fade: Palette.primaryFade,
  },
  {
    step: "02",
    icon: "📋",
    title: "Add a Job Description",
    desc: "Paste the job description you're targeting. The more detail, the better — include required skills, responsibilities, and the role title.",
    color: "#8B5CF6",
    fade: "#F5F3FF",
  },
  {
    step: "03",
    icon: "🧠",
    title: "AI Analysis",
    desc: "Our AI compares your resume against the JD, identifies gaps, detects your top matching role, and generates actionable advice.",
    color: Palette.accent,
    fade: Palette.accentFade,
  },
  {
    step: "04",
    icon: "🚀",
    title: "Optimize & Apply",
    desc: "Use the match score, missing skills, and improvement suggestions to tailor your resume — then apply with confidence.",
    color: Palette.success,
    fade: Palette.successFade,
  },
];

const METRICS = [
  {
    icon: "📊",
    title: "Match Score",
    desc: "A percentage showing how well your resume aligns with the target job. 70%+ is excellent; aim for 60%+ before applying.",
    good: "70%+",
    color: Palette.success,
  },
  {
    icon: "❌",
    title: "Missing Skills",
    desc: "Skills the job requires that aren't on your resume. Add relevant ones honestly — even from side projects or courses.",
    good: "< 3 gaps",
    color: Palette.error,
  },
  {
    icon: "🎯",
    title: "Top Matching Role",
    desc: "The job role our AI thinks your resume best fits based on your skill profile — useful for career direction.",
    good: "Explore it",
    color: Palette.primary,
  },
  {
    icon: "💡",
    title: "Career Advice",
    desc: "Personalized guidance on skill gaps and what to learn next to make a stronger candidate for your target role.",
    good: "Act on it",
    color: Palette.warning,
  },
];

const TIPS = [
  { icon: "✅", text: "Use quantified achievements: \"Increased sales by 32%\" beats \"Improved sales\"." },
  { icon: "✅", text: "Mirror keywords from the JD — ATS systems scan for exact terms." },
  { icon: "✅", text: "Lead with your strongest skills section for the target role." },
  { icon: "✅", text: "One resume per job family — tailor for each application." },
  { icon: "✅", text: "Include tools, not just skills: \"Python (Pandas, scikit-learn)\" is stronger than just \"Python\"." },
  { icon: "✅", text: "Keep work experience bullets to 1–2 lines. Clarity beats length." },
];

// ─── Collapsible Metric ───────────────────────────────────────────────────────

function MetricCard({ item }: { item: typeof METRICS[0] }) {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  return (
    <TouchableOpacity
      style={metricStyles.card}
      onPress={toggle}
      activeOpacity={0.85}
    >
      <View style={metricStyles.header}>
        <View style={[metricStyles.iconWrap, { backgroundColor: item.color + "20" }]}>
          <Text style={metricStyles.icon}>{item.icon}</Text>
        </View>
        <View style={metricStyles.titleWrap}>
          <Text style={metricStyles.title}>{item.title}</Text>
          <Text style={[metricStyles.goodTag, { color: item.color }]}>
            Target: {item.good}
          </Text>
        </View>
        <Text style={[metricStyles.chevron, open && metricStyles.chevronOpen]}>
          ›
        </Text>
      </View>
      {open && (
        <View style={metricStyles.body}>
          <Text style={metricStyles.desc}>{item.desc}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const metricStyles = StyleSheet.create({
  card: {
    backgroundColor: Palette.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.subtle,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: Palette.text,
  },
  goodTag: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 1,
  },
  chevron: {
    fontSize: 22,
    color: Palette.textSecondary,
    fontWeight: "300",
    transform: [{ rotate: "0deg" }],
  },
  chevronOpen: {
    transform: [{ rotate: "90deg" }],
  },
  body: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Palette.borderLight,
  },
  desc: {
    fontSize: 14,
    color: Palette.textSecondary,
    lineHeight: 22,
  },
});

// ─── Guide Screen ─────────────────────────────────────────────────────────────

export default function GuideScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>📖</Text>
        <Text style={styles.heroTitle}>How It Works</Text>
        <Text style={styles.heroSubtitle}>
          Everything you need to know to get the most out of your resume analysis
        </Text>
      </View>

      {/* How It Works Steps */}
      <Text style={styles.sectionLabel}>PROCESS</Text>
      <Text style={styles.sectionTitle}>4-Step Optimization Flow</Text>

      {HOW_IT_WORKS.map((item) => (
        <View
          key={item.step}
          style={[styles.stepCard, { borderLeftColor: item.color }]}
        >
          <View style={styles.stepTopRow}>
            <View style={[styles.stepNumWrap, { backgroundColor: item.fade }]}>
              <Text style={[styles.stepNum, { color: item.color }]}>{item.step}</Text>
            </View>
            <Text style={styles.stepIcon}>{item.icon}</Text>
          </View>
          <Text style={styles.stepTitle}>{item.title}</Text>
          <Text style={styles.stepDesc}>{item.desc}</Text>
        </View>
      ))}

      {/* Understanding Metrics */}
      <Text style={[styles.sectionLabel, { marginTop: Spacing.md }]}>METRICS</Text>
      <Text style={styles.sectionTitle}>Understanding Your Results</Text>
      <Text style={styles.sectionSubtitle}>Tap any metric to learn more</Text>

      {METRICS.map((item) => (
        <MetricCard key={item.title} item={item} />
      ))}

      {/* Pro Tips */}
      <View style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <Text style={styles.tipsEmoji}>⚡</Text>
          <View>
            <Text style={styles.tipsLabel}>PRO TIPS</Text>
            <Text style={styles.tipsTitle}>Write a Stronger Resume</Text>
          </View>
        </View>

        {TIPS.map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <Text style={styles.tipIcon}>{tip.icon}</Text>
            <Text style={styles.tipText}>{tip.text}</Text>
          </View>
        ))}
      </View>

      {/* ATS Note */}
      <View style={styles.atsCard}>
        <Text style={styles.atsEmoji}>🤖</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.atsTitle}>What is ATS?</Text>
          <Text style={styles.atsText}>
            Applicant Tracking Systems automatically filter resumes before a human
            reads them. Our match score predicts how well your resume will pass ATS
            filters by checking keyword alignment with the job description.
          </Text>
        </View>
      </View>

      {/* Vision callout */}
      <View style={styles.visionCard}>
        <Text style={styles.visionLabel}>COMING SOON</Text>
        <Text style={styles.visionTitle}>What&apos;s Next</Text>
        {[
          "🔮  AI-powered summary rewriting",
          "📝  Auto-generated optimized resume",
          "📄  PDF export of tailored resume",
          "🔁  Multiple resume versions per job",
        ].map((item, i) => (
          <Text key={i} style={styles.visionItem}>{item}</Text>
        ))}
      </View>

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },

  // Hero
  hero: {
    backgroundColor: Palette.dark,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: "center",
    ...Shadows.card,
  },
  heroEmoji: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    color: Palette.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },

  // Section headings
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: Palette.primary,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Palette.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginBottom: Spacing.md,
  },

  // Step cards
  stepCard: {
    backgroundColor: Palette.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderLeftWidth: 4,
    ...Shadows.subtle,
  },
  stepTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  stepNumWrap: {
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stepNum: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
  stepIcon: {
    fontSize: 28,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Palette.text,
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 14,
    color: Palette.textSecondary,
    lineHeight: 22,
  },

  // Tips card
  tipsCard: {
    backgroundColor: Palette.primaryFade,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "#C3BEFE",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  tipsEmoji: {
    fontSize: 28,
    marginRight: Spacing.sm,
  },
  tipsLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: Palette.primary,
    textTransform: "uppercase",
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Palette.text,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  tipIcon: {
    fontSize: 14,
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: Palette.text,
    lineHeight: 21,
  },

  // ATS card
  atsCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Palette.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  atsEmoji: {
    fontSize: 28,
    marginRight: Spacing.sm,
  },
  atsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Palette.text,
    marginBottom: 4,
  },
  atsText: {
    fontSize: 13,
    color: Palette.textSecondary,
    lineHeight: 20,
  },

  // Vision card
  visionCard: {
    backgroundColor: Palette.dark,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  visionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: Palette.primary,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  visionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: Spacing.md,
  },
  visionItem: {
    fontSize: 14,
    color: Palette.textMuted,
    lineHeight: 26,
  },
});
