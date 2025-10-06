'use client';

import React, { useState } from 'react';
import { SentimentTab } from '../SentimentTab/SentimentTab';
import { TechnicalAnalysisTab } from '../TechnicalAnalysisTab/TechnicalAnalysisTab';

type AnalysisSubTab = 'technical' | 'sentiment';

export const AnalysisTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<AnalysisSubTab>('technical');

  return (
    <div className="space-y-6">
      {/* Sub-navigation for Analysis */}
      <div className="flex space-x-1 bg-card p-1 rounded-lg border border-border">
        <button
          onClick={() => setActiveSubTab('technical')}
          className={`
            flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium text-sm transition-colors duration-200
            ${activeSubTab === 'technical'
              ? 'bg-tesla-red text-white shadow-sm'
              : 'text-text-muted hover:text-foreground hover:bg-card/50'
            }
          `}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Technical</span>
        </button>
        <button
          onClick={() => setActiveSubTab('sentiment')}
          className={`
            flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium text-sm transition-colors duration-200
            ${activeSubTab === 'sentiment'
              ? 'bg-tesla-red text-white shadow-sm'
              : 'text-text-muted hover:text-foreground hover:bg-card/50'
            }
          `}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2z" />
          </svg>
          <span>Sentiment</span>
        </button>
      </div>

      {/* Render the appropriate sub-tab content */}
      {activeSubTab === 'technical' ? <TechnicalAnalysisTab /> : <SentimentTab />}
    </div>
  );
};
