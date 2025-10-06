'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

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
  const [isComposing, setIsComposing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsComposing(false);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Based on current Tesla market data, I recommend monitoring the $250 resistance level closely.',
        'Tesla\'s Q4 delivery numbers look promising. Consider a bullish position if it breaks above $260.',
        'The sentiment analysis shows mixed signals. I\'d suggest waiting for clearer market direction.',
        'Technical indicators suggest a potential pullback. Consider taking profits if you\'re long.',
        'Tesla\'s fundamentals remain strong despite recent volatility. Long-term outlook is positive.'
      ];
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    setIsComposing(true);
    // Focus the input field
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Quick Actions */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
          <p className="text-sm text-text-muted mt-1">Common Tesla analyses</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
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
      <Card className="flex flex-col h-[600px] p-6">
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
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setIsComposing(e.target.value.trim().length > 0);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about Tesla trading..."
                className="w-full px-4 py-3 border border-border rounded-lg bg-card text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-tesla-red focus:border-transparent resize-none"
                rows={3}
                aria-label="Chat message input"
              />
            </div>
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputValue.trim()}
              className="px-6 self-end"
              aria-label="Send message"
            >
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
