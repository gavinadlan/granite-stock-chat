// US Stock symbols with company names
export interface USStock {
  symbol: string;
  companyName: string;
  sector?: string;
}

export const US_STOCKS: USStock[] = [
  // Technology
  { symbol: 'AAPL', companyName: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'MSFT', companyName: 'Microsoft Corporation', sector: 'Technology' },
  { symbol: 'GOOGL', companyName: 'Alphabet Inc. (Google)', sector: 'Technology' },
  { symbol: 'GOOG', companyName: 'Alphabet Inc. Class C', sector: 'Technology' },
  { symbol: 'AMZN', companyName: 'Amazon.com Inc.', sector: 'Technology' },
  { symbol: 'META', companyName: 'Meta Platforms Inc. (Facebook)', sector: 'Technology' },
  { symbol: 'NVDA', companyName: 'NVIDIA Corporation', sector: 'Technology' },
  { symbol: 'TSLA', companyName: 'Tesla, Inc.', sector: 'Technology' },
  { symbol: 'NFLX', companyName: 'Netflix, Inc.', sector: 'Technology' },
  { symbol: 'AMD', companyName: 'Advanced Micro Devices, Inc.', sector: 'Technology' },
  { symbol: 'INTC', companyName: 'Intel Corporation', sector: 'Technology' },
  { symbol: 'CRM', companyName: 'Salesforce, Inc.', sector: 'Technology' },
  { symbol: 'ORCL', companyName: 'Oracle Corporation', sector: 'Technology' },
  { symbol: 'ADBE', companyName: 'Adobe Inc.', sector: 'Technology' },
  { symbol: 'CSCO', companyName: 'Cisco Systems, Inc.', sector: 'Technology' },
  { symbol: 'IBM', companyName: 'International Business Machines', sector: 'Technology' },
  { symbol: 'QCOM', companyName: 'QUALCOMM Incorporated', sector: 'Technology' },
  { symbol: 'TXN', companyName: 'Texas Instruments Incorporated', sector: 'Technology' },
  { symbol: 'AVGO', companyName: 'Broadcom Inc.', sector: 'Technology' },
  { symbol: 'NOW', companyName: 'ServiceNow, Inc.', sector: 'Technology' },
  
  // Finance
  { symbol: 'JPM', companyName: 'JPMorgan Chase & Co.', sector: 'Finance' },
  { symbol: 'BAC', companyName: 'Bank of America Corp.', sector: 'Finance' },
  { symbol: 'WFC', companyName: 'Wells Fargo & Company', sector: 'Finance' },
  { symbol: 'C', companyName: 'Citigroup Inc.', sector: 'Finance' },
  { symbol: 'GS', companyName: 'Goldman Sachs Group, Inc.', sector: 'Finance' },
  { symbol: 'MS', companyName: 'Morgan Stanley', sector: 'Finance' },
  { symbol: 'BLK', companyName: 'BlackRock, Inc.', sector: 'Finance' },
  { symbol: 'SCHW', companyName: 'Charles Schwab Corporation', sector: 'Finance' },
  { symbol: 'AXP', companyName: 'American Express Company', sector: 'Finance' },
  { symbol: 'V', companyName: 'Visa Inc.', sector: 'Finance' },
  { symbol: 'MA', companyName: 'Mastercard Incorporated', sector: 'Finance' },
  
  // Healthcare
  { symbol: 'JNJ', companyName: 'Johnson & Johnson', sector: 'Healthcare' },
  { symbol: 'UNH', companyName: 'UnitedHealth Group Inc.', sector: 'Healthcare' },
  { symbol: 'PFE', companyName: 'Pfizer Inc.', sector: 'Healthcare' },
  { symbol: 'ABBV', companyName: 'AbbVie Inc.', sector: 'Healthcare' },
  { symbol: 'TMO', companyName: 'Thermo Fisher Scientific Inc.', sector: 'Healthcare' },
  { symbol: 'ABT', companyName: 'Abbott Laboratories', sector: 'Healthcare' },
  { symbol: 'DHR', companyName: 'Danaher Corporation', sector: 'Healthcare' },
  { symbol: 'BMY', companyName: 'Bristol-Myers Squibb Company', sector: 'Healthcare' },
  { symbol: 'AMGN', companyName: 'Amgen Inc.', sector: 'Healthcare' },
  { symbol: 'GILD', companyName: 'Gilead Sciences, Inc.', sector: 'Healthcare' },
  { symbol: 'CVS', companyName: 'CVS Health Corporation', sector: 'Healthcare' },
  { symbol: 'CI', companyName: 'Cigna Corporation', sector: 'Healthcare' },
  { symbol: 'HUM', companyName: 'Humana Inc.', sector: 'Healthcare' },
  
  // Consumer
  { symbol: 'WMT', companyName: 'Walmart Inc.', sector: 'Consumer' },
  { symbol: 'HD', companyName: 'The Home Depot, Inc.', sector: 'Consumer' },
  { symbol: 'MCD', companyName: 'McDonald\'s Corporation', sector: 'Consumer' },
  { symbol: 'SBUX', companyName: 'Starbucks Corporation', sector: 'Consumer' },
  { symbol: 'NKE', companyName: 'Nike, Inc.', sector: 'Consumer' },
  { symbol: 'TGT', companyName: 'Target Corporation', sector: 'Consumer' },
  { symbol: 'LOW', companyName: 'Lowe\'s Companies, Inc.', sector: 'Consumer' },
  { symbol: 'COST', companyName: 'Costco Wholesale Corporation', sector: 'Consumer' },
  { symbol: 'DIS', companyName: 'The Walt Disney Company', sector: 'Consumer' },
  { symbol: 'CMCSA', companyName: 'Comcast Corporation', sector: 'Consumer' },
  { symbol: 'PEP', companyName: 'PepsiCo, Inc.', sector: 'Consumer' },
  { symbol: 'KO', companyName: 'The Coca-Cola Company', sector: 'Consumer' },
  { symbol: 'PG', companyName: 'The Procter & Gamble Company', sector: 'Consumer' },
  { symbol: 'PM', companyName: 'Philip Morris International Inc.', sector: 'Consumer' },
  
  // Energy
  { symbol: 'XOM', companyName: 'Exxon Mobil Corporation', sector: 'Energy' },
  { symbol: 'CVX', companyName: 'Chevron Corporation', sector: 'Energy' },
  { symbol: 'COP', companyName: 'ConocoPhillips', sector: 'Energy' },
  { symbol: 'SLB', companyName: 'Schlumberger Limited', sector: 'Energy' },
  { symbol: 'EOG', companyName: 'EOG Resources, Inc.', sector: 'Energy' },
  
  // Industrial
  { symbol: 'BA', companyName: 'The Boeing Company', sector: 'Industrial' },
  { symbol: 'CAT', companyName: 'Caterpillar Inc.', sector: 'Industrial' },
  { symbol: 'GE', companyName: 'General Electric Company', sector: 'Industrial' },
  { symbol: 'HON', companyName: 'Honeywell International Inc.', sector: 'Industrial' },
  { symbol: 'UPS', companyName: 'United Parcel Service, Inc.', sector: 'Industrial' },
  { symbol: 'RTX', companyName: 'Raytheon Technologies Corporation', sector: 'Industrial' },
  { symbol: 'LMT', companyName: 'Lockheed Martin Corporation', sector: 'Industrial' },
  { symbol: 'DE', companyName: 'Deere & Company', sector: 'Industrial' },
  
  // Communication
  { symbol: 'T', companyName: 'AT&T Inc.', sector: 'Communication' },
  { symbol: 'VZ', companyName: 'Verizon Communications Inc.', sector: 'Communication' },
  { symbol: 'TMUS', companyName: 'T-Mobile US, Inc.', sector: 'Communication' },
  
  // Utilities
  { symbol: 'NEE', companyName: 'NextEra Energy, Inc.', sector: 'Utilities' },
  { symbol: 'DUK', companyName: 'Duke Energy Corporation', sector: 'Utilities' },
  { symbol: 'SO', companyName: 'The Southern Company', sector: 'Utilities' },
  
  // Real Estate
  { symbol: 'AMT', companyName: 'American Tower Corporation', sector: 'Real Estate' },
  { symbol: 'PLD', companyName: 'Prologis, Inc.', sector: 'Real Estate' },
  { symbol: 'EQIX', companyName: 'Equinix, Inc.', sector: 'Real Estate' },
  
  // Materials
  { symbol: 'LIN', companyName: 'Linde plc', sector: 'Materials' },
  { symbol: 'APD', companyName: 'Air Products and Chemicals, Inc.', sector: 'Materials' },
  { symbol: 'FCX', companyName: 'Freeport-McMoRan Inc.', sector: 'Materials' },
  
  // Other Popular Stocks
  { symbol: 'SPY', companyName: 'SPDR S&P 500 ETF Trust', sector: 'ETF' },
  { symbol: 'QQQ', companyName: 'Invesco QQQ Trust', sector: 'ETF' },
  { symbol: 'BRK.B', companyName: 'Berkshire Hathaway Inc. Class B', sector: 'Finance' },
  { symbol: 'BRK.A', companyName: 'Berkshire Hathaway Inc. Class A', sector: 'Finance' },
];

// Helper function to search stocks
export function searchUSStocks(query: string): USStock[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return US_STOCKS;
  
  return US_STOCKS.filter(stock => 
    stock.symbol.toLowerCase().includes(lowerQuery) ||
    stock.companyName.toLowerCase().includes(lowerQuery) ||
    (stock.sector && stock.sector.toLowerCase().includes(lowerQuery))
  );
}

