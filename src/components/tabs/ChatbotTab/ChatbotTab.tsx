'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { getChatService, ChatMessage } from '../../../services/chatService';
import { useAIQuery } from '../../../context/AIQueryContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

// Client-side timestamp component to avoid hydration issues
const Timestamp: React.FC<{ timestamp: Date }> = ({ timestamp }) => {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    setTimeString(timestamp.toLocaleTimeString());
  }, [timestamp]);

  return <span>{timeString}</span>;
};

export const ChatbotTab: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const queryProcessedRef = useRef<string | null>(null); // Track processed queries via ref (always current)
  const chatService = getChatService();
  const { query, autoSend, clearQuery } = useAIQuery();
  const [hasProcessedQuery, setHasProcessedQuery] = useState<string | null>(null); // Track which query was processed

  // Debug: Log render with current state (remove in production)
  // useEffect(() => {
  //   console.log('ChatbotTab render - inputValue:', inputValue, 'query:', query, 'hasProcessedQuery:', hasProcessedQuery);
  // });

  // Initialize with welcome message after component mounts to avoid hydration issues
  useEffect(() => {
    if (!isInitialized) {
      setMessages([
        {
          id: '1',
          text: 'Hello! I\'m your Tesla Trading Assistant. I can help you analyze Tesla stock, provide trading recommendations, and answer questions about market trends. What would you like to know?',
          sender: 'assistant',
          timestamp: new Date()
        }
      ]);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Check for pending query on mount (only runs once)
  useEffect(() => {
    if (query && query !== queryProcessedRef.current) {
      queryProcessedRef.current = query;
      setInputValue(query);
      setHasProcessedQuery(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue;
    if (!textToSend.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    const previousInput = inputValue;
    setInputValue('');
    setIsLoading(true);
    setError(null);
    
    // Clear query after sending - but only if it matches what we're sending
    if (query && (query === textToSend || query === previousInput)) {
      clearQuery();
    }

    try {
      const response = await chatService.sendMessage(textToSend);
      
      if (response.success && response.message) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: response.message,
          sender: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiResponse]);
      } else {
        throw new Error(response.error || 'Failed to get response from AI');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again or check your API configuration.',
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle incoming query from context
  useEffect(() => {
    // Use ref to check if this query was already processed (avoids stale closure issues)
    if (query && query !== queryProcessedRef.current) {
      // Update ref immediately to prevent duplicate processing
      queryProcessedRef.current = query;
      const currentQuery = query; // Capture query in closure
      
      // Populate input field - set state immediately
      setInputValue(currentQuery);
      setHasProcessedQuery(currentQuery);
      
      // Verify and sync after React processes state update
      const verifyTimeout = setTimeout(() => {
        if (inputRef.current) {
          // Ensure React state and DOM are in sync
          if (inputRef.current.value !== currentQuery) {
            // Update React state
            setInputValue(currentQuery);
            // Set DOM directly as backup (React controlled component will override if needed)
            inputRef.current.value = currentQuery;
            // Trigger onChange to keep React state in sync
            const syntheticEvent = new Event('input', { bubbles: true });
            inputRef.current.dispatchEvent(syntheticEvent);
          }
        }
      }, 200);
      
      // Focus and scroll after tab switch completes
      const focusTimeoutId = setTimeout(() => {
        if (inputRef.current) {
          // Final check - ensure value persists
          if (inputRef.current.value !== currentQuery) {
            setInputValue(currentQuery);
            inputRef.current.value = currentQuery;
          }
          inputRef.current.focus();
          inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 800);
      
      // Auto-send if enabled
      let sendTimeoutId: NodeJS.Timeout | null = null;
      if (autoSend) {
        sendTimeoutId = setTimeout(() => {
          if (currentQuery.trim() && !isLoading) {
            handleSendMessage(currentQuery);
            clearQuery();
          }
        }, 1300);
      }
      
      return () => {
        clearTimeout(verifyTimeout);
        clearTimeout(focusTimeoutId);
        if (sendTimeoutId) clearTimeout(sendTimeoutId);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Reset processed flag when query is cleared
  useEffect(() => {
    if (!query) {
      setHasProcessedQuery(null);
      queryProcessedRef.current = null;
    }
  }, [query]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
           setInputValue(action);
    // Focus the input field
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Quick Actions */}
      <Card className="p-4 md:p-6">
        <div className="mb-4">
          <h3 className="text-base md:text-lg font-semibold text-foreground">Quick Actions</h3>
          <p className="text-xs md:text-sm text-text-muted mt-1">Common Tesla analyses</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
          {[
            'Analyze Tesla stock price',
            'Check market sentiment',
            'Get trading signals',
            'Portfolio performance',
            'Risk assessment',
            'Market news update'
          ].map((action) => (
            <Button
              key={action}
              variant="outline"
              onClick={() => handleQuickAction(action)}
              className="justify-start h-auto py-3 px-4 text-left hover:bg-card/50 transition-colors"
            >
              {action}
            </Button>
          ))}
        </div>
      </Card>

            {/* Chat Interface */}
             <Card className="flex flex-col h-[400px] md:h-[600px] p-4 md:p-6">
        {/* Message History */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {messages.length === 1 && messages[0].sender === 'assistant' ? (
            // Empty state
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-tesla-red/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-tesla-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Ready to help with Tesla trading</h4>
              <p className="text-text-muted max-w-md">
                Ask me about Tesla stock analysis, market sentiment, trading signals, or any other trading questions.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start space-x-3 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' 
                        ? 'bg-tesla-red text-white' 
                        : 'bg-tesla-blue text-white'
                    }`}>
                      {message.sender === 'user' ? 'U' : 'AI'}
                    </div>
                    
                    {/* Message Content */}
                    <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-4 py-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-tesla-red text-white rounded-br-sm'
                            : 'bg-card border border-border text-foreground rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      </div>
                      <div className={`mt-1 px-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        <p className="text-xs text-text-muted">
                          <Timestamp timestamp={message.timestamp} />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Composer */}
        <div className="border-t border-border pt-4 mt-4">
          {/* Query Indicator */}
          {query && (
            <div className="mb-3 p-3 bg-tesla-red/10 border border-tesla-red/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-tesla-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-sm text-tesla-red font-medium">
                  {autoSend ? 'Auto-sending query...' : 'Query loaded - ready to send'}
                </p>
              </div>
            </div>
          )}
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={query && query === hasProcessedQuery ? query : inputValue}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setInputValue(newValue);
                  // Clear query when user manually edits away from the query
                  if (query && newValue !== query && newValue.trim() !== query.trim()) {
                    clearQuery();
                  }
                }}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about Tesla trading..."
                className={`w-full px-4 py-3 border rounded-lg bg-card text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-tesla-red focus:border-transparent resize-none transition-all duration-200 ${
                  query ? 'border-tesla-red shadow-lg shadow-tesla-red/20' : 'border-border'
                }`}
                rows={3}
                aria-label="Chat message input"
              />
            </div>
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputValue.trim() || isLoading}
              className="px-6 self-end"
              aria-label="Send message"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                'Send'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
