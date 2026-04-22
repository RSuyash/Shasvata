import { MOCK_COMPANIES } from './companies';
import { CompanyDetail } from '../../types/iccaa';

export const MOCK_COMPANY_DETAILS: CompanyDetail[] = MOCK_COMPANIES.map(comp => ({
  ...comp,
  cin: `L99999MH${Math.floor(1900 + Math.random() * 100)}PLC${Math.floor(100000 + Math.random() * 899999)}`,
  isin: `INE${Math.floor(100000000 + Math.random() * 899999999)}`,
  incorporationYear: Math.floor(1900 + Math.random() * 100),
  age: 2024 - Math.floor(1900 + Math.random() * 100),
  employeeCount: Math.floor(10000 + Math.random() * 200000),
  countryCount: Math.floor(1 + Math.random() * 50),
  overseasRevenuePct: Math.floor(Math.random() * 60),
  exportValue: Math.floor(Math.random() * 10000),
  subsidiaryCount: Math.floor(10 + Math.random() * 100),
  environmental: {
    scope1: [
      { year: 'FY20', value: 12000, confidence: 'B' },
      { year: 'FY21', value: 12500, confidence: 'B' },
      { year: 'FY22', value: 13000, confidence: 'A' },
      { year: 'FY23', value: 14000, confidence: 'A' },
      { year: 'FY24', value: 14500, confidence: 'A' },
    ],
    scope2: [
      { year: 'FY20', value: 8000, confidence: 'B' },
      { year: 'FY21', value: 8200, confidence: 'B' },
      { year: 'FY22', value: 8100, confidence: 'A' },
      { year: 'FY23', value: 7900, confidence: 'A' },
      { year: 'FY24', value: 7500, confidence: 'A' },
    ],
    carbonIntensity: [
      { year: 'FY20', value: 52.4 },
      { year: 'FY21', value: 51.0 },
      { year: 'FY22', value: 49.5 },
      { year: 'FY23', value: 48.8 },
      { year: 'FY24', value: 48.2 },
    ],
    renewablePct: [
      { year: 'FY20', value: 15 },
      { year: 'FY24', value: 25 },
    ],
    waterIntensity: [
      { year: 'FY20', value: 11000 },
      { year: 'FY24', value: 12450 },
    ],
    wasteIntensity: [
      { year: 'FY20', value: 750 },
      { year: 'FY24', value: 840 },
    ],
  },
  compensation: {
    carbonCredits: [
      { year: 'FY20', value: 120 },
      { year: 'FY24', value: 280 },
    ],
    recs: [
      { year: 'FY20', value: 50 },
      { year: 'FY24', value: 220 },
    ],
    greenCredits: [
      { year: 'FY24', value: 10 },
    ],
    afforestationHa: [
      { year: 'FY24', value: 1500 },
    ],
    biodiversityProjects: [
      { year: 'FY24', value: 3 },
    ],
    csrEnvSpend: [
      { year: 'FY20', value: 10 },
      { year: 'FY24', value: 45 },
    ],
  },
  credibility: {
    completenessPct: Math.floor(60 + Math.random() * 40),
    assuranceType: Math.random() > 0.5 ? 'Reasonable' : 'Limited',
    assuranceProvider: 'Big 4',
    sourceTierAvg: 2.1,
    missingFields: ['Internal Carbon Pricing', 'Scope 3 Category 11'],
    greenwashingSignal: Math.random() > 0.8,
  }
}));
