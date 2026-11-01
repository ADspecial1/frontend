/**
 * AI Resume Optimizer — Main Screen
 * Editorial aesthetic: warm cream · terracotta · serif display
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Animated,
  Dimensions,
  Linking,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";

const { width: SCREEN_W } = Dimensions.get("window");
const TWO_COL = SCREEN_W >= 760;
const API_URL = "http://127.0.0.1:8000";

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  bg:            "#FAF7F2",
  card:          "#FFFFFF",
  terra:         "#C0674E",
  terraLight:    "#FDF1EE",
  terraDark:     "#9A4F3A",
  dark:          "#1C1917",
  text:          "#292524",
  textSec:       "#78716C",
  textMuted:     "#A8A29E",
  border:        "#E7E3DF",
  borderLight:   "#F5F3F0",
  green:         "#16A34A",
  greenLight:    "#F0FDF4",
  amber:         "#D97706",
  amberLight:    "#FFFBEB",
  red:           "#DC2626",
  redLight:      "#FFF1F2",
  blue:          "#2563EB",
  blueLight:     "#EFF6FF",
};

const FONT_SERIF = Platform.select({
  ios:     "Georgia",
  android: "serif",
  default: "Georgia, 'Times New Roman', serif",
});

const SHADOW_CARD = {
  shadowColor: "#1C1917",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 10,
  elevation: 4,
};

const SHADOW_BTN = {
  shadowColor: "#C0674E",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.30,
  shadowRadius: 12,
  elevation: 8,
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExperienceItem {
  title: string;
  company: string;
  dates: string;
  original_bullets: string[];
  optimized_bullets: string[];
}

interface EducationItem {
  degree: string;
  institution: string;
  dates: string;
}

interface ProjectItem {
  name: string;
  tech: string[];
  description: string;
  optimized: string;
}

interface Job {
  title: string;
  company: string;
  location: string;
  link: string;
}

interface AnalysisResult {
  match_score: number;
  detected_role: string;
  score_breakdown: { skills: number; experience: number; keywords: number; education: number };
  present_skills: string[];
  missing_skills: string[];
  skills_to_grow: string[];
  ats_keywords: string[];
  improvements: string[];
  extracted: {
    name: string;
    contact: string;
    summary: string;
    experience: ExperienceItem[];
    education: EducationItem[];
    projects: ProjectItem[];
    certifications: string[];
    all_skills: string[];
  };
  optimized_summary: string;
  optimized_skills: string[];
  optimized_skills_display?: string[];
  full_resume_text: string;
  jobs?: Job[];
}

function formatSkillLabel(skill: string) {
  const key = (skill || "").trim().toLowerCase();
  const map: Record<string, string> = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    java: "Java",
    "c#": "C#",
    "c++": "C++",
    api: "REST APIs",
    rest: "REST",
    sql: "SQL",
    html: "HTML",
    css: "CSS",
    git: "Git",
    github: "GitHub",
    mongodb: "MongoDB",
    postgresql: "PostgreSQL",
    fastapi: "FastAPI",
    react: "React",
    "node.js": "Node.js",
    graphql: "GraphQL",
    "machine learning": "Machine Learning",
    agile: "Agile",
  };

  if (map[key]) return map[key];
  if (!key) return "";
  return skill
    .split(" ")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}

// ─── Loading steps ────────────────────────────────────────────────────────────

const STEPS = [
  { label: "Reading your resume",               sub: "Parsing PDF bytes directly" },
  { label: "Extracting experience & education", sub: "Companies, titles, dates — locked" },
  { label: "Analyzing job description",         sub: "Detecting role & required skills" },
  { label: "Scoring skill match",               sub: "Calculating compatibility" },
  { label: "Rewriting for ATS",                 sub: "Optimizing bullets & summary" },
  { label: "Generating resume output",          sub: "Applying formatting & keywords" },
  { label: "Done",                              sub: "Building your results" },
];

const STEP_DELAYS = [0, 900, 2000, 3200, 4600, 6400, 99999]; // last one fires on API response

function LoadingSteps({ step }: { step: number }) {
  return (
    <View style={LS.wrap}>
      {STEPS.map((s, i) => {
        const done   = i < step;
        const active = i === step;
        const future = i > step;
        return (
          <View key={i} style={LS.row}>
            <View style={[LS.dot, done && LS.dotDone, active && LS.dotActive]}>
              {done   ? <Text style={LS.check}>✓</Text>
               : active ? <ActivityIndicator size="small" color={C.terra} />
               : <View style={LS.dotInner} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[LS.label, done && LS.labelDone, future && LS.labelFuture]}>
                {s.label}
              </Text>
              {(active || done) && (
                <Text style={LS.sub}>{s.sub}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const LS = StyleSheet.create({
  wrap:       { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 16, ...SHADOW_CARD },
  row:        { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  dot:        { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: C.border, alignItems: "center", justifyContent: "center", marginRight: 12, marginTop: 1, backgroundColor: C.bg },
  dotDone:    { borderColor: C.green, backgroundColor: C.greenLight },
  dotActive:  { borderColor: C.terra, backgroundColor: C.terraLight },
  check:      { color: C.green, fontSize: 13, fontWeight: "700" },
  dotInner:   { width: 8, height: 8, borderRadius: 4, backgroundColor: C.border },
  label:      { fontSize: 15, fontWeight: "600", color: C.text },
  labelDone:  { color: C.textSec },
  labelFuture:{ color: C.textMuted },
  sub:        { fontSize: 12, color: C.textSec, marginTop: 2 },
});

// ─── Match score card ─────────────────────────────────────────────────────────

function getScoreColor(score: number) {
  return score >= 75 ? C.green : score >= 50 ? C.amber : C.red;
}
function getScoreBg(score: number) {
  return score >= 75 ? C.greenLight : score >= 50 ? C.amberLight : C.redLight;
}
function getScoreLabel(score: number) {
  return score >= 75 ? "Strong Match" : score >= 50 ? "Moderate Match" : "Low Match";
}

function BreakdownBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={BB.row}>
      <Text style={BB.label}>{label}</Text>
      <View style={BB.track}>
        <View style={[BB.fill, { width: `${value}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[BB.pct, { color }]}>{value}%</Text>
    </View>
  );
}

const BB = StyleSheet.create({
  row:   { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  label: { width: 90, fontSize: 13, color: C.textSec, fontWeight: "500" },
  track: { flex: 1, height: 8, backgroundColor: C.borderLight, borderRadius: 4, overflow: "hidden", marginHorizontal: 10 },
  fill:  { height: "100%", borderRadius: 4 },
  pct:   { width: 36, fontSize: 13, fontWeight: "700", textAlign: "right" },
});

function MatchScoreCard({ result }: { result: AnalysisResult }) {
  const color = getScoreColor(result.match_score);
  const bg    = getScoreBg(result.match_score);
  const label = getScoreLabel(result.match_score);
  const bd    = result.score_breakdown;

  return (
    <View style={[MSC.card, { borderTopColor: color }]}>
      <View style={MSC.topRow}>
        <View style={[MSC.ring, { borderColor: color, backgroundColor: bg }]}>
          <Text style={[MSC.scoreNum, { color }]}>{result.match_score}</Text>
          <Text style={[MSC.scorePct, { color }]}>%</Text>
        </View>
        <View style={MSC.ringInfo}>
          <Text style={[MSC.scoreLabel, { color }]}>{label}</Text>
          <Text style={MSC.role}>{result.detected_role}</Text>
          <Text style={MSC.roleSub}>Detected target role</Text>
        </View>
      </View>

      <View style={MSC.divider} />

      <BreakdownBar label="Skills"      value={bd.skills}     color={getScoreColor(bd.skills)} />
      <BreakdownBar label="Experience"  value={bd.experience} color={getScoreColor(bd.experience)} />
      <BreakdownBar label="Keywords"    value={bd.keywords}   color={getScoreColor(bd.keywords)} />
      <BreakdownBar label="Education"   value={bd.education}  color={getScoreColor(bd.education)} />
    </View>
  );
}

const MSC = StyleSheet.create({
  card:      { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 16, borderTopWidth: 4, ...SHADOW_CARD },
  topRow:    { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  ring:      { width: 100, height: 100, borderRadius: 50, borderWidth: 5, alignItems: "center", justifyContent: "center", flexDirection: "row", marginRight: 20 },
  scoreNum:  { fontSize: 38, fontWeight: "800", letterSpacing: -2, fontFamily: FONT_SERIF as any },
  scorePct:  { fontSize: 18, fontWeight: "700", alignSelf: "flex-end", marginBottom: 6 },
  ringInfo:  { flex: 1 },
  scoreLabel:{ fontSize: 18, fontWeight: "700" },
  role:      { fontSize: 15, color: C.text, fontWeight: "600", marginTop: 4 },
  roleSub:   { fontSize: 12, color: C.textMuted, marginTop: 2 },
  divider:   { height: 1, backgroundColor: C.borderLight, marginBottom: 16 },
});

// ─── Skill chip ───────────────────────────────────────────────────────────────

function Chip({ label, variant }: { label: string; variant: "present" | "missing" | "grow" | "ats" | "neutral" }) {
  const map = {
    present: { bg: C.greenLight, text: C.green,  border: "#BBF7D0" },
    missing: { bg: C.redLight,   text: C.red,    border: "#FECACA" },
    grow:    { bg: C.amberLight, text: C.amber,  border: "#FDE68A" },
    ats:     { bg: C.blueLight,  text: C.blue,   border: "#BFDBFE" },
    neutral: { bg: C.terraLight, text: C.terra,  border: "#F5C6BA" },
  };
  const { bg, text, border } = map[variant];
  return (
    <View style={[CHIP.wrap, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[CHIP.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const CHIP = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 4, margin: 3 },
  text: { fontSize: 12, fontWeight: "600" },
});

// ─── Skills panel ─────────────────────────────────────────────────────────────

function SkillsPanel({ result }: { result: AnalysisResult }) {
  return (
    <View style={[SKP.card]}>
      <Text style={SKP.heading}>Skills Analysis</Text>

      {result.present_skills.length > 0 && (
        <View style={SKP.group}>
          <Text style={[SKP.groupLabel, { color: C.green }]}>Present ({result.present_skills.length})</Text>
          <View style={SKP.chips}>
            {result.present_skills.map((s, i) => <Chip key={i} label={formatSkillLabel(s)} variant="present" />)}
          </View>
        </View>
      )}

      {result.missing_skills.length > 0 && (
        <View style={SKP.group}>
          <Text style={[SKP.groupLabel, { color: C.red }]}>Missing ({result.missing_skills.length})</Text>
          <View style={SKP.chips}>
            {result.missing_skills.map((s, i) => <Chip key={i} label={formatSkillLabel(s)} variant="missing" />)}
          </View>
        </View>
      )}

      {result.skills_to_grow.length > 0 && (
        <View style={SKP.group}>
          <Text style={[SKP.groupLabel, { color: C.amber }]}>Develop ({result.skills_to_grow.length})</Text>
          <View style={SKP.chips}>
            {result.skills_to_grow.map((s, i) => <Chip key={i} label={formatSkillLabel(s)} variant="grow" />)}
          </View>
        </View>
      )}

      {result.ats_keywords.length > 0 && (
        <View style={SKP.group}>
          <Text style={[SKP.groupLabel, { color: C.blue }]}>ATS Keywords</Text>
          <View style={SKP.chips}>
            {result.ats_keywords.map((s, i) => <Chip key={i} label={formatSkillLabel(s)} variant="ats" />)}
          </View>
        </View>
      )}
    </View>
  );
}

const SKP = StyleSheet.create({
  card:       { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 16, ...SHADOW_CARD },
  heading:    { fontSize: 18, fontWeight: "700", color: C.text, marginBottom: 16, fontFamily: FONT_SERIF as any },
  group:      { marginBottom: 14 },
  groupLabel: { fontSize: 12, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 },
  chips:      { flexDirection: "row", flexWrap: "wrap" },
});

// ─── Improvements ─────────────────────────────────────────────────────────────

function ImprovementsCard({ items }: { items: string[] }) {
  return (
    <View style={IMP.card}>
      <Text style={IMP.heading}>Improvements</Text>
      {items.map((item, i) => (
        <View key={i} style={IMP.row}>
          <View style={IMP.bullet}><Text style={IMP.bulletNum}>{i + 1}</Text></View>
          <Text style={IMP.text}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const IMP = StyleSheet.create({
  card:      { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 16, ...SHADOW_CARD },
  heading:   { fontSize: 18, fontWeight: "700", color: C.text, marginBottom: 16, fontFamily: FONT_SERIF as any },
  row:       { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  bullet:    { width: 24, height: 24, borderRadius: 12, backgroundColor: C.terraLight, alignItems: "center", justifyContent: "center", marginRight: 10, marginTop: 1 },
  bulletNum: { fontSize: 11, fontWeight: "700", color: C.terra },
  text:      { flex: 1, fontSize: 14, color: C.text, lineHeight: 21 },
});

// ─── Jobs card ────────────────────────────────────────────────────────────────

function JobsCard({ jobs }: { jobs: Job[] }) {
  if (!jobs.length) return null;
  return (
    <View style={JC.card}>
      <Text style={JC.heading}>Recommended Jobs</Text>
      {jobs.map((job, i) => (
        <View key={i} style={[JC.row, i < jobs.length - 1 && JC.rowBorder]}>
          <View style={JC.info}>
            <Text style={JC.title}>{job.title}</Text>
            <Text style={JC.meta}>{job.company} · {job.location}</Text>
          </View>
          <TouchableOpacity
            style={JC.badge}
            onPress={() => Linking.openURL(job.link)}
            activeOpacity={0.75}
          >
            <Text style={JC.badgeText}>Apply →</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const JC = StyleSheet.create({
  card:      { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 16, borderTopWidth: 4, borderTopColor: C.blue, ...SHADOW_CARD },
  heading:   { fontSize: 18, fontWeight: "700", color: C.text, marginBottom: 14, fontFamily: FONT_SERIF as any },
  row:       { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.borderLight },
  info:      { flex: 1 },
  title:     { fontSize: 15, fontWeight: "700", color: C.dark, marginBottom: 2 },
  meta:      { fontSize: 13, color: C.textSec },
  badge:     { backgroundColor: C.blueLight, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { fontSize: 12, fontWeight: "700", color: C.blue },
});

// ─── Structured resume view ───────────────────────────────────────────────────

function SectionHead({ title }: { title: string }) {
  return (
    <View style={SR.sectionHead}>
      <Text style={SR.sectionTitle}>{title}</Text>
      <View style={SR.sectionLine} />
    </View>
  );
}

function StructuredView({ result }: { result: AnalysisResult }) {
  const ex = result.extracted;
  return (
    <ScrollView style={SR.scroll} nestedScrollEnabled showsVerticalScrollIndicator>

      {/* Header */}
      <View style={SR.header}>
        <Text style={SR.name}>{ex.name}</Text>
        <Text style={SR.contact}>{ex.contact}</Text>
      </View>

      {/* Summary */}
      {result.optimized_summary ? (
        <>
          <SectionHead title="PROFESSIONAL SUMMARY" />
          <Text style={SR.summary}>{result.optimized_summary}</Text>
        </>
      ) : null}

      {/* Skills */}
      {result.optimized_skills.length > 0 && (
        <>
          <SectionHead title="SKILLS" />
          <View style={SR.chips}>
            {(result.optimized_skills_display && result.optimized_skills_display.length > 0
              ? result.optimized_skills_display
              : result.optimized_skills
            ).map((s, i) => (
              <Chip key={i} label={formatSkillLabel(s)} variant="neutral" />
            ))}
          </View>
        </>
      )}

      {/* Experience */}
      {ex.experience.length > 0 && (
        <>
          <SectionHead title="EXPERIENCE" />
          {ex.experience.map((exp, i) => (
            <View key={i} style={SR.expBlock}>
              <View style={SR.expHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={SR.expTitle}>{exp.title}</Text>
                  <Text style={SR.expCompany}>{exp.company}</Text>
                </View>
                <Text style={SR.expDates}>{exp.dates}</Text>
              </View>
              {exp.optimized_bullets.map((b, j) => (
                <View key={j} style={SR.bulletRow}>
                  <Text style={SR.bulletDot}>•</Text>
                  <Text style={SR.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
          ))}
        </>
      )}

      {/* Projects */}
      {ex.projects.length > 0 && (
        <>
          <SectionHead title="PROJECTS" />
          {ex.projects.map((p, i) => (
            <View key={i} style={SR.projectBlock}>
              <Text style={SR.projectName}>{p.name}</Text>
              <View style={SR.chips}>
                {p.tech.map((t, j) => <Chip key={j} label={formatSkillLabel(t)} variant="neutral" />)}
              </View>
              <Text style={SR.projectDesc}>{p.optimized || p.description}</Text>
            </View>
          ))}
        </>
      )}

      {/* Education */}
      {ex.education.length > 0 && (
        <>
          <SectionHead title="EDUCATION" />
          {ex.education.map((ed, i) => (
            <View key={i} style={SR.eduBlock}>
              <View style={SR.expHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={SR.expTitle}>{ed.degree}</Text>
                  <Text style={SR.expCompany}>{ed.institution}</Text>
                </View>
                <Text style={SR.expDates}>{ed.dates}</Text>
              </View>
            </View>
          ))}
        </>
      )}

      {/* Certifications */}
      {ex.certifications.length > 0 && (
        <>
          <SectionHead title="CERTIFICATIONS" />
          {ex.certifications.map((c, i) => (
            <Text key={i} style={SR.certItem}>• {c}</Text>
          ))}
        </>
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const SR = StyleSheet.create({
  scroll:       { maxHeight: 560, backgroundColor: "#FDFCFA", borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 16 },
  header:       { marginBottom: 20 },
  name:         { fontSize: 22, fontWeight: "800", color: C.dark, fontFamily: FONT_SERIF as any, marginBottom: 4 },
  contact:      { fontSize: 13, color: C.textSec, lineHeight: 20 },
  sectionHead:  { marginTop: 18, marginBottom: 10 },
  sectionTitle: { fontSize: 11, fontWeight: "800", letterSpacing: 1.5, color: C.terra, textTransform: "uppercase", marginBottom: 6 },
  sectionLine:  { height: 1, backgroundColor: C.border },
  summary:      { fontSize: 14, color: C.text, lineHeight: 22, marginBottom: 4 },
  chips:        { flexDirection: "row", flexWrap: "wrap", marginBottom: 4 },
  expBlock:     { marginBottom: 16 },
  expHeader:    { flexDirection: "row", alignItems: "flex-start", marginBottom: 6 },
  expTitle:     { fontSize: 15, fontWeight: "700", color: C.dark },
  expCompany:   { fontSize: 13, color: C.terra, fontWeight: "600", marginTop: 2 },
  expDates:     { fontSize: 12, color: C.textSec, fontStyle: "italic" },
  bulletRow:    { flexDirection: "row", alignItems: "flex-start", marginBottom: 4, paddingLeft: 4 },
  bulletDot:    { fontSize: 14, color: C.terra, marginRight: 8, lineHeight: 21 },
  bulletText:   { flex: 1, fontSize: 13, color: C.text, lineHeight: 20 },
  projectBlock: { marginBottom: 16 },
  projectName:  { fontSize: 15, fontWeight: "700", color: C.dark, marginBottom: 4 },
  projectDesc:  { fontSize: 13, color: C.text, lineHeight: 20, marginTop: 4 },
  eduBlock:     { marginBottom: 12 },
  certItem:     { fontSize: 13, color: C.text, lineHeight: 24 },
});

// ─── Optimized resume card (tabs: Structured | Text) ─────────────────────────

type ResumeTab = "structured" | "text";

function OptimizedResumeCard({
  result,
  onCopy,
  onDownload,
  copySuccess,
  pdfLoading,
}: {
  result: AnalysisResult;
  onCopy: () => void;
  onDownload: () => void;
  copySuccess: boolean;
  pdfLoading: boolean;
}) {
  const [tab, setTab] = useState<ResumeTab>("structured");

  return (
    <View style={ORC.card}>
      <Text style={ORC.heading}>Optimized Resume</Text>

      {/* Tab bar */}
      <View style={ORC.tabBar}>
        {(["structured", "text"] as ResumeTab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[ORC.tab, tab === t && ORC.tabActive]}
            onPress={() => setTab(t)}
            activeOpacity={0.8}
          >
            <Text style={[ORC.tabText, tab === t && ORC.tabTextActive]}>
              {t === "structured" ? "Structured View" : "Plain Text"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {tab === "structured" ? (
        <StructuredView result={result} />
      ) : (
        <>
          <ScrollView style={ORC.textScroll} nestedScrollEnabled showsVerticalScrollIndicator>
            <Text style={ORC.plainText}>{result.full_resume_text}</Text>
          </ScrollView>
        </>
      )}

      {/* Action buttons */}
      <View style={ORC.actions}>
        <TouchableOpacity
          style={[ORC.copyBtn, copySuccess && ORC.copyBtnOk]}
          onPress={onCopy}
          activeOpacity={0.8}
        >
          <Text style={[ORC.copyTxt, copySuccess && ORC.copyTxtOk]}>
            {copySuccess ? "✓ Copied" : "Copy Text"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[ORC.pdfBtn, pdfLoading && ORC.pdfBtnDisabled]}
          onPress={onDownload}
          activeOpacity={0.85}
          disabled={pdfLoading}
        >
          {pdfLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={ORC.pdfTxt}>⬇  Download PDF</Text>
          )}
        </TouchableOpacity>
      </View>

      {Platform.OS !== "web" && (
        <Text style={ORC.webNote}>PDF download works in the web version (expo start --web)</Text>
      )}
    </View>
  );
}

const ORC = StyleSheet.create({
  card:           { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 16, ...SHADOW_CARD },
  heading:        { fontSize: 20, fontWeight: "700", color: C.dark, fontFamily: FONT_SERIF as any, marginBottom: 14 },
  tabBar:         { flexDirection: "row", backgroundColor: C.borderLight, borderRadius: 10, padding: 3, marginBottom: 14 },
  tab:            { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  tabActive:      { backgroundColor: C.card, ...SHADOW_CARD },
  tabText:        { fontSize: 13, fontWeight: "600", color: C.textSec },
  tabTextActive:  { color: C.terra, fontWeight: "700" },
  textScroll:     { maxHeight: 500, backgroundColor: "#FDFCFA", borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 14 },
  plainText:      { fontSize: 12, lineHeight: 19, color: C.text, fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }) as any },
  actions:        { flexDirection: "row", gap: 10, marginTop: 4 },
  copyBtn:        { flex: 1, borderWidth: 1.5, borderColor: C.terra, borderRadius: 999, paddingVertical: 11, alignItems: "center" },
  copyBtnOk:      { borderColor: C.green, backgroundColor: C.greenLight },
  copyTxt:        { fontSize: 14, fontWeight: "700", color: C.terra },
  copyTxtOk:      { color: C.green },
  pdfBtn:         { flex: 1, backgroundColor: C.terra, borderRadius: 999, paddingVertical: 11, alignItems: "center", ...SHADOW_BTN },
  pdfBtnDisabled: { backgroundColor: C.textMuted },
  pdfTxt:         { fontSize: 14, fontWeight: "700", color: "#fff" },
  webNote:        { fontSize: 12, color: C.textMuted, textAlign: "center", marginTop: 10 },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function copyText(text: string): Promise<boolean> {
  if (Platform.OS === "web") {
    try { await (navigator as any).clipboard.writeText(text); return true; }
    catch { return false; }
  }
  return false;
}

async function downloadPdf(text: string, name: string): Promise<void> {
  if (Platform.OS !== "web") {
    alert("Open the app in a browser (expo start --web) to download the PDF.");
    return;
  }
  const res = await fetch(`${API_URL}/export-pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).detail ?? "PDF generation failed");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${name}_optimized.pdf`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const [file,        setFile]        = useState<any>(null);
  const [jd,          setJd]          = useState("");
  const [result,      setResult]      = useState<AnalysisResult | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [step,        setStep]        = useState(-1);
  const [error,       setError]       = useState<string | null>(null);
  const [copyOk,      setCopyOk]      = useState(false);
  const [pdfLoading,  setPdfLoading]  = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const stepTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [jdUpdated,    setJdUpdated]    = useState(false);
  const lastAnalyzedJd  = useRef("");
  const autoAnalyzeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyzeRef      = useRef<() => void>(() => {});

  // advance loading steps on timer
  useEffect(() => {
    stepTimers.current.forEach(clearTimeout);
    stepTimers.current = [];
    if (!loading) { setStep(-1); return; }
    setStep(0);
    STEP_DELAYS.slice(1, -1).forEach((delay, i) => {
      stepTimers.current.push(setTimeout(() => setStep(i + 1), delay));
    });
    return () => stepTimers.current.forEach(clearTimeout);
  }, [loading]);

  // keep analyzeRef pointing to the latest analyze function
  useEffect(() => { analyzeRef.current = analyze; });

  // auto re-analyze when JD changes after results are already showing (2s debounce)
  useEffect(() => {
    if (!result || !file || jd.trim().length < 30) return;
    if (jd.trim() === lastAnalyzedJd.current) return;
    setJdUpdated(true);
    if (autoAnalyzeTimer.current) clearTimeout(autoAnalyzeTimer.current);
    autoAnalyzeTimer.current = setTimeout(() => analyzeRef.current(), 2000);
    return () => { if (autoAnalyzeTimer.current) clearTimeout(autoAnalyzeTimer.current); };
  }, [jd]);

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: "application/pdf", copyToCacheDirectory: true });
      if (!res.canceled && res.assets?.length) {
        setFile(res.assets[0]);
        setResult(null);
        setError(null);
        setJdUpdated(false);
        lastAnalyzedJd.current = "";
        fadeAnim.setValue(0); slideAnim.setValue(24);
      }
    } catch { setError("Could not open file picker."); }
  };

  const canAnalyze = !!file && jd.trim().length > 0 && !loading;

  const analyze = async () => {
    if (!canAnalyze) return;
    if (autoAnalyzeTimer.current) clearTimeout(autoAnalyzeTimer.current);
    setLoading(true); setError(null); setResult(null);
    fadeAnim.setValue(0); slideAnim.setValue(24);

    const fd = new FormData();
    try {
      if (Platform.OS === "web") {
        const r = await fetch(file.uri);
        fd.append("resume", await r.blob(), file.name);
      } else {
        fd.append("resume", { uri: file.uri, name: file.name, type: file.mimeType || "application/pdf" } as any);
      }
      fd.append("job_description", jd.trim());

      const res = await fetch(`${API_URL}/analyze`, { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail ?? `Server error ${res.status}`);
      }

      setStep(6); // "Done"
      setTimeout(() => {
        lastAnalyzedJd.current = jd.trim();
        setJdUpdated(false);
        setResult(data);
        Animated.parallel([
          Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
      }, 600);
    } catch (e: any) {
      const msg = e.message ?? "";
      if (msg.includes("Failed to fetch") || msg.includes("ERR_CONNECTION_REFUSED") || msg.includes("NetworkError")) {
        setError("Cannot connect to backend. Start it with: cd backend && uvicorn main:app --reload --port 8000");
      } else {
        setError(msg || "Analysis failed. Is the backend running?");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    const ok = await copyText(result.full_resume_text);
    if (ok) { setCopyOk(true); setTimeout(() => setCopyOk(false), 2500); }
  };

  const handleDownload = async () => {
    if (!result) return;
    setPdfLoading(true);
    try { await downloadPdf(result.full_resume_text, result.extracted.name || "resume"); }
    catch (e: any) { setError(e.message); }
    finally { setPdfLoading(false); }
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>AI POWERED</Text>
        </View>
        <Text style={styles.headerTitle}>Resume Optimizer</Text>
        <Text style={styles.headerSub}>
          Upload your real resume · paste a job description · get an ATS-ready rewrite in seconds
        </Text>
      </View>

      {/* ── Inputs ── */}
      <View style={[styles.inputRow, TWO_COL && styles.inputRowTwoCol]}>

        {/* Upload */}
        <View style={[styles.inputCard, TWO_COL && styles.inputCardHalf]}>
          <Text style={styles.inputLabel}>Resume PDF</Text>
          <TouchableOpacity
            style={[styles.uploadZone, file && styles.uploadZoneDone]}
            onPress={pickFile}
            activeOpacity={0.75}
          >
            {file ? (
              <>
                <Text style={styles.uploadIcon}>📄</Text>
                <Text style={styles.uploadFilename} numberOfLines={1}>{file.name}</Text>
                <Text style={styles.uploadHint}>Tap to replace</Text>
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={(e) => { e.stopPropagation?.(); setFile(null); setResult(null); }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.clearBtnText}>✕</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.uploadIcon}>⬆️</Text>
                <Text style={styles.uploadPrompt}>Drag & drop or tap to browse</Text>
                <Text style={styles.uploadHint}>PDF only · max 10 MB</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* JD textarea */}
        <View style={[styles.inputCard, TWO_COL && styles.inputCardHalf]}>
          <Text style={styles.inputLabel}>Job Description</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Paste the full job description here — required skills, responsibilities, role title…"
            placeholderTextColor={C.textMuted}
            value={jd}
            onChangeText={setJd}
            multiline
            textAlignVertical="top"
          />
          {jd.length > 0 && (
            <Text style={styles.charCount}>{jd.length} chars</Text>
          )}
          {jdUpdated && !loading && (
            <Text style={styles.jdUpdateHint}>↻ JD updated — auto-refreshing in 2s…</Text>
          )}
        </View>
      </View>

      {/* ── Error ── */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠  {error}</Text>
        </View>
      )}

      {/* ── Analyze button ── */}
      <TouchableOpacity
        style={[styles.analyzeBtn, !canAnalyze && styles.analyzeBtnOff]}
        onPress={analyze}
        activeOpacity={0.85}
        disabled={!canAnalyze}
      >
        <Text style={[styles.analyzeTxt, !canAnalyze && styles.analyzeTxtOff]}>
          {loading ? "Analyzing…" : "Analyze & Optimize →"}
        </Text>
      </TouchableOpacity>

      {/* ── Loading steps ── */}
      {loading && step >= 0 && <LoadingSteps step={step} />}

      {/* ── Results ── */}
      {result && (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          <View style={styles.resultsDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Your Results</Text>
            <View style={styles.dividerLine} />
          </View>

          <MatchScoreCard result={result} />
          <SkillsPanel    result={result} />
          <ImprovementsCard items={result.improvements} />
          {result.jobs && result.jobs.length > 0 && (
            <JobsCard jobs={result.jobs} />
          )}
          <OptimizedResumeCard
            result={result}
            onCopy={handleCopy}
            onDownload={handleDownload}
            copySuccess={copyOk}
            pdfLoading={pdfLoading}
          />

          <TouchableOpacity style={styles.startOver} onPress={() => { setFile(null); setResult(null); setJd(""); setJdUpdated(false); lastAnalyzedJd.current = ""; }}>
            <Text style={styles.startOverTxt}>Start over →</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

// ─── Root styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 16, paddingTop: 20, maxWidth: 900, alignSelf: "center", width: "100%" as any },

  // Header
  header:          { alignItems: "center", marginBottom: 28 },
  headerBadge:     { backgroundColor: C.terra, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10 },
  headerBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  headerTitle:     { fontSize: 32, fontWeight: "800", color: C.dark, fontFamily: FONT_SERIF as any, textAlign: "center", marginBottom: 8 },
  headerSub:       { fontSize: 14, color: C.textSec, textAlign: "center", lineHeight: 22, maxWidth: 500 },

  // Inputs
  inputRow:        { marginBottom: 16 },
  inputRowTwoCol:  { flexDirection: "row", gap: 12 },
  inputCard:       { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, ...SHADOW_CARD },
  inputCardHalf:   { flex: 1, marginBottom: 0 },
  inputLabel:      { fontSize: 12, fontWeight: "800", letterSpacing: 1, color: C.terra, textTransform: "uppercase", marginBottom: 10 },

  // Upload zone
  uploadZone:      { borderWidth: 2, borderColor: C.border, borderStyle: "dashed", borderRadius: 12, padding: 24, alignItems: "center", backgroundColor: C.bg, minHeight: 150, justifyContent: "center" },
  uploadZoneDone:  { borderColor: C.green, borderStyle: "solid", backgroundColor: C.greenLight },
  uploadIcon:      { fontSize: 28, marginBottom: 8 },
  uploadPrompt:    { fontSize: 14, fontWeight: "600", color: C.text, marginBottom: 4 },
  uploadFilename:  { fontSize: 13, fontWeight: "600", color: C.green, marginBottom: 4, maxWidth: 200 },
  uploadHint:      { fontSize: 12, color: C.textSec },
  clearBtn:        { position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: C.border, alignItems: "center", justifyContent: "center" },
  clearBtnText:    { fontSize: 11, color: C.textSec, fontWeight: "700" },

  // Textarea
  textarea:        { borderWidth: 1.5, borderColor: C.border, borderRadius: 10, padding: 12, fontSize: 14, color: C.text, minHeight: 150, backgroundColor: C.bg, lineHeight: 22 },
  charCount:       { fontSize: 11, color: C.textMuted, textAlign: "right", marginTop: 4 },
  jdUpdateHint:    { fontSize: 11, color: C.terra, marginTop: 4, fontWeight: "600" },

  // Error
  errorBanner:  { backgroundColor: "#FFF1F2", borderWidth: 1, borderColor: "#FECACA", borderRadius: 10, padding: 14, marginBottom: 14, flexDirection: "row", alignItems: "center" },
  errorText:    { color: C.red, fontSize: 14, fontWeight: "500", flex: 1 },

  // Analyze button
  analyzeBtn:    { backgroundColor: C.terra, borderRadius: 999, paddingVertical: 15, alignItems: "center", marginBottom: 20, ...SHADOW_BTN },
  analyzeBtnOff: { backgroundColor: C.border, shadowOpacity: 0 },
  analyzeTxt:    { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 },
  analyzeTxtOff: { color: C.textSec },

  // Divider
  resultsDivider: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  dividerLine:    { flex: 1, height: 1, backgroundColor: C.border },
  dividerText:    { marginHorizontal: 12, fontSize: 12, fontWeight: "700", color: C.textSec, textTransform: "uppercase", letterSpacing: 1 },

  // Start over
  startOver:    { alignItems: "center", paddingVertical: 14 },
  startOverTxt: { fontSize: 14, fontWeight: "600", color: C.terra },
});
