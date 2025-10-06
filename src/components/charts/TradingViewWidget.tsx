/**
 * TradingView Widget Chart Component
 * 
 * Uses TradingView's free widget for professional financial charts
 * This is a simpler and more reliable approach than the full charting library
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';

interface TradingViewWidgetProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
  autosize?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol = 'TSLA',
  interval = '1D',
  theme = 'light',
  autosize = true,
  width = 800,
  height = 600,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const widgetId = useRef<string>(`tradingview_${Date.now()}`);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const loadTradingViewWidget = () => {
      try {
        setIsLoading(true);
        setError(null);

          // Clear previous content and ensure container exists
          if (!container) return;
          
          container.innerHTML = '';

          // Create a div with the specific ID that TradingView expects
          const widgetContainer = document.createElement('div');
          widgetContainer.id = widgetId.current;
          widgetContainer.style.width = '100%';
          widgetContainer.style.height = autosize ? '600px' : `${height}px`;
          container.appendChild(widgetContainer);

        // Create TradingView widget script
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
          autosize: autosize,
          symbol: symbol,
          interval: interval,
          timezone: 'America/New_York',
          theme: theme,
          style: '1',
          locale: 'en',
          toolbar_bg: theme === 'dark' ? '#1e1e1e' : '#ffffff',
          enable_publishing: false,
          allow_symbol_change: true,
          details: true,
          hotlist: true,
          calendar: true,
          studies: [
            'MACD@tv-basicstudies',
            'RSI@tv-basicstudies',
            'BB@tv-basicstudies',
            'SMA@tv-basicstudies',
            'EMA@tv-basicstudies'
          ],
          container_id: widgetId.current,
          disabled_features: [
            'use_localstorage_for_settings',
            'volume_force_overlay',
            'create_volume_indicator_by_default'
          ],
          enabled_features: [
            'side_toolbar_in_fullscreen_mode',
            'header_in_fullscreen_mode'
          ],
          overrides: {
            'paneProperties.background': theme === 'dark' ? '#1e1e1e' : '#ffffff',
            'paneProperties.vertGridProperties.color': theme === 'dark' ? '#2a2a2a' : '#e1e1e1',
            'paneProperties.horzGridProperties.color': theme === 'dark' ? '#2a2a2a' : '#e1e1e1',
            'symbolWatermarkProperties.transparency': 90,
            'scalesProperties.textColor': theme === 'dark' ? '#ffffff' : '#000000'
          },
          studies_overrides: {
            'volume.volume.color.0': '#00bcd4',
            'volume.volume.color.1': '#ff9800',
            'volume.volume.transparency': 70
          }
        });

        // Append script to the widget container
        widgetContainer.appendChild(script);

        // Set loading to false after a delay
        setTimeout(() => {
          setIsLoading(false);
        }, 3000);

      } catch (err) {
        console.error('Error loading TradingView widget:', err);
        setError(err instanceof Error ? err.message : 'Failed to load TradingView widget');
        setIsLoading(false);
      }
    };

    loadTradingViewWidget();

    // Cleanup function
    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [symbol, interval, theme, autosize, width, height]);

  return (
    <div className={`relative ${className}`}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Loading TradingView Chart...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20 z-10 rounded-lg">
          <div className="text-center p-4">
            <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Chart container */}
      <div 
        ref={containerRef} 
        className={`w-full ${autosize ? 'h-[600px]' : `h-[${height}px]`} bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700`}
        style={{ minHeight: autosize ? '600px' : `${height}px` }}
      />

      {/* Chart info */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        TradingView Chart - {symbol} ({interval}) • Professional financial data
      </div>
    </div>
  );
};
