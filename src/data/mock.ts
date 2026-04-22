// Mock data generation based on PRD Section 10 & 14

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

export const MOCK_COMPANIES = [
  { id: '1', name: 'Reliance Industries', ticker: 'RELIANCE', sector: 'Energy', marketCap: 1950000, revenue: 900000, rr: 0.85, vbi: 0.90, impactScore: 0.95, compScore: 0.80, credibility: 0.88 },
  { id: '2', name: 'Tata Consultancy Services', ticker: 'TCS', sector: 'Information Technology', marketCap: 1400000, revenue: 225000, rr: 1.20, vbi: 0.85, impactScore: 0.20, compScore: 0.24, credibility: 0.92 },
  { id: '3', name: 'HDFC Bank', ticker: 'HDFCBANK', sector: 'Financials', marketCap: 1100000, revenue: 200000, rr: 0.60, vbi: 0.70, impactScore: 0.15, compScore: 0.09, credibility: 0.85 },
  { id: '4', name: 'Infosys', ticker: 'INFY', sector: 'Information Technology', marketCap: 600000, revenue: 150000, rr: 1.50, vbi: 0.95, impactScore: 0.18, compScore: 0.27, credibility: 0.95 },
  { id: '5', name: 'Hindustan Unilever', ticker: 'HINDUNILVR', sector: 'Consumer Staples', marketCap: 550000, revenue: 60000, rr: 0.95, vbi: 0.80, impactScore: 0.40, compScore: 0.38, credibility: 0.82 },
  { id: '6', name: 'ITC', ticker: 'ITC', sector: 'Consumer Staples', marketCap: 500000, revenue: 70000, rr: 0.75, vbi: 0.65, impactScore: 0.50, compScore: 0.37, credibility: 0.78 },
  { id: '7', name: 'State Bank of India', ticker: 'SBIN', sector: 'Financials', marketCap: 650000, revenue: 450000, rr: 0.30, vbi: 0.50, impactScore: 0.25, compScore: 0.07, credibility: 0.65 },
  { id: '8', name: 'Bharti Airtel', ticker: 'BHARTIARTL', sector: 'Communication Services', marketCap: 600000, revenue: 140000, rr: 0.45, vbi: 0.55, impactScore: 0.30, compScore: 0.13, credibility: 0.70 },
  { id: '9', name: 'Tata Steel', ticker: 'TATASTEEL', sector: 'Materials', marketCap: 150000, revenue: 240000, rr: 0.65, vbi: 0.85, impactScore: 0.98, compScore: 0.63, credibility: 0.80 },
  { id: '10', name: 'Larsen & Toubro', ticker: 'LT', sector: 'Industrials', marketCap: 450000, revenue: 210000, rr: 0.55, vbi: 0.60, impactScore: 0.60, compScore: 0.33, credibility: 0.75 },
  { id: '11', name: 'NTPC', ticker: 'NTPC', sector: 'Utilities', marketCap: 300000, revenue: 170000, rr: 0.40, vbi: 0.75, impactScore: 1.00, compScore: 0.40, credibility: 0.86 },
  { id: '12', name: 'Sun Pharma', ticker: 'SUNPHARMA', sector: 'Health Care', marketCap: 350000, revenue: 45000, rr: 0.35, vbi: 0.45, impactScore: 0.35, compScore: 0.12, credibility: 0.60 },
  { id: '13', name: 'Asian Paints', ticker: 'ASIANPAINT', sector: 'Materials', marketCap: 280000, revenue: 35000, rr: 0.90, vbi: 0.70, impactScore: 0.45, compScore: 0.40, credibility: 0.84 },
  { id: '14', name: 'Maruti Suzuki', ticker: 'MARUTI', sector: 'Consumer Discretionary', marketCap: 320000, revenue: 120000, rr: 0.25, vbi: 0.40, impactScore: 0.55, compScore: 0.13, credibility: 0.68 },
  { id: '15', name: 'Mahindra & Mahindra', ticker: 'M&M', sector: 'Consumer Discretionary', marketCap: 220000, revenue: 110000, rr: 0.50, vbi: 0.65, impactScore: 0.50, compScore: 0.25, credibility: 0.72 },
];

// Aggregate data for sector chart
export const SECTOR_MEDIAN_RR = MOCK_SECTORS.map(sector => {
  const companies = MOCK_COMPANIES.filter(c => c.sector === sector);
  if (companies.length === 0) return { sector, rr: Math.random() * 0.8 + 0.2 }; // fallback for empty mocks
  
  const rrs = companies.map(c => c.rr).sort((a, b) => a - b);
  const median = rrs[Math.floor(rrs.length / 2)];
  return { sector, rr: median };
}).sort((a, b) => b.rr - a.rr);

export const TOP_10_COMPANIES = [...MOCK_COMPANIES].sort((a, b) => b.rr - a.rr).slice(0, 5); // using top 5 for UI space
export const BOTTOM_10_COMPANIES = [...MOCK_COMPANIES].sort((a, b) => a.rr - b.rr).slice(0, 5);

export const SCATTER_DATA = MOCK_COMPANIES.map(c => ({
  name: c.name,
  ticker: c.ticker,
  revenue: c.revenue,
  rr: c.rr,
  marketCap: c.marketCap,
  sector: c.sector
}));
