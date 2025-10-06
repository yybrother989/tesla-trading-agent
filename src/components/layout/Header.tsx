'use client';

import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';

interface HeaderProps {
  onAskAI: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAskAI }) => {
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-tesla-red rounded-lg">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Tesla Trading Agent</h1>
              <p className="text-sm text-text-muted">AI-Powered Trading Assistant</p>
            </div>
          </div>

          {/* Global Search */}
          <div className="flex-1 max-w-md mx-8">
            <Input
              type="search"
              placeholder="Search symbols, news, or analysis..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full"
              icon={
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Ask AI Button */}
            <Button 
              onClick={onAskAI}
              variant="primary"
              size="sm"
              className="bg-tesla-red hover:bg-red-600"
            >
              Ask AI
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <button 
              className="relative p-2 text-text-muted hover:text-foreground transition-colors"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-tesla-red rounded-full"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-tesla-blue rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">U</span>
              </div>
              <span className="text-sm text-foreground font-medium">Demo User</span>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          {/* Top Row */}
          <div className="flex justify-between items-center h-14 px-2">
            {/* Logo and Title */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-tesla-red rounded-lg">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Tesla Trading</h1>
                <p className="text-xs text-text-muted">AI Assistant</p>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              <Button 
                onClick={onAskAI}
                variant="primary"
                size="sm"
                className="bg-tesla-red hover:bg-red-600 px-3 py-1.5 text-xs"
              >
                Ask AI
              </Button>
              <ThemeToggle />
              <button 
                className="relative p-1.5 text-text-muted hover:text-foreground transition-colors"
                aria-label="Notifications"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-tesla-red rounded-full"></span>
              </button>
            </div>
          </div>

          {/* Search Row */}
          <div className="px-2 pb-2">
            <Input
              type="search"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full"
              icon={
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
        </div>
      </div>
    </header>
  );
};
