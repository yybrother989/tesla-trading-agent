'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AIQueryContextType {
  query: string | null;
  setQuery: (query: string | null) => void;
  clearQuery: () => void;
  autoSend: boolean;
  setAutoSend: (autoSend: boolean) => void;
}

const AIQueryContext = createContext<AIQueryContextType | undefined>(undefined);

export const useAIQuery = () => {
  const context = useContext(AIQueryContext);
  if (!context) {
    throw new Error('useAIQuery must be used within AIQueryProvider');
  }
  return context;
};

interface AIQueryProviderProps {
  children: ReactNode;
}

export const AIQueryProvider: React.FC<AIQueryProviderProps> = ({ children }) => {
  const [query, setQuery] = useState<string | null>(null);
  const [autoSend, setAutoSend] = useState<boolean>(false);

  const clearQuery = useCallback(() => {
    setQuery(null);
    setAutoSend(false);
  }, []);

  return (
    <AIQueryContext.Provider
      value={{
        query,
        setQuery,
        clearQuery,
        autoSend,
        setAutoSend,
      }}
    >
      {children}
    </AIQueryContext.Provider>
  );
};

