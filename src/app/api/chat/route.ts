import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_ENDPOINT || 'https://api.openai.com/v1',
});

const SYSTEM_PROMPT = `You are a Tesla Trading Assistant, an expert AI that helps users analyze Tesla (TSLA) stock, make trading decisions, and understand market dynamics. 

Your expertise includes:
- Tesla's business model, financials, and competitive position
- Technical analysis of Tesla stock charts and indicators
- Market sentiment analysis and news impact
- Risk assessment and portfolio management
- Trading strategies and timing

Guidelines:
- Always provide data-driven analysis when possible
- Mention risks and uncertainties in your recommendations
- Use clear, actionable language
- Reference specific Tesla metrics, events, or market conditions when relevant
- If asked about specific chart events or annotations, provide context about their market impact
- Be helpful but remind users that this is not financial advice

Current context: You're helping a Tesla investor/trader analyze market conditions and make informed decisions.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, userId = 1 } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Add system prompt to the beginning of messages
    const chatMessages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      ...messages,
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: chatMessages,
      max_tokens: 1000,
      temperature: 0.7,
      user: userId.toString(), // Set user ID to 1 as per user preference
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: response,
      usage: completion.usage,
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    if (error instanceof Error) {
      // Handle specific OpenAI errors
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured properly' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to process chat request' },
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
