/**
 * Client-side Alpha Vantage Service
 * This service makes API calls to our Next.js API routes instead of directly calling Alpha Vantage
 * This keeps API keys secure on the server-side
 */

interface AlphaVantageResponse {
  success: boolean;
  data?: any;
  error?: string;
  function?: string;
  symbol?: string;
  timestamp?: string;
}

class ClientAlphaVantageService {
  private baseUrl = '/api/alpha-vantage';

  /**
   * Make API request to our server-side Alpha Vantage proxy
   */
  private async makeRequest(params: Record<string, string>): Promise<AlphaVantageResponse> {
    try {
      const url = new URL(this.baseUrl, window.location.origin);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Client Alpha Vantage API error:', error);
      throw error;
    }
  }

  /**
   * Get RSI technical indicator
   */
  async getRSI(symbol: string, interval: 'daily' | 'weekly' | 'monthly' = 'daily', timePeriod: number = 14): Promise<any> {
    const response = await this.makeRequest({
      function: 'rsi',
      symbol: symbol,
      interval: interval,
      time_period: timePeriod.toString()
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to get RSI data');
    }

    return response.data;
  }

  /**
   * Get MACD technical indicator
   */
  async getMACD(symbol: string, interval: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<any> {
    const response = await this.makeRequest({
      function: 'macd',
      symbol: symbol,
      interval: interval
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to get MACD data');
    }

    return response.data;
  }

  /**
   * Get Simple Moving Average
   */
  async getSMA(symbol: string, interval: 'daily' | 'weekly' | 'monthly' = 'daily', timePeriod: number = 50): Promise<any> {
    const response = await this.makeRequest({
      function: 'sma',
      symbol: symbol,
      interval: interval,
      time_period: timePeriod.toString()
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to get SMA data');
    }

    return response.data;
  }

  /**
   * Get Exponential Moving Average
   */
  async getEMA(symbol: string, interval: 'daily' | 'weekly' | 'monthly' = 'daily', timePeriod: number = 50): Promise<any> {
    const response = await this.makeRequest({
      function: 'ema',
      symbol: symbol,
      interval: interval,
      time_period: timePeriod.toString()
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to get EMA data');
    }

    return response.data;
  }

  /**
   * Get Bollinger Bands
   */
  async getBollingerBands(symbol: string, interval: 'daily' | 'weekly' | 'monthly' = 'daily', timePeriod: number = 20): Promise<any> {
    const response = await this.makeRequest({
      function: 'bbands',
      symbol: symbol,
      interval: interval,
      time_period: timePeriod.toString()
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to get Bollinger Bands data');
    }

    return response.data;
  }

  /**
   * Get daily time series data
   */
  async getDailyData(symbol: string): Promise<any> {
    const response = await this.makeRequest({
      function: 'daily',
      symbol: symbol
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to get daily data');
    }

    return response.data;
  }

  /**
   * Get intraday time series data
   */
  async getIntradayData(symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min'): Promise<any> {
    const response = await this.makeRequest({
      function: 'intraday',
      symbol: symbol,
      interval: interval
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to get intraday data');
    }

    return response.data;
  }

  /**
   * Get company overview
   */
  async getCompanyOverview(symbol: string): Promise<any> {
    const response = await this.makeRequest({
      function: 'overview',
      symbol: symbol
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to get company overview');
    }

    return response.data;
  }

  /**
   * Get income statement
   */
  async getIncomeStatement(symbol: string): Promise<any> {
    const response = await this.makeRequest({
      function: 'income',
      symbol: symbol
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to get income statement');
    }

    return response.data;
  }

  /**
   * Get balance sheet
   */
  async getBalanceSheet(symbol: string): Promise<any> {
    const response = await this.makeRequest({
      function: 'balance',
      symbol: symbol
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to get balance sheet');
    }

    return response.data;
  }

  /**
   * Get cash flow statement
   */
  async getCashFlow(symbol: string): Promise<any> {
    const response = await this.makeRequest({
      function: 'cashflow',
      symbol: symbol
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to get cash flow');
    }

    return response.data;
  }

  /**
   * Get earnings data
   */
  async getEarnings(symbol: string): Promise<any> {
    const response = await this.makeRequest({
      function: 'earnings',
      symbol: symbol
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to get earnings data');
    }

    return response.data;
  }

  /**
   * Get current quote
   */
  async getQuote(symbol: string): Promise<any> {
    const response = await this.makeRequest({
      function: 'quote',
      symbol: symbol
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to get quote');
    }

    return response.data;
  }
}

// Export singleton instance
let clientAlphaVantageService: ClientAlphaVantageService | null = null;

export const getClientAlphaVantageService = (): ClientAlphaVantageService => {
  if (!clientAlphaVantageService) {
    clientAlphaVantageService = new ClientAlphaVantageService();
  }
  return clientAlphaVantageService;
};

export { ClientAlphaVantageService };
