'use client';

import React, { useState } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { AIQueryProvider, useAIQuery } from '../context/AIQueryContext';
import { Header } from './layout/Header';
import { MobileNavigation } from './MobileNavigation';
import { ChatbotTab } from './tabs/ChatbotTab/ChatbotTab';
import { AnalystTab } from './tabs/AnalystTab/AnalystTab';
import { ReportTab } from './tabs/ReportTab/ReportTab';

type TabType = 'chatbot' | 'analyst' | 'report';

const TradingInterfaceContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('chatbot');
  const { setQuery, setAutoSend } = useAIQuery();

  const handleAskAI = (context?: string, shouldAutoSend: boolean = false) => {
    // Set the query in context
    if (context) {
      setQuery(context);
      setAutoSend(shouldAutoSend);
    }
    
    // Switch to chatbot tab (removed duplicate ChatDrawer)
    setActiveTab('chatbot');
    
    // Scroll to top smoothly
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chatbot':
        return <ChatbotTab />;
      case 'analyst':
        return <AnalystTab onAskAI={handleAskAI} />;
      case 'report':
        return <ReportTab onAskAI={handleAskAI} />;
      default:
        return <ChatbotTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header onAskAI={() => handleAskAI()} />

        {/* Desktop Navigation */}
        <nav className="hidden md:block bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center space-x-12">
              {[
                {
                  id: 'chatbot',
                  name: 'Assistant',
                  description: 'AI Chat',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )
                },
                {
                  id: 'analyst',
                  name: 'Analysis',
                  description: 'Technical & Sentiment & Fundamental',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )
                },
                {
                  id: 'report',
                  name: 'Report',
                  description: 'Comprehensive Analysis',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )
                }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`
                    flex flex-col items-center space-y-1 py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200 min-w-0
                    ${activeTab === tab.id
                      ? 'border-tesla-red text-tesla-red'
                      : 'border-transparent text-text-muted hover:text-foreground hover:border-border'
                    }
                  `}
                >
                  {tab.icon}
                  <div className="text-center">
                    <div className="font-medium text-sm">{tab.name}</div>
                    <div className="text-xs text-text-muted">{tab.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Mobile Navigation Header */}
        <div className="md:hidden bg-card border-b border-border">
          <div className="px-4 py-3">
            <div className="flex items-center justify-center">
              <h2 className="text-lg font-semibold text-foreground capitalize">{activeTab}</h2>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-6 pb-20 md:pb-6">
          {renderTabContent()}
        </main>
        
      {/* Mobile Navigation */}
      <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export const TradingInterface: React.FC = () => {
  return (
    <ThemeProvider>
      <AIQueryProvider>
        <TradingInterfaceContent />
      </AIQueryProvider>
    </ThemeProvider>
  );
};