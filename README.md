# Tesla Trading Agent Interface

A modern, responsive web interface for an AI-powered Tesla trading assistant. Built with Next.js 15, React 18, TypeScript, and Tailwind CSS.

## 🚀 Features

### 📊 **Dashboard**
- Portfolio overview with total value and daily performance
- Interactive performance tiles (1-Day, 1-Week, 1-Month)
- Market snapshot with benchmark indices
- Holdings table with filtering and density controls
- Interactive chips for analysis overlays

### 🤖 **AI Assistant**
- OpenAI GPT-4 integration for intelligent trading recommendations
- Extensible architecture for custom LLM integration
- Quick action buttons for common Tesla analyses
- Full-width dialogue area with message history
- Real-time AI responses with Tesla-specific context
- Chart annotation integration for contextual analysis

### 📈 **Analysis Tab**
- **Technical Analysis**: 
  - Interactive TradingView Lightweight Charts with annotations
  - Real-time Alpha Vantage technical indicators (RSI, MACD, SMA, Bollinger Bands)
  - Chart event tooltips with "Ask AI" integration
  - Time period selectors (1D, 1W, 1M, 3M, 1Y)
- **Fundamental Analysis**: 
  - Company overview from Alpha Vantage
  - Income statement, balance sheet, and cash flow data
  - Key financial metrics and ratios
  - AI-powered fundamental analysis
- **Sentiment Analysis**: 
  - Placeholder architecture for custom sentiment APIs
  - Mock data with clear integration points
  - Multi-source sentiment tracking (news, social, analyst)
- Sub-navigation for easy switching between analysis types

### 💼 **Portfolio Management**
- Detailed holdings overview with performance metrics
- Asset allocation visualization
- Recent trading activity feed
- Performance benchmarking

### 🎨 **Modern UI/UX**
- Clean, professional design with Tesla branding
- Light/Dark theme toggle with localStorage persistence
- Responsive design for all device sizes
- Accessibility features with ARIA labels and keyboard navigation

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **State Management**: React Context API
- **Build Tool**: Turbopack (Next.js 15)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tesla-trading-agent.git
   cd tesla-trading-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
```bash
npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and theme variables
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── layout/           # Layout components (Header, Navigation)
│   ├── tabs/             # Main tab components
│   │   ├── DashboardTab/ # Portfolio overview
│   │   ├── ChatbotTab/   # AI assistant interface
│   │   ├── AnalysisTab/  # Combined analysis views
│   │   └── PortfolioTab/ # Holdings management
│   ├── ui/               # Reusable UI components
│   └── context/          # React Context providers
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## 🎨 Design System

### Color Palette
- **Primary**: Tesla Red (#E31937)
- **Secondary**: Tesla Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Font**: Inter (system font stack)
- **Hierarchy**: Clear size and weight distinctions
- **Accessibility**: WCAG AA compliant contrast ratios

## 📱 Responsive Design

- **Desktop**: Full navigation with descriptions
- **Tablet**: Optimized layout with touch-friendly controls
- **Mobile**: Bottom navigation bar with essential functions

## 🔧 Configuration

### Environment Variables

**Important**: Never commit your actual API keys to version control!

1. **Copy the template file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` with your actual API keys**:
   ```env
   # Alpha Vantage API Configuration
   ALPHA_VANTAGE_API_KEY=your_actual_alpha_vantage_api_key
   
   # OpenAI API Configuration
   OPENAI_API_KEY=your_actual_openai_api_key
   OPENAI_MODEL=gpt-4
   OPENAI_API_ENDPOINT=https://api.openai.com/v1
   
   # Optional: For future custom LLM integration
   # CUSTOM_LLM_ENDPOINT=https://your-custom-llm-endpoint.com/v1
   # CUSTOM_LLM_API_KEY=your_custom_llm_api_key_here
   
   # MCP Server Configuration
   MCP_SERVER_URL=ws://localhost:3001
   ```

**File Purpose**:
- `.env.example` - Template file with placeholder values (safe to commit)
- `.env.local` - Your actual configuration with real API keys (gitignored, never commit)

#### API Setup Instructions

1. **Alpha Vantage API Key**:
   - Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
   - Sign up for a free account
   - Get your API key (5 calls/minute free tier)
   - Replace `YOUR_ALPHA_VANTAGE_API_KEY_HERE` in `.env.local` with your actual key

2. **OpenAI API Key**:
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create an API key
   - Replace `YOUR_OPENAI_API_KEY_HERE` in `.env.local` with your actual key
   - Ensure you have credits in your OpenAI account

3. **Rate Limits**:
   - Alpha Vantage: 5 calls/minute (free), 75 calls/minute (premium)
   - OpenAI: Based on your plan and model usage

### Customization
- **Theme**: Modify color variables in `src/app/globals.css`
- **Components**: Extend UI components in `src/components/ui/`
- **Styling**: Update Tailwind configuration in `tailwind.config.ts`

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

### Other Platforms
- **Netlify**: Compatible with Next.js static export
- **Railway**: Full-stack deployment support
- **AWS/GCP/Azure**: Container-based deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Tesla for inspiration and branding guidelines
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- React community for excellent components and patterns

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Review existing issues and discussions

---

**Built with ❤️ for the Tesla trading community**