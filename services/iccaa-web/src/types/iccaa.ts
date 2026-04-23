export type ConfidenceGrade = 'A' | 'B' | 'C' | 'D';
export type AssuranceType = 'None' | 'Limited' | 'Reasonable';

export interface CompanySummary {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  industry?: string;
  isNifty50: boolean;
  marketCap: number;
  revenue: number;
  pat: number;
  rr: number;
  vbi: number;
  impactScore: number;
  compensationScore: number;
  credibilityScore: number;
}

export interface YearPoint {
  year: string;
  value: number;
  confidence?: ConfidenceGrade;
}

export interface EnvironmentalSeries {
  scope1: YearPoint[];
  scope2: YearPoint[];
  carbonIntensity: YearPoint[];
  renewablePct: YearPoint[];
  waterIntensity: YearPoint[];
  wasteIntensity: YearPoint[];
}

export interface CompensationSeries {
  carbonCredits: YearPoint[];
  recs: YearPoint[];
  greenCredits: YearPoint[];
  afforestationHa: YearPoint[];
  biodiversityProjects: YearPoint[];
  csrEnvSpend: YearPoint[];
}

export interface CredibilitySnapshot {
  completenessPct: number;
  assuranceType: AssuranceType;
  assuranceProvider?: string;
  sourceTierAvg: number;
  missingFields: string[];
  greenwashingSignal: boolean;
}

export interface CompanyDetail extends CompanySummary {
  cin?: string;
  isin?: string;
  incorporationYear: number;
  age: number;
  employeeCount: number;
  countryCount: number;
  overseasRevenuePct?: number;
  exportValue?: number;
  subsidiaryCount?: number;
  environmental: EnvironmentalSeries;
  compensation: CompensationSeries;
  credibility: CredibilitySnapshot;
}
