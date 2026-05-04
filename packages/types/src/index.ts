export type {
  ActionEvent,
  Entity,
  Insight,
  MethodologyVersion,
  MetricDefinition,
  MetricValue,
  Report,
  ReportingPeriod,
  Score,
  ScoreRun,
  SourceCitation,
  SourceDocument
} from "@shasvata/schemas";

export interface ApiHealthResponse {
  ok: boolean;
  service: string;
  environment: string;
  version: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface IntelligenceCompanyResponse {
  slug: string;
  name: string;
  sector: string;
  status: "sample" | "active";
}

export interface IntelligenceMetricResponse {
  entitySlug: string;
  metricKey: string;
  label: string;
  value: number;
  unit: string;
  confidenceGrade: "A" | "B" | "C" | "D";
}

export interface IntelligenceScoreResponse {
  entitySlug: string;
  scoreKey: string;
  value: number;
  confidenceGrade: "A" | "B" | "C" | "D";
  methodologyVersion: string;
}
