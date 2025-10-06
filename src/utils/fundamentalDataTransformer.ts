/**
 * Fundamental Data Transformer Utilities
 * Transforms and normalizes Alpha Vantage data into standardized formats
 * Calculates derived metrics, growth rates, and financial health indicators
 */

import {
  RawCompanyOverview,
  RawIncomeStatement,
  RawBalanceSheet,
  RawCashFlow,
  QuarterlyReport,
  AnnualReport,
  NormalizedIncomeStatement,
  NormalizedBalanceSheet,
  NormalizedCashFlow,
  GrowthRates,
  FinancialHealthMetrics,
  TeslaSpecificMetrics,
  TeslaFundamentalData,
  TrendChartDataPoint,
  FinancialTrendData,
} from '../types/fundamentalAnalysis';

/**
 * Parse a numeric string value from Alpha Vantage API
 * Handles 'None', empty strings, and numeric strings
 */
function parseNumericValue(value: string | undefined | null): number {
  if (!value || value === 'None' || value === 'null' || value.trim() === '') {
    return 0;
  }
  const parsed = parseFloat(value.replace(/,/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format currency value
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number value
 */
export function formatNumber(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined) return 'N/A';
  return value.toFixed(decimals);
}

/**
 * Normalize income statement data
 */
export function normalizeIncomeStatement(
  raw: RawIncomeStatement
): NormalizedIncomeStatement {
  const revenue = parseNumericValue(raw.totalRevenue);
  const costOfRevenue = parseNumericValue(raw.costOfRevenue);
  const grossProfit = parseNumericValue(raw.grossProfit);
  const operatingIncome = parseNumericValue(raw.operatingIncome);
  const ebitda = parseNumericValue(raw.ebitda);
  const netIncome = parseNumericValue(raw.netIncome);
  const operatingExpenses = parseNumericValue(raw.totalOperatingExpense);
  const rd = parseNumericValue(raw.researchAndDevelopment);

  return {
    fiscalDateEnding: raw.fiscalDateEnding,
    revenue,
    costOfRevenue,
    grossProfit,
    grossMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
    operatingExpenses,
    operatingIncome,
    operatingMargin: revenue > 0 ? (operatingIncome / revenue) * 100 : 0,
    ebitda,
    ebitdaMargin: revenue > 0 ? (ebitda / revenue) * 100 : 0,
    interestIncome: parseNumericValue(raw.interestIncome),
    interestExpense: parseNumericValue(raw.interestExpense),
    netInterestIncome: parseNumericValue(raw.netInterestIncome),
    incomeBeforeTax: parseNumericValue(raw.incomeBeforeTax),
    incomeTaxExpense: parseNumericValue(raw.incomeTaxExpense),
    netIncome,
    netMargin: revenue > 0 ? (netIncome / revenue) * 100 : 0,
    earningsPerShare: parseNumericValue(raw.earningsPerShare),
    earningsPerShareDiluted: parseNumericValue(raw.earningsPerShareDiluted),
    researchAndDevelopment: rd,
    rdAsPercentOfRevenue: revenue > 0 ? (rd / revenue) * 100 : 0,
    weightedAverageSharesOutstanding: parseNumericValue(raw.weightedAverageSharesOutstanding),
    weightedAverageSharesOutstandingDiluted: parseNumericValue(raw.weightedAverageSharesOutstandingDiluted),
  };
}

/**
 * Normalize balance sheet data
 */
export function normalizeBalanceSheet(
  raw: RawBalanceSheet
): NormalizedBalanceSheet {
  const totalAssets = parseNumericValue(raw.totalAssets);
  const totalCurrentAssets = parseNumericValue(raw.totalCurrentAssets);
  const totalLiabilities = parseNumericValue(raw.totalLiabilities);
  const totalCurrentLiabilities = parseNumericValue(raw.totalCurrentLiabilities);
  const shortTermDebt = parseNumericValue(raw.shortTermDebt);
  const longTermDebt = parseNumericValue(raw.longTermDebt);

  return {
    fiscalDateEnding: raw.fiscalDateEnding,
    totalAssets,
    totalCurrentAssets,
    cashAndEquivalents: parseNumericValue(raw.cashAndCashEquivalentsAtCarryingValue),
    cashAndShortTermInvestments: parseNumericValue(raw.cashAndShortTermInvestments),
    inventory: parseNumericValue(raw.inventory),
    receivables: parseNumericValue(raw.currentNetReceivables),
    totalNonCurrentAssets: parseNumericValue(raw.totalNonCurrentAssets),
    propertyPlantEquipment: parseNumericValue(raw.propertyPlantEquipment),
    intangibleAssets: parseNumericValue(raw.intangibleAssets),
    goodwill: parseNumericValue(raw.goodwill),
    totalLiabilities,
    totalCurrentLiabilities,
    currentAccountsPayable: parseNumericValue(raw.currentAccountsPayable),
    deferredRevenue: parseNumericValue(raw.deferredRevenue),
    shortTermDebt,
    totalNonCurrentLiabilities: parseNumericValue(raw.totalNonCurrentLiabilities),
    longTermDebt,
    totalDebt: shortTermDebt + longTermDebt,
    totalShareholderEquity: parseNumericValue(raw.totalShareholderEquity),
    retainedEarnings: parseNumericValue(raw.retainedEarnings),
    commonStockSharesOutstanding: parseNumericValue(raw.commonStockSharesOutstanding),
  };
}

/**
 * Normalize cash flow data
 */
export function normalizeCashFlow(
  raw: RawCashFlow
): NormalizedCashFlow {
  const operatingCashflow = parseNumericValue(raw.operatingCashflow);
  const capitalExpenditures = parseNumericValue(raw.capitalExpenditures);

  return {
    fiscalDateEnding: raw.fiscalDateEnding,
    operatingCashflow,
    capitalExpenditures,
    freeCashFlow: operatingCashflow - capitalExpenditures,
    cashflowFromInvestment: parseNumericValue(raw.cashflowFromInvestment),
    cashflowFromFinancing: parseNumericValue(raw.cashflowFromFinancing),
    changeInCashAndCashEquivalents: parseNumericValue(raw.changeInCashAndCashEquivalents),
    dividendPayout: parseNumericValue(raw.dividendPayout),
  };
}

/**
 * Extract fiscal quarter and year from date string
 */
function extractFiscalInfo(dateString: string): { quarter: string; year: string } {
  const date = new Date(dateString);
  const year = date.getFullYear().toString();
  const month = date.getMonth() + 1;
  let quarter: string;
  
  if (month >= 1 && month <= 3) quarter = 'Q1';
  else if (month >= 4 && month <= 6) quarter = 'Q2';
  else if (month >= 7 && month <= 9) quarter = 'Q3';
  else quarter = 'Q4';
  
  return { quarter, year };
}

/**
 * Normalize quarterly reports from Alpha Vantage data
 */
export function normalizeQuarterlyData(
  incomeStatements: RawIncomeStatement[],
  balanceSheets: RawBalanceSheet[],
  cashFlows: RawCashFlow[]
): QuarterlyReport[] {
  const reports: QuarterlyReport[] = [];
  const maxLength = Math.max(
    incomeStatements.length,
    balanceSheets.length,
    cashFlows.length
  );

  for (let i = 0; i < maxLength; i++) {
    const income = incomeStatements[i];
    const balance = balanceSheets[i];
    const cashFlow = cashFlows[i];

    if (!income || !balance || !cashFlow) continue;

    const fiscalInfo = extractFiscalInfo(income.fiscalDateEnding);

    reports.push({
      fiscalDateEnding: income.fiscalDateEnding,
      fiscalQuarter: fiscalInfo.quarter,
      fiscalYear: fiscalInfo.year,
      type: 'quarterly',
      incomeStatement: normalizeIncomeStatement(income),
      balanceSheet: normalizeBalanceSheet(balance),
      cashFlow: normalizeCashFlow(cashFlow),
    });
  }

  return reports.sort((a, b) => 
    new Date(b.fiscalDateEnding).getTime() - new Date(a.fiscalDateEnding).getTime()
  );
}

/**
 * Normalize annual reports from Alpha Vantage data
 */
export function normalizeAnnualData(
  incomeStatements: RawIncomeStatement[],
  balanceSheets: RawBalanceSheet[],
  cashFlows: RawCashFlow[]
): AnnualReport[] {
  const reports: AnnualReport[] = [];
  const maxLength = Math.max(
    incomeStatements.length,
    balanceSheets.length,
    cashFlows.length
  );

  for (let i = 0; i < maxLength; i++) {
    const income = incomeStatements[i];
    const balance = balanceSheets[i];
    const cashFlow = cashFlows[i];

    if (!income || !balance || !cashFlow) continue;

    const fiscalInfo = extractFiscalInfo(income.fiscalDateEnding);

    reports.push({
      fiscalDateEnding: income.fiscalDateEnding,
      fiscalYear: fiscalInfo.year,
      incomeStatement: normalizeIncomeStatement(income),
      balanceSheet: normalizeBalanceSheet(balance),
      cashFlow: normalizeCashFlow(cashFlow),
    });
  }

  return reports.sort((a, b) => 
    new Date(b.fiscalDateEnding).getTime() - new Date(a.fiscalDateEnding).getTime()
  );
}

/**
 * Calculate growth rates for quarterly reports
 */
export function calculateGrowthRates(
  reports: QuarterlyReport[]
): GrowthRates[] {
  return reports.map((report, index) => {
    const prev = reports[index + 1] || null;
    const prevYear = reports.find(r => 
      r.fiscalQuarter === report.fiscalQuarter && 
      r.fiscalYear !== report.fiscalYear
    ) || null;

    const calcYoY = (current: number, previous: number | null): number | null => {
      if (!previous || previous === 0) return null;
      return ((current - previous) / Math.abs(previous)) * 100;
    };

    const calcQoQ = (current: number, previous: number | null): number | null => {
      if (!previous || previous === 0) return null;
      return ((current - previous) / Math.abs(previous)) * 100;
    };

    const income = report.incomeStatement;
    const cashFlow = report.cashFlow;

    return {
      revenueYoY: prevYear ? calcYoY(income.revenue, prevYear.incomeStatement.revenue) : null,
      revenueQoQ: prev ? calcQoQ(income.revenue, prev.incomeStatement.revenue) : null,
      netIncomeYoY: prevYear ? calcYoY(income.netIncome, prevYear.incomeStatement.netIncome) : null,
      netIncomeQoQ: prev ? calcQoQ(income.netIncome, prev.incomeStatement.netIncome) : null,
      operatingIncomeYoY: prevYear ? calcYoY(income.operatingIncome, prevYear.incomeStatement.operatingIncome) : null,
      operatingIncomeQoQ: prev ? calcQoQ(income.operatingIncome, prev.incomeStatement.operatingIncome) : null,
      grossProfitYoY: prevYear ? calcYoY(income.grossProfit, prevYear.incomeStatement.grossProfit) : null,
      grossProfitQoQ: prev ? calcQoQ(income.grossProfit, prev.incomeStatement.grossProfit) : null,
      epsYoY: prevYear ? calcYoY(income.earningsPerShare, prevYear.incomeStatement.earningsPerShare) : null,
      epsQoQ: prev ? calcQoQ(income.earningsPerShare, prev.incomeStatement.earningsPerShare) : null,
      freeCashFlowYoY: prevYear && prevYear.cashFlow.freeCashFlow ? 
        calcYoY(cashFlow.freeCashFlow, prevYear.cashFlow.freeCashFlow) : null,
      freeCashFlowQoQ: prev && prev.cashFlow.freeCashFlow ? 
        calcQoQ(cashFlow.freeCashFlow, prev.cashFlow.freeCashFlow) : null,
    };
  });
}

/**
 * Calculate financial health metrics
 */
export function calculateFinancialHealth(
  overview: RawCompanyOverview,
  latestQuarter: QuarterlyReport,
  annualReports: AnnualReport[]
): FinancialHealthMetrics {
  const latestAnnual = annualReports[0];
  const income = latestQuarter.incomeStatement;
  const balance = latestQuarter.balanceSheet;
  const cashFlow = latestQuarter.cashFlow;
  const annualIncome = latestAnnual?.incomeStatement;
  
  const marketCap = parseNumericValue(overview.MarketCapitalization);
  const shares = parseNumericValue(overview.SharesOutstanding);
  const currentPrice = marketCap / shares || 0;
  const totalDebt = balance.totalDebt;
  const totalEquity = balance.totalShareholderEquity;

  // Calculate return on invested capital (approximation)
  const roic = annualIncome && (balance.totalAssets - balance.totalCurrentLiabilities) > 0 ?
    (annualIncome.netIncome / (balance.totalAssets - balance.totalCurrentLiabilities)) * 100 : null;

  // Liquidity ratios
  const currentRatio = balance.totalCurrentLiabilities > 0 ?
    balance.totalCurrentAssets / balance.totalCurrentLiabilities : null;
  const quickRatio = balance.totalCurrentLiabilities > 0 ?
    (balance.totalCurrentAssets - balance.inventory) / balance.totalCurrentLiabilities : null;
  const cashRatio = balance.totalCurrentLiabilities > 0 ?
    balance.cashAndEquivalents / balance.totalCurrentLiabilities : null;

  // Leverage ratios
  const debtToAssets = balance.totalAssets > 0 ? totalDebt / balance.totalAssets : null;
  const debtToEquity = totalEquity > 0 ? totalDebt / totalEquity : null;
  const interestCoverage = income.interestExpense > 0 ?
    income.operatingIncome / income.interestExpense : null;
  const equityRatio = balance.totalAssets > 0 ? totalEquity / balance.totalAssets : null;

  // Efficiency ratios
  const assetTurnover = balance.totalAssets > 0 && annualIncome ?
    annualIncome.revenue / balance.totalAssets : null;
  const inventoryTurnover = balance.inventory > 0 && annualIncome ?
    annualIncome.revenue / balance.inventory : null;
  const receivablesTurnover = balance.receivables > 0 && annualIncome ?
    annualIncome.revenue / balance.receivables : null;
  const daysSalesOutstanding = receivablesTurnover && receivablesTurnover > 0 ?
    365 / receivablesTurnover : null;
  const daysInventory = inventoryTurnover && inventoryTurnover > 0 ?
    365 / inventoryTurnover : null;

  // Cash flow ratios
  const operatingCashFlowMargin = income.revenue > 0 ?
    (cashFlow.operatingCashflow / income.revenue) * 100 : null;
  const freeCashFlowMargin = income.revenue > 0 ?
    (cashFlow.freeCashFlow / income.revenue) * 100 : null;
  const freeCashFlowYield = marketCap > 0 ?
    (cashFlow.freeCashFlow / marketCap) * 100 : null;

  return {
    grossMargin: income.grossMargin,
    operatingMargin: income.operatingMargin,
    netMargin: income.netMargin,
    ebitdaMargin: income.ebitdaMargin,
    returnOnEquity: parseNumericValue(overview.ReturnOnEquityTTM),
    returnOnAssets: parseNumericValue(overview.ReturnOnAssetsTTM),
    returnOnInvestedCapital: roic,
    returnOnCapitalEmployed: null, // Would need additional data
    currentRatio,
    quickRatio,
    cashRatio,
    debtToEquity,
    debtToAssets,
    interestCoverageRatio: interestCoverage,
    equityRatio,
    assetTurnover,
    inventoryTurnover,
    receivablesTurnover,
    daysSalesOutstanding,
    daysInventory,
    priceToEarnings: parseNumericValue(overview.PERatio),
    priceToSales: parseNumericValue(overview.PriceToSalesRatioTTM),
    priceToBook: parseNumericValue(overview.PriceToBookRatio),
    enterpriseValueToRevenue: parseNumericValue(overview.EVToRevenue),
    enterpriseValueToEbitda: parseNumericValue(overview.EVToEBITDA),
    pegRatio: parseNumericValue(overview.PEGRatio),
    operatingCashFlowMargin,
    freeCashFlowMargin,
    freeCashFlowYield,
  };
}

/**
 * Calculate Tesla-specific metrics
 */
export function calculateTeslaMetrics(
  overview: RawCompanyOverview,
  latestQuarter: QuarterlyReport,
  annualReports: AnnualReport[]
): TeslaSpecificMetrics {
  const latestAnnual = annualReports[0];
  const income = latestQuarter.incomeStatement;
  const balance = latestQuarter.balanceSheet;
  const cashFlow = latestQuarter.cashFlow;
  const prevQuarter = latestQuarter; // Would need actual previous quarter data
  
  const shares = parseNumericValue(overview.SharesOutstanding);
  const marketCap = parseNumericValue(overview.MarketCapitalization);

  // Revenue per share
  const revenuePerShare = shares > 0 ? income.revenue / shares : 0;
  
  // Free cash flow per share
  const freeCashFlowPerShare = shares > 0 ? cashFlow.freeCashFlow / shares : null;

  // Capex as % of revenue
  const capexAsPercentOfRevenue = income.revenue > 0 ?
    (cashFlow.capitalExpenditures / income.revenue) * 100 : null;

  // R&D as % of revenue
  const rdAsPercentOfRevenue = income.rdAsPercentOfRevenue;

  // Working capital
  const workingCapital = balance.totalCurrentAssets - balance.totalCurrentLiabilities;
  const workingCapitalRatio = balance.totalCurrentAssets > 0 ?
    balance.totalCurrentAssets / balance.totalCurrentLiabilities : null;

  // Cash metrics
  const cashToMarketCap = marketCap > 0 ? (balance.cashAndEquivalents / marketCap) * 100 : null;
  const cashToDebt = balance.totalDebt > 0 ? balance.cashAndEquivalents / balance.totalDebt : null;

  // Revenue growth trend
  const revenueGrowth = latestAnnual && annualReports[1] ?
    ((latestAnnual.incomeStatement.revenue - annualReports[1].incomeStatement.revenue) / 
     Math.abs(annualReports[1].incomeStatement.revenue)) * 100 : null;
  
  let revenueGrowthTrend: 'increasing' | 'decreasing' | 'stable' | null = null;
  if (revenueGrowth !== null) {
    if (revenueGrowth > 5) revenueGrowthTrend = 'increasing';
    else if (revenueGrowth < -5) revenueGrowthTrend = 'decreasing';
    else revenueGrowthTrend = 'stable';
  }

  // Margin expansion
  const marginExpansion = latestAnnual && annualReports[1] ?
    latestAnnual.incomeStatement.netMargin - annualReports[1].incomeStatement.netMargin : null;

  return {
    revenuePerShare,
    freeCashFlowPerShare,
    capexAsPercentOfRevenue,
    rdAsPercentOfRevenue,
    operatingLeverage: null, // Would need multiple periods
    revenueGrowthTrend,
    marginExpansion,
    assetTurnoverRatio: balance.totalAssets > 0 && latestAnnual ?
      latestAnnual.incomeStatement.revenue / balance.totalAssets : null,
    capitalEfficiency: null, // Would need trend data
    workingCapital,
    workingCapitalRatio,
    inventoryDays: balance.inventory > 0 && latestAnnual ?
      (balance.inventory / (latestAnnual.incomeStatement.costOfRevenue / 365)) : null,
    receivablesDays: balance.receivables > 0 && latestAnnual ?
      (balance.receivables / (latestAnnual.incomeStatement.revenue / 365)) : null,
    cashToMarketCap,
    cashToDebt,
  };
}

/**
 * Build comprehensive Tesla fundamental data structure
 */
export function buildTeslaFundamentalData(
  overview: RawCompanyOverview,
  quarterlyIncome: RawIncomeStatement[],
  quarterlyBalance: RawBalanceSheet[],
  quarterlyCashFlow: RawCashFlow[],
  annualIncome: RawIncomeStatement[],
  annualBalance: RawBalanceSheet[],
  annualCashFlow: RawCashFlow[]
): TeslaFundamentalData {
  const quarterlyReports = normalizeQuarterlyData(
    quarterlyIncome,
    quarterlyBalance,
    quarterlyCashFlow
  );
  
  const annualReports = normalizeAnnualData(
    annualIncome,
    annualBalance,
    annualCashFlow
  );

  const latestQuarter = quarterlyReports[0];
  const quarterlyGrowthRates = calculateGrowthRates(quarterlyReports);
  const annualGrowthRates = calculateGrowthRates(
    annualReports.map(ar => ({
      ...ar,
      fiscalDateEnding: ar.fiscalDateEnding,
      fiscalQuarter: 'Annual',
      fiscalYear: ar.fiscalYear,
      type: 'annual' as const,
      incomeStatement: ar.incomeStatement,
      balanceSheet: ar.balanceSheet,
      cashFlow: ar.cashFlow,
    }))
  );

  return {
    companyOverview: overview,
    quarterlyReports,
    annualReports,
    financialHealth: calculateFinancialHealth(overview, latestQuarter, annualReports),
    teslaMetrics: calculateTeslaMetrics(overview, latestQuarter, annualReports),
    growthRates: {
      quarterly: quarterlyGrowthRates,
      annual: annualGrowthRates,
    },
    lastUpdated: new Date(),
    dataSource: 'Alpha Vantage',
  };
}

/**
 * Build trend chart data from reports
 */
export function buildTrendChartData(
  quarterlyReports: QuarterlyReport[],
  annualReports: AnnualReport[]
): FinancialTrendData {
  const quarterlyData: FinancialTrendData = {
    revenue: quarterlyReports.map(r => ({
      date: r.fiscalDateEnding,
      value: r.incomeStatement.revenue,
      period: 'quarterly',
    })),
    netIncome: quarterlyReports.map(r => ({
      date: r.fiscalDateEnding,
      value: r.incomeStatement.netIncome,
      period: 'quarterly',
    })),
    operatingIncome: quarterlyReports.map(r => ({
      date: r.fiscalDateEnding,
      value: r.incomeStatement.operatingIncome,
      period: 'quarterly',
    })),
    freeCashFlow: quarterlyReports.map(r => ({
      date: r.fiscalDateEnding,
      value: r.cashFlow.freeCashFlow,
      period: 'quarterly',
    })),
    grossMargin: quarterlyReports.map(r => ({
      date: r.fiscalDateEnding,
      value: r.incomeStatement.grossMargin,
      period: 'quarterly',
    })),
    operatingMargin: quarterlyReports.map(r => ({
      date: r.fiscalDateEnding,
      value: r.incomeStatement.operatingMargin,
      period: 'quarterly',
    })),
    netMargin: quarterlyReports.map(r => ({
      date: r.fiscalDateEnding,
      value: r.incomeStatement.netMargin,
      period: 'quarterly',
    })),
  };

  return quarterlyData;
}

