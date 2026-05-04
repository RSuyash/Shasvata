export interface Article {
  slug: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface MethodologyPage {
  slug: string;
  title: string;
  body: string;
}

export interface RegulatoryNote {
  slug: string;
  title: string;
  jurisdiction: string;
  body: string;
}

export const sampleArticles: Article[] = [
  {
    slug: "what-is-brsr",
    title: "What is BRSR?",
    summary: "A foundation note on India's Business Responsibility and Sustainability Reporting framework.",
    body: "BRSR is a disclosure framework for sustainability performance. This fixture is sample content for the foundation sprint.",
    tags: ["brsr", "disclosure"]
  },
  {
    slug: "source-transparency-sustainability-data",
    title: "Why source transparency matters in sustainability data",
    summary: "A short note on keeping every metric traceable to a source.",
    body: "Source transparency keeps sustainability data reviewable, defensible, and fit for advisory workflows.",
    tags: ["sources", "methodology"]
  }
];

export const sampleGlossary: GlossaryTerm[] = [
  {
    term: "Confidence grade",
    definition: "A compact signal describing the source strength behind a metric value."
  }
];
