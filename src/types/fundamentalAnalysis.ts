/**
 * Type definitions for Tesla Fundamental Analysis
 * Standardizes and extends Alpha Vantage data structures
 */

// Raw Alpha Vantage Data Types
export interface RawCompanyOverview {
  Symbol: string;
  AssetType: string;
  Name: string;
  Description: string;
  CIK: string;
  Exchange: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  Address: string;
  FiscalYearEnd: string;
  LatestQuarter: string;
  MarketCapitalization: string;
  EBITDA: string;
  PERatio: string;
  PEGRatio: string;
  BookValue: string;
  DividendPerShare: string;
  DividendYield: string;
  EPS: string;
  RevenuePerShareTTM: string;
  ProfitMargin: string;
  OperatingMarginTTM: string;
  ReturnOnAssetsTTM: string;
  ReturnOnEquityTTM: string;
  RevenueTTM: string;
  GrossProfitTTM: string;
  DilutedEPSTTM: string;
  QuarterlyEarningsGrowthYOY: string;
  QuarterlyRevenueGrowthYOY: string;
  AnalystTargetPrice: string;
  TrailingPE: string;
  ForwardPE: string;
  PriceToSalesRatioTTM: string;
  PriceToBookRatio: string;
  EVToRevenue: string;
  EVToEBITDA: string;
  Beta: string;
  '52WeekHigh': string;
  '52WeekLow': string;
  '50DayMovingAverage': string;
  '200DayMovingAverage': string;
  SharesOutstanding: string;
  DividendDate: string;
  ExDividendDate: string;
}

export interface RawIncomeStatement {
  fiscalDateEnding: string;
  reportedCurrency: string;
  totalRevenue: string;
  totalOperatingExpense: string;
  costOfRevenue: string;
  grossProfit: string;
  ebit: string;
  ebitda: string;
  depreciation: string;
  depreciationAndAmortization: string;
  incomeBeforeTax: string;
  incomeTaxExpense: string;
  interestIncome: string;
  interestExpense: string;
  netInterestIncome: string;
  otherOperatingExpense: string;
  operatingIncome: string;
  netIncome: string;
  researchAndDevelopment: string;
  effectOfAccountingCharges: string;
  incomeBeforeTaxExtraordinary: string;
  discontinuedOperations: string;
  extraordinaryItems: string;
  equityEarningsLossUnconsolidatedSubsidiary: string;
  netIncomeCommonStockholders: string;
  consolidatedIncome: string;
  earningsPerShare: string;
  earningsPerShareDiluted: string;
  weightedAverageSharesOutstanding: string;
  weightedAverageSharesOutstandingDiluted: string;
}

export interface RawBalanceSheet {
  fiscalDateEnding: string;
  reportedCurrency: string;
  totalAssets: string;
  totalCurrentAssets: string;
  cashAndCashEquivalentsAtCarryingValue: string;
  cashAndShortTermInvestments: string;
  inventory: string;
  currentNetReceivables: string;
  totalNonCurrentAssets: string;
  propertyPlantEquipment: string;
  accumulatedDepreciationAmortizationPPE: string;
  intangibleAssets: string;
  intangibleAssetsExcludingGoodwill: string;
  goodwill: string;
  investments: string;
  longTermInvestments: string;
  shortTermInvestments: string;
  otherCurrentAssets: string;
  otherNonCurrentAssets: string;
  totalLiabilities: string;
  totalCurrentLiabilities: string;
  currentAccountsPayable: string;
  deferredRevenue: string;
  currentDebt: string;
  shortTermDebt: string;
  totalNonCurrentLiabilities: string;
  capitalLeaseObligations: string;
  longTermDebt: string;
  currentLongTermDebt: string;
  longTermDebtNoncurrent: string;
  shortLongTermDebtTotal: string;
  otherCurrentLiabilities: string;
  otherNonCurrentLiabilities: string;
  totalShareholderEquity: string;
  treasuryStock: string;
  retainedEarnings: string;
  commonStock: string;
  commonStockSharesOutstanding: string;
}

export interface RawCashFlow {
  fiscalDateEnding: string;
  reportedCurrency: string;
  operatingCashflow: string;
  paymentsForOperatingActivities: string;
  proceedsFromOperatingActivities: string;
  changeInOperatingLiabilities: string;
  changeInOperatingAssets: string;
  depreciationDepletionAndAmortization: string;
  capitalExpenditures: string;
  changeInReceivables: string;
  changeInInventory: string;
  profitLoss: string;
  cashflowFromInvestment: string;
  cashflowFromFinancing: string;
  proceedsFromRepaymentsOfShortTermDebt: string;
  paymentsForRepurchaseOfCommonStock: string;
  paymentsForRepurchaseOfEquity: string;
  paymentsForRepurchaseOfPreferredStock: string;
  dividendPayout: string;
  dividendPayoutCommonStock: string;
  dividendPayoutPreferredStock: string;
  proceedsFromIssuanceOfCommonStock: string;
  proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet: string;
  proceedsFromIssuanceOfPreferredStock: string;
  proceedsFromRepurchaseOfEquity: string;
  proceedsFromSaleOfTreasuryStock: string;
  changeInCashAndCashEquivalents: string;
  changeInExchangeRate: string;
  netIncome: string;
}

// Normalized Financial Statements
export interface QuarterlyReport {
  fiscalDateEnding: string;
  fiscalQuarter: string;
  fiscalYear: string;
  type: 'quarterly' | 'annual';
  incomeStatement: NormalizedIncomeStatement;
  balanceSheet: NormalizedBalanceSheet;
  cashFlow: NormalizedCashFlow;
}

export interface AnnualReport {
  fiscalDateEnding: string;
  fiscalYear: string;
  incomeStatement: NormalizedIncomeStatement;
  balanceSheet: NormalizedBalanceSheet;
  cashFlow: NormalizedCashFlow;
}

export interface NormalizedIncomeStatement {
  fiscalDateEnding: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  grossMargin: number; // calculated
  operatingExpenses: number;
  operatingIncome: number;
  operatingMargin: number; // calculated
  ebitda: number;
  ebitdaMargin: number; // calculated
  interestIncome: number;
  interestExpense: number;
  netInterestIncome: number;
  incomeBeforeTax: number;
  incomeTaxExpense: number;
  netIncome: number;
  netMargin: number; // calculated
  earningsPerShare: number;
  earningsPerShareDiluted: number;
  researchAndDevelopment: number;
  rdAsPercentOfRevenue: number; // calculated
  weightedAverageSharesOutstanding: number;
  weightedAverageSharesOutstandingDiluted: number;
}

export interface NormalizedBalanceSheet {
  fiscalDateEnding: string;
  totalAssets: number;
  totalCurrentAssets: number;
  cashAndEquivalents: number;
  cashAndShortTermInvestments: number;
  inventory: number;
  receivables: number;
  totalNonCurrentAssets: number;
  propertyPlantEquipment: number;
  intangibleAssets: number;
  goodwill: number;
  totalLiabilities: number;
  totalCurrentLiabilities: number;
  currentAccountsPayable: number;
  deferredRevenue: number;
  shortTermDebt: number;
  totalNonCurrentLiabilities: number;
  longTermDebt: number;
  totalDebt: number;
  totalShareholderEquity: number;
  retainedEarnings: number;
  commonStockSharesOutstanding: number;
}

export interface NormalizedCashFlow {
  fiscalDateEnding: string;
  operatingCashflow: number;
  capitalExpenditures: number;
  freeCashFlow: number; // calculated
  cashflowFromInvestment: number;
  cashflowFromFinancing: number;
  changeInCashAndCashEquivalents: number;
  dividendPayout: number;
}

// Growth Rate Calculations
export interface GrowthRates {
  revenueYoY: number | null;
  revenueQoQ: number | null;
  netIncomeYoY: number | null;
  netIncomeQoQ: number | null;
  operatingIncomeYoY: number | null;
  operatingIncomeQoQ: number | null;
  grossProfitYoY: number | null;
  grossProfitQoQ: number | null;
  epsYoY: number | null;
  epsQoQ: number | null;
  freeCashFlowYoY: number | null;
  freeCashFlowQoQ: number | null;
}

// Financial Health Metrics
export interface FinancialHealthMetrics {
  // Profitability
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  ebitdaMargin: number;
  returnOnEquity: number;
  returnOnAssets: number;
  returnOnInvestedCapital: number | null; // calculated
  returnOnCapitalEmployed: number | null; // calculated
  
  // Liquidity
  currentRatio: number | null; // calculated
  quickRatio: number | null; // calculated
  cashRatio: number | null; // calculated
  
  // Leverage
  debtToEquity: number | null; // calculated
  debtToAssets: number | null; // calculated
  interestCoverageRatio: number | null; // calculated
  equityRatio: number | null; // calculated
  
  // Efficiency
  assetTurnover: number | null; // calculated
  inventoryTurnover: number | null; // calculated
  receivablesTurnover: number | null; // calculated
  daysSalesOutstanding: number | null; // calculated
  daysInventory: number | null; // calculated
  
  // Valuation
  priceToEarnings: number;
  priceToSales: number;
  priceToBook: number;
  enterpriseValueToRevenue: number;
  enterpriseValueToEbitda: number;
  pegRatio: number;
  
  // Cash Flow
  operatingCashFlowMargin: number | null; // calculated
  freeCashFlowMargin: number | null; // calculated
  freeCashFlowYield: number | null; // calculated
}

// Tesla-Specific Metrics
export interface TeslaSpecificMetrics {
  // Automotive Industry Metrics (derived from financial data)
  // Note: Actual delivery/production data not available from Alpha Vantage
  // These are calculated estimates based on financial data
  
  revenuePerShare: number; // RevenueTTM / SharesOutstanding
  freeCashFlowPerShare: number | null; // calculated
  capexAsPercentOfRevenue: number | null; // calculated
  rdAsPercentOfRevenue: number | null; // calculated
  
  // Operating Leverage Indicators
  operatingLeverage: number | null; // calculated from margin trends
  revenueGrowthTrend: 'increasing' | 'decreasing' | 'stable' | null;
  marginExpansion: number | null; // calculated
  
  // Capital Efficiency
  assetTurnoverRatio: number | null; // calculated
  capitalEfficiency: number | null; // Revenue / Total Assets growth
  
  // Working Capital
  workingCapital: number | null; // Current Assets - Current Liabilities
  workingCapitalRatio: number | null; // calculated
  inventoryDays: number | null; // calculated
  receivablesDays: number | null; // calculated
  
  // Cash Position
  cashToMarketCap: number | null; // calculated
  cashToDebt: number | null; // calculated
  
  // Note: Vehicle-specific metrics like deliveries, ASP, etc.
  // are not available from Alpha Vantage and would require
  // integration with additional data sources (Tesla investor relations, SEC filings)
}

// Combined Fundamental Data
export interface TeslaFundamentalData {
  companyOverview: RawCompanyOverview;
  quarterlyReports: QuarterlyReport[];
  annualReports: AnnualReport[];
  financialHealth: FinancialHealthMetrics;
  teslaMetrics: TeslaSpecificMetrics;
  growthRates: {
    quarterly: GrowthRates[];
    annual: GrowthRates[];
  };
  lastUpdated: Date;
  dataSource: 'Alpha Vantage';
}

// UI Component Props
export interface FinancialDataDisplayProps {
  data: TeslaFundamentalData;
  period: 'quarterly' | 'annual';
  onAskAI?: (context: string) => void;
}

export interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number | null;
  changeType?: 'positive' | 'negative' | 'neutral';
  format?: 'currency' | 'percentage' | 'number';
  tooltip?: string;
}

export interface TrendIndicatorProps {
  current: number;
  previous: number | null;
  type: 'increase' | 'decrease' | 'neutral';
  format?: 'currency' | 'percentage' | 'number';
}

// Chart Data Types
export interface TrendChartDataPoint {
  date: string;
  value: number;
  period: 'quarterly' | 'annual';
}

export interface FinancialTrendData {
  revenue: TrendChartDataPoint[];
  netIncome: TrendChartDataPoint[];
  operatingIncome: TrendChartDataPoint[];
  freeCashFlow: TrendChartDataPoint[];
  grossMargin: TrendChartDataPoint[];
  operatingMargin: TrendChartDataPoint[];
  netMargin: TrendChartDataPoint[];
}

