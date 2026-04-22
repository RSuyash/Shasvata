export const MOCK_RESEARCH = {
  formulas: [
    {
      title: 'Impact Score',
      formula: 'I = (S1 + S2 + S3) / MarketCap',
      explanation: 'Evaluates absolute emissions normalized by market capitalization to establish financial efficiency of the resource extraction.'
    },
    {
      title: 'Compensation Score',
      formula: 'C = ∑(Credits × Quality) / (Total Emissions)',
      explanation: 'Measures the proportion of the footprint that is actively neutralized through verified market instruments and CSR actions.'
    },
    {
      title: 'Credibility Score',
      formula: 'Cr = (Completeness × AssuranceWeight) - GreenwashPenalty',
      explanation: 'Algorithms score the raw data based on source tier, completeness, missing critical fields, and third-party assurance.'
    },
    {
      title: 'Responsibility Ratio (RR)',
      formula: 'RR = CompensationScore / ImpactScore',
      explanation: 'The ultimate index. A ratio > 1 means the company compensates beyond its operational damage.'
    },
    {
      title: 'Voluntary Behavior Index (VBI)',
      formula: 'VBI = f(Beyond Compliance Actions)',
      explanation: 'Tracks purely voluntary actions such as afforestation, biodiversity restoration, and non-mandated community water projects.'
    }
  ],
  sourceTiers: [
    { tier: 1, name: 'Mandatory Public Disclosure', examples: 'BRSR, Annual Report, SEBI Disclosures' },
    { tier: 2, name: 'Voluntary Public Disclosure', examples: 'CDP, Sustainability Report, TCFD' },
    { tier: 3, name: 'Third-Party Verified', examples: 'Science Based Targets initiative (SBTi), Verified Carbon Standard (VCS)' },
    { tier: 4, name: 'Self-Reported/Unverified', examples: 'Company Website, Press Releases, Unaudited Claims' }
  ]
};
