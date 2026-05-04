export interface JobDefinition {
  key: string;
  description: string;
}

export const jobRegistry: JobDefinition[] = [
  {
    key: "report.generate",
    description: "Placeholder for future report generation jobs"
  },
  {
    key: "score.recompute",
    description: "Placeholder for future intelligence score recomputation"
  },
  {
    key: "source.ingest",
    description: "Placeholder for future source ingestion"
  }
];
