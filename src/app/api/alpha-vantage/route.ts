import { NextRequest, NextResponse } from 'next/server';
import { getAlphaVantageService } from '../../../services/alphaVantageService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  try {
    const function_type = searchParams.get('function');
    const symbol = searchParams.get('symbol') || 'TSLA';
    const interval = searchParams.get('interval') || 'daily';
    const time_period = searchParams.get('time_period') || '14';

    if (!function_type) {
      return NextResponse.json(
        { error: 'Function type is required' },
        { status: 400 }
      );
    }

    const alphaVantage = getAlphaVantageService();
    let data;

    switch (function_type) {
      case 'rsi':
        data = await alphaVantage.getRSI(symbol, interval as any, parseInt(time_period));
        break;
      case 'macd':
        data = await alphaVantage.getMACD(symbol, interval as any);
        break;
      case 'sma':
        data = await alphaVantage.getSMA(symbol, interval as any, parseInt(time_period));
        break;
      case 'ema':
        data = await alphaVantage.getEMA(symbol, interval as any, parseInt(time_period));
        break;
      case 'bbands':
        data = await alphaVantage.getBollingerBands(symbol, interval as any, parseInt(time_period));
        break;
      case 'daily':
        data = await alphaVantage.getDailyData(symbol);
        break;
      case 'intraday':
        data = await alphaVantage.getIntradayData(symbol, interval as any);
        break;
      case 'overview':
        data = await alphaVantage.getCompanyOverview(symbol);
        break;
      case 'income':
        data = await alphaVantage.getIncomeStatement(symbol);
        break;
      case 'balance':
        data = await alphaVantage.getBalanceSheet(symbol);
        break;
      case 'cashflow':
        data = await alphaVantage.getCashFlow(symbol);
        break;
      case 'earnings':
        data = await alphaVantage.getEarnings(symbol);
        break;
      case 'quote':
        data = await alphaVantage.getQuote(symbol);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid function type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data,
      function: function_type,
      symbol,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Alpha Vantage API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data',
        function: searchParams.get('function'),
        symbol: searchParams.get('symbol') || 'TSLA'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
