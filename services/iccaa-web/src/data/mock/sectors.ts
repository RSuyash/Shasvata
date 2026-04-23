import { MOCK_COMPANIES } from './companies';

export const MOCK_SECTORS = [
  'Energy',
  'Materials',
  'Industrials',
  'Consumer Discretionary',
  'Consumer Staples',
  'Health Care',
  'Financials',
  'Information Technology',
  'Communication Services',
  'Utilities',
];

export const SECTOR_MEDIAN_RR = MOCK_SECTORS.map(sector => {
  const companies = MOCK_COMPANIES.filter(c => c.sector === sector);
  if (companies.length === 0) return { sector, rr: Math.random() * 0.8 + 0.2 };
  
  const rrs = companies.map(c => c.rr).sort((a, b) => a - b);
  const median = rrs[Math.floor(rrs.length / 2)];
  return { sector, rr: median };
}).sort((a, b) => b.rr - a.rr);
