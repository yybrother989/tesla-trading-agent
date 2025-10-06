/**
 * Alpha Vantage API Service
 * Handles all Alpha Vantage API calls with rate limiting and caching
 * Based on: https://www.alphavantage.co/documentation/
 */

interface AlphaVantageResponse {
  'Meta Data'?: {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Interval'?: string;
    '5. Output Size': string;
    '6. Time Zone': string;
  };
  'Time Series (Intraday)'?: Record<string, {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. volume': string;
  }>;
  'Time Series (Daily)'?: Record<string, {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. volume': string;
  }>;
  'Technical Analysis: RSI'?: Record<string, {
    'RSI': string;
  }>;
  'Technical Analysis: MACD'?: Record<string, {
    'MACD': string;
    'MACD_Signal': string;
    'MACD_Hist': string;
  }>;
  'Technical Analysis: SMA'?: Record<string, {
    'SMA': string;
  }>;
  'Technical Analysis: EMA'?: Record<string, {
    'EMA': string;
  }>;
  'Technical Analysis: BBANDS'?: Record<string, {
    'Real Upper Band': string;
    'Real Middle Band': string;
    'Real Lower Band': string;
  }>;
  'Note'?: string;
  'Error Message'?: string;
}

interface CompanyOverview {
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

interface IncomeStatement {
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

interface BalanceSheet {
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

interface CashFlow {
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

interface EarningsData {
  fiscalDateEnding: string;
  reportedDate: string;
  reportedEPS: string;
  estimatedEPS: string;
  surprise: string;
  surprisePercentage: string;
}

class AlphaVantageService {
  private apiKey: string;
  private baseUrl = 'https://www.alphavantage.co/query';
  private rateLimitDelay = 12000; // 12 seconds for free tier (5 calls/min)
  private lastCallTime = 0;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Rate limiting for Alpha Vantage API
   * Free tier: 5 calls per minute
   * Premium: 75 calls per minute
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    
    if (timeSinceLastCall < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastCall;
      console.log(`Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastCallTime = Date.now();
  }

  /**
   * Check cache for existing data
   */
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Cache data with timestamp
   */
  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Make API request with error handling
   */
  private async makeRequest(params: Record<string, string>): Promise<any> {
    await this.rateLimit();
    
    const url = new URL(this.baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    url.searchParams.append('apikey', this.apiKey);

    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }
      
      if (data['Note']) {
        throw new Error(data['Note']);
      }

      return data;
    } catch (error) {
      console.error('Alpha Vantage API error:', error);
      throw error;
    }
  }

  /**
   * Get intraday time series data
   * https://www.alphavantage.co/documentation/#intraday
   */
  async getIntradayData(symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min'): Promise<AlphaVantageResponse> {
    const cacheKey = `intraday_${symbol}_${interval}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const params = {
      function: 'TIME_SERIES_INTRADAY',
      symbol: symbol,
      interval: interval,
      outputsize: 'compact'
    };

    const data = await this.makeRequest(params);
    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Get daily time series data
   * https://www.alphavantage.co/documentation/#daily
   */
  async getDailyData(symbol: string): Promise<AlphaVantageResponse> {
    const cacheKey = `daily_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const params = {
      function: 'TIME_SERIES_DAILY',
      symbol: symbol,
      outputsize: 'compact'
    };

    const data = await this.makeRequest(params);
    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Get RSI technical indicator
   * https://www.alphavantage.co/documentation/#rsi
   */
  async getRSI(symbol: string, interval: 'daily' | 'weekly' | 'monthly' = 'daily', timePeriod: number = 14): Promise<AlphaVantageResponse> {
    const cacheKey = `rsi_${symbol}_${interval}_${timePeriod}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const params = {
      function: 'RSI',
      symbol: symbol,
      interval: interval,
      time_period: timePeriod.toString(),
      series_type: 'close'
    };

    const data = await this.makeRequest(params);
    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Get MACD technical indicator
   * https://www.alphavantage.co/documentation/#macd
   */
  async getMACD(symbol: string, interval: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<AlphaVantageResponse> {
    const cacheKey = `macd_${symbol}_${interval}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const params = {
      function: 'MACD',
      symbol: symbol,
      interval: interval,
      series_type: 'close'
    };

    const data = await this.makeRequest(params);
    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Get Simple Moving Average
   * https://www.alphavantage.co/documentation/#sma
   */
  async getSMA(symbol: string, interval: 'daily' | 'weekly' | 'monthly' = 'daily', timePeriod: number = 50): Promise<AlphaVantageResponse> {
    const cacheKey = `sma_${symbol}_${interval}_${timePeriod}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const params = {
      function: 'SMA',
      symbol: symbol,
      interval: interval,
      time_period: timePeriod.toString(),
      series_type: 'close'
    };

    const data = await this.makeRequest(params);
    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Get Exponential Moving Average
   * https://www.alphavantage.co/documentation/#ema
   */
  async getEMA(symbol: string, interval: 'daily' | 'weekly' | 'monthly' = 'daily', timePeriod: number = 50): Promise<AlphaVantageResponse> {
    const cacheKey = `ema_${symbol}_${interval}_${timePeriod}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const params = {
      function: 'EMA',
      symbol: symbol,
      interval: interval,
      time_period: timePeriod.toString(),
      series_type: 'close'
    };

    const data = await this.makeRequest(params);
    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Get Bollinger Bands
   * https://www.alphavantage.co/documentation/#bbands
   */
  async getBollingerBands(symbol: string, interval: 'daily' | 'weekly' | 'monthly' = 'daily', timePeriod: number = 20): Promise<AlphaVantageResponse> {
    const cacheKey = `bbands_${symbol}_${interval}_${timePeriod}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const params = {
      function: 'BBANDS',
      symbol: symbol,
      interval: interval,
      time_period: timePeriod.toString(),
      series_type: 'close'
    };

    const data = await this.makeRequest(params);
    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Get company overview
   * https://www.alphavantage.co/documentation/#company-overview
   */
  async getCompanyOverview(symbol: string): Promise<CompanyOverview> {
    const cacheKey = `overview_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const params = {
      function: 'OVERVIEW',
      symbol: symbol
    };

    const data = await this.makeRequest(params);
    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Get income statement
   * https://www.alphavantage.co/documentation/#income-statement
   */
  async getIncomeStatement(symbol: string): Promise<{ annualReports: IncomeStatement[]; quarterlyReports: IncomeStatement[] }> {
    const cacheKey = `income_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const params = {
      function: 'INCOME_STATEMENT',
      symbol: symbol
    };

    const data = await this.makeRequest(params);
    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Get balance sheet
   * https://www.alphavantage.co/documentation/#balance-sheet
   */
  async getBalanceSheet(symbol: string): Promise<{ annualReports: BalanceSheet[]; quarterlyReports: BalanceSheet[] }> {
    const cacheKey = `balance_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const params = {
      function: 'BALANCE_SHEET',
      symbol: symbol
    };

    const data = await this.makeRequest(params);
    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Get cash flow statement
   * https://www.alphavantage.co/documentation/#cash-flow
   */
  async getCashFlow(symbol: string): Promise<{ annualReports: CashFlow[]; quarterlyReports: CashFlow[] }> {
    const cacheKey = `cashflow_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const params = {
      function: 'CASH_FLOW',
      symbol: symbol
    };

    const data = await this.makeRequest(params);
    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Get earnings data
   * https://www.alphavantage.co/documentation/#earnings
   */
  async getEarnings(symbol: string): Promise<{ annualEarnings: EarningsData[]; quarterlyEarnings: EarningsData[] }> {
    const cacheKey = `earnings_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const params = {
      function: 'EARNINGS',
      symbol: symbol
    };

    const data = await this.makeRequest(params);
    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Get current quote
   * https://www.alphavantage.co/documentation/#quote-endpoint
   */
  async getQuote(symbol: string): Promise<any> {
    const cacheKey = `quote_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const params = {
      function: 'GLOBAL_QUOTE',
      symbol: symbol
    };

    const data = await this.makeRequest(params);
    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
let alphaVantageService: AlphaVantageService | null = null;

export const getAlphaVantageService = (): AlphaVantageService => {
  if (!alphaVantageService) {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY || process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      throw new Error('Alpha Vantage API key not found. Please set ALPHA_VANTAGE_API_KEY in your environment variables.');
    }
    alphaVantageService = new AlphaVantageService(apiKey);
  }
  return alphaVantageService;
};

export { AlphaVantageService };
export type { 
  AlphaVantageResponse, 
  CompanyOverview, 
  IncomeStatement, 
  BalanceSheet, 
  CashFlow, 
  EarningsData 
};
