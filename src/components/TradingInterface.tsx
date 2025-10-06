'use client';

import React, { useState } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { Header } from './layout/Header';
import { ChatDrawer } from './ChatDrawer';
import { MobileNavigation } from './MobileNavigation';
import { DashboardTab } from './tabs/DashboardTab/DashboardTab';
import { ChatbotTab } from './tabs/ChatbotTab/ChatbotTab';
import { AnalysisTab } from './tabs/AnalysisTab/AnalysisTab';
import { PortfolioTab } from './tabs/PortfolioTab/PortfolioTab';

type TabType = 'dashboard' | 'chatbot' | 'analysis' | 'portfolio';

export const TradingInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleAskAI = () => {
    setActiveTab('chatbot');
    setIsChatOpen(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'chatbot':
        return <ChatbotTab />;
      case 'analysis':
        return <AnalysisTab />;
      case 'portfolio':
        return <PortfolioTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <Header onAskAI={handleAskAI} />

        {/* Navigation */}
        <nav className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center space-x-12">
              {[
                {
                  id: 'dashboard',
                  name: 'Dashboard',
                  description: 'Overview',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                  )
                },
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
                  id: 'analysis',
                  name: 'Analysis',
                  description: 'Technical & Sentiment',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )
                },
                {
                  id: 'portfolio',
                  name: 'Portfolio',
                  description: 'Holdings & Performance',
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
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
                    <div className="text-xs text-text-muted hidden sm:block">{tab.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
          {renderTabContent()}
        </main>

        {/* Chat Drawer */}
        <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        
        {/* Mobile Navigation */}
        <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </ThemeProvider>
  );
};