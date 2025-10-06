/**
 * Chat Service for Tesla Trading Assistant
 * Handles communication with OpenAI API and provides extensible architecture for custom LLM
 */

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  context?: string; // Additional context for the AI
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatServiceConfig {
  apiEndpoint: string;
  model: string;
  maxTokens: number;
  temperature: number;
  userId: number;
}

class ChatService {
  private config: ChatServiceConfig;
  private messageHistory: ChatMessage[] = [];

  constructor(config?: Partial<ChatServiceConfig>) {
    this.config = {
      apiEndpoint: '/api/chat', // Default to our Next.js API route
      model: 'gpt-4',
      maxTokens: 1000,
      temperature: 0.7,
      userId: 1, // Set to 1 per user preference
      ...config,
    };
  }

  /**
   * Send a message to the AI and get a response
   */
  async sendMessage(
    message: string, 
    context?: string
  ): Promise<ChatResponse> {
    try {
      // Add user message to history
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: message,
        sender: 'user',
        timestamp: new Date(),
        context,
      };
      this.messageHistory.push(userMessage);

      // Prepare messages for API
      const apiMessages = this.messageHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

      // Add context if provided
      if (context) {
        apiMessages[apiMessages.length - 1].content = `${context}\n\nUser question: ${message}`;
      }

      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages,
          userId: this.config.userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response from AI');
      }

      // Add assistant response to history
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        sender: 'assistant',
        timestamp: new Date(),
      };
      this.messageHistory.push(assistantMessage);

      return {
        success: true,
        message: data.message,
        usage: data.usage,
      };

    } catch (error) {
      console.error('Chat service error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Send a message with Tesla-specific context
   */
  async sendTeslaAnalysis(
    query: string,
    marketData?: any,
    technicalIndicators?: any,
    sentimentData?: any
  ): Promise<ChatResponse> {
    let context = `Tesla Trading Analysis Request:\n`;
    
    if (marketData) {
      context += `Current Market Data: ${JSON.stringify(marketData)}\n`;
    }
    
    if (technicalIndicators) {
      context += `Technical Indicators: ${JSON.stringify(technicalIndicators)}\n`;
    }
    
    if (sentimentData) {
      context += `Sentiment Data: ${JSON.stringify(sentimentData)}\n`;
    }

    return this.sendMessage(query, context);
  }

  /**
   * Send a message about a specific chart event/annotation
   */
  async askAboutChartEvent(
    eventTitle: string,
    eventDescription: string,
    eventPrice: number,
    eventType: string
  ): Promise<ChatResponse> {
    const context = `Chart Event Analysis:
- Event: ${eventTitle}
- Description: ${eventDescription}
- Price at event: $${eventPrice}
- Event type: ${eventType}
- Date: Recent Tesla stock movement

Please analyze this event's impact on Tesla's stock and provide trading insights.`;

    return this.sendMessage(
      `Can you analyze this Tesla stock event and its implications?`,
      context
    );
  }

  /**
   * Get quick trading insights
   */
  async getTradingInsights(): Promise<ChatResponse> {
    return this.sendMessage(
      'Provide a brief analysis of Tesla\'s current trading outlook and key factors to watch.'
    );
  }

  /**
   * Get portfolio risk assessment
   */
  async assessPortfolioRisk(holdings: any[]): Promise<ChatResponse> {
    const context = `Portfolio Risk Assessment Request:
Current Holdings: ${JSON.stringify(holdings)}
Please assess the risk profile and provide recommendations.`;

    return this.sendMessage(
      'Assess my portfolio risk and provide recommendations for Tesla holdings.',
      context
    );
  }

  /**
   * Clear message history
   */
  clearHistory(): void {
    this.messageHistory = [];
  }

  /**
   * Get message history
   */
  getHistory(): ChatMessage[] {
    return [...this.messageHistory];
  }

  /**
   * Get conversation summary
   */
  getConversationSummary(): string {
    if (this.messageHistory.length === 0) {
      return 'No conversation history';
    }

    const userMessages = this.messageHistory.filter(msg => msg.sender === 'user');
    const assistantMessages = this.messageHistory.filter(msg => msg.sender === 'assistant');

    return `Conversation Summary:
- Total messages: ${this.messageHistory.length}
- User questions: ${userMessages.length}
- AI responses: ${assistantMessages.length}
- Last activity: ${this.messageHistory[this.messageHistory.length - 1]?.timestamp.toLocaleString()}`;
  }

  /**
   * Update configuration for custom LLM
   */
  updateConfig(newConfig: Partial<ChatServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Switch to custom LLM endpoint
   */
  switchToCustomLLM(endpoint: string, apiKey?: string): void {
    this.updateConfig({
      apiEndpoint: endpoint,
    });
    
    // Note: For custom LLM, you might need to modify the API call format
    // This is a placeholder for future custom LLM integration
    console.log('Switched to custom LLM endpoint:', endpoint);
  }
}

// Export singleton instance
let chatService: ChatService | null = null;

export const getChatService = (): ChatService => {
  if (!chatService) {
    chatService = new ChatService();
  }
  return chatService;
};

export { ChatService };
