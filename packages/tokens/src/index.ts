export const brandColors = {
  deepForest: "#1B4332",
  mediumGreen: "#40916C",
  lightGreen: "#D8F3DC",
  brassGold: "#C9A84C",
  warmIvory: "#FDF8F0",
  nearBlack: "#1A1A1A",
  stoneGray: "#6B7280",
  white: "#FFFFFF"
} as const;

export const confidenceGrades = {
  A: {
    label: "Verified public/structured source",
    multiplier: 1,
    tone: "strong"
  },
  B: {
    label: "Official PDF/reviewed extraction",
    multiplier: 0.85,
    tone: "good"
  },
  C: {
    label: "Voluntary/proxy/limited source",
    multiplier: 0.6,
    tone: "caution"
  },
  D: {
    label: "Missing/not publicly disclosed",
    multiplier: 0.25,
    tone: "weak"
  }
} as const;

export const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem"
} as const;

export const typography = {
  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  sizes: {
    body: "1rem",
    small: "0.875rem",
    h1: "2.5rem",
    h2: "1.75rem",
    h3: "1.25rem"
  }
} as const;

export const zIndex = {
  base: 0,
  dropdown: 10,
  modal: 50,
  toast: 80
} as const;

export const chartTokens = {
  positive: brandColors.mediumGreen,
  neutral: brandColors.stoneGray,
  caution: brandColors.brassGold,
  lowConfidence: brandColors.lightGreen,
  axis: "#D1D5DB"
} as const;

export type ConfidenceGrade = keyof typeof confidenceGrades;
