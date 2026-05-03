import { z } from "zod";

export const StatusSchema = z.enum(["draft", "active", "archived", "sample"]);
export const ConfidenceGradeSchema = z.enum(["A", "B", "C", "D"]);

export const EntitySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  sector: z.string(),
  status: StatusSchema.default("sample"),
  metadata: z.record(z.unknown()).default({})
});

export const ReportingPeriodSchema = z.object({
  id: z.string(),
  entityId: z.string(),
  label: z.string(),
  fiscalYear: z.number().int(),
  status: StatusSchema.default("sample")
});

export const SourceDocumentSchema = z.object({
  id: z.string(),
  entityId: z.string(),
  title: z.string(),
  url: z.string().url().optional(),
  sourceType: z.string(),
  status: StatusSchema.default("sample"),
  metadata: z.record(z.unknown()).default({})
});

export const SourceCitationSchema = z.object({
  id: z.string(),
  sourceDocumentId: z.string(),
  locator: z.string(),
  excerpt: z.string(),
  confidenceGrade: ConfidenceGradeSchema
});

export const MetricDefinitionSchema = z.object({
  id: z.string(),
  key: z.string(),
  label: z.string(),
  unit: z.string(),
  description: z.string()
});

export const MetricValueSchema = z.object({
  id: z.string(),
  entityId: z.string(),
  metricKey: z.string(),
  reportingPeriodId: z.string(),
  value: z.number(),
  unit: z.string(),
  confidenceGrade: ConfidenceGradeSchema,
  citationIds: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).default({})
});

export const MethodologyVersionSchema = z.object({
  id: z.string(),
  version: z.string(),
  status: StatusSchema,
  notes: z.string()
});

export const ScoreRunSchema = z.object({
  id: z.string(),
  methodologyVersionId: z.string(),
  status: StatusSchema,
  metadata: z.record(z.unknown()).default({})
});

export const ScoreSchema = z.object({
  id: z.string(),
  scoreRunId: z.string(),
  entityId: z.string(),
  key: z.string(),
  value: z.number(),
  confidenceGrade: ConfidenceGradeSchema,
  metadata: z.record(z.unknown()).default({})
});

export const InsightSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  status: StatusSchema
});

export const ReportSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  entityId: z.string().optional(),
  status: StatusSchema,
  metadata: z.record(z.unknown()).default({})
});

export const ActionEventSchema = z.object({
  id: z.string(),
  actorId: z.string().optional(),
  action: z.string(),
  targetType: z.string(),
  targetId: z.string().optional(),
  metadata: z.record(z.unknown()).default({})
});

export type Entity = z.infer<typeof EntitySchema>;
export type ReportingPeriod = z.infer<typeof ReportingPeriodSchema>;
export type SourceDocument = z.infer<typeof SourceDocumentSchema>;
export type SourceCitation = z.infer<typeof SourceCitationSchema>;
export type MetricDefinition = z.infer<typeof MetricDefinitionSchema>;
export type MetricValue = z.infer<typeof MetricValueSchema>;
export type MethodologyVersion = z.infer<typeof MethodologyVersionSchema>;
export type ScoreRun = z.infer<typeof ScoreRunSchema>;
export type Score = z.infer<typeof ScoreSchema>;
export type Insight = z.infer<typeof InsightSchema>;
export type Report = z.infer<typeof ReportSchema>;
export type ActionEvent = z.infer<typeof ActionEventSchema>;
