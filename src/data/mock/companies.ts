import { CompanySummary } from '../../types/iccaa';

export const MOCK_COMPANIES: CompanySummary[] = [
  { id: '1', name: 'Reliance Industries', ticker: 'RELIANCE', sector: 'Energy', industry: 'Oil & Gas Refining & Marketing', isNifty50: true, marketCap: 1950000, revenue: 900000, pat: 73000, rr: 0.85, vbi: 0.90, impactScore: 0.95, compensationScore: 0.80, credibilityScore: 0.88 },
  { id: '2', name: 'Tata Consultancy Services', ticker: 'TCS', sector: 'Information Technology', industry: 'IT Services', isNifty50: true, marketCap: 1400000, revenue: 225000, pat: 42000, rr: 1.20, vbi: 0.85, impactScore: 0.20, compensationScore: 0.24, credibilityScore: 0.92 },
  { id: '3', name: 'HDFC Bank', ticker: 'HDFCBANK', sector: 'Financials', industry: 'Banks', isNifty50: true, marketCap: 1100000, revenue: 200000, pat: 46000, rr: 0.60, vbi: 0.70, impactScore: 0.15, compensationScore: 0.09, credibilityScore: 0.85 },
  { id: '4', name: 'Infosys', ticker: 'INFY', sector: 'Information Technology', industry: 'IT Services', isNifty50: true, marketCap: 600000, revenue: 150000, pat: 24000, rr: 1.50, vbi: 0.95, impactScore: 0.18, compensationScore: 0.27, credibilityScore: 0.95 },
  { id: '5', name: 'Hindustan Unilever', ticker: 'HINDUNILVR', sector: 'Consumer Staples', industry: 'Personal Products', isNifty50: true, marketCap: 550000, revenue: 60000, pat: 10000, rr: 0.95, vbi: 0.80, impactScore: 0.40, compensationScore: 0.38, credibilityScore: 0.82 },
  { id: '6', name: 'ITC', ticker: 'ITC', sector: 'Consumer Staples', industry: 'Tobacco', isNifty50: true, marketCap: 500000, revenue: 70000, pat: 19000, rr: 0.75, vbi: 0.65, impactScore: 0.50, compensationScore: 0.37, credibilityScore: 0.78 },
  { id: '7', name: 'State Bank of India', ticker: 'SBIN', sector: 'Financials', industry: 'Banks', isNifty50: true, marketCap: 650000, revenue: 450000, pat: 50000, rr: 0.30, vbi: 0.50, impactScore: 0.25, compensationScore: 0.07, credibilityScore: 0.65 },
  { id: '8', name: 'Bharti Airtel', ticker: 'BHARTIARTL', sector: 'Communication Services', industry: 'Wireless Telecommunication Services', isNifty50: true, marketCap: 600000, revenue: 140000, pat: 8000, rr: 0.45, vbi: 0.55, impactScore: 0.30, compensationScore: 0.13, credibilityScore: 0.70 },
  { id: '9', name: 'Tata Steel', ticker: 'TATASTEEL', sector: 'Materials', industry: 'Steel', isNifty50: true, marketCap: 150000, revenue: 240000, pat: 9000, rr: 0.65, vbi: 0.85, impactScore: 0.98, compensationScore: 0.63, credibilityScore: 0.80 },
  { id: '10', name: 'Larsen & Toubro', ticker: 'LT', sector: 'Industrials', industry: 'Construction & Engineering', isNifty50: true, marketCap: 450000, revenue: 210000, pat: 12000, rr: 0.55, vbi: 0.60, impactScore: 0.60, compensationScore: 0.33, credibilityScore: 0.75 },
  { id: '11', name: 'NTPC', ticker: 'NTPC', sector: 'Utilities', industry: 'Independent Power and Renewable Electricity Producers', isNifty50: true, marketCap: 300000, revenue: 170000, pat: 17000, rr: 0.40, vbi: 0.75, impactScore: 1.00, compensationScore: 0.40, credibilityScore: 0.86 },
  { id: '12', name: 'Sun Pharma', ticker: 'SUNPHARMA', sector: 'Health Care', industry: 'Pharmaceuticals', isNifty50: true, marketCap: 350000, revenue: 45000, pat: 8500, rr: 0.35, vbi: 0.45, impactScore: 0.35, compensationScore: 0.12, credibilityScore: 0.60 },
  { id: '13', name: 'Asian Paints', ticker: 'ASIANPAINT', sector: 'Materials', industry: 'Chemicals', isNifty50: true, marketCap: 280000, revenue: 35000, pat: 4100, rr: 0.90, vbi: 0.70, impactScore: 0.45, compensationScore: 0.40, credibilityScore: 0.84 },
  { id: '14', name: 'Maruti Suzuki', ticker: 'MARUTI', sector: 'Consumer Discretionary', industry: 'Automobiles', isNifty50: true, marketCap: 320000, revenue: 120000, pat: 8000, rr: 0.25, vbi: 0.40, impactScore: 0.55, compensationScore: 0.13, credibilityScore: 0.68 },
  { id: '15', name: 'Mahindra & Mahindra', ticker: 'M&M', sector: 'Consumer Discretionary', industry: 'Automobiles', isNifty50: true, marketCap: 220000, revenue: 110000, pat: 10000, rr: 0.50, vbi: 0.65, impactScore: 0.50, compensationScore: 0.25, credibilityScore: 0.72 },
];

export const TOP_10_COMPANIES = [...MOCK_COMPANIES].sort((a, b) => b.rr - a.rr).slice(0, 10);
export const BOTTOM_10_COMPANIES = [...MOCK_COMPANIES].sort((a, b) => a.rr - b.rr).slice(0, 10);

export const SCATTER_DATA = MOCK_COMPANIES.map(c => ({
  name: c.name,
  ticker: c.ticker,
  revenue: c.revenue,
  rr: c.rr,
  marketCap: c.marketCap,
  sector: c.sector
}));

