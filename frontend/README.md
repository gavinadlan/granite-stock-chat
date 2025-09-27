# Stock Market AI Assistant Frontend

A modern React frontend for the Stock Market AI Assistant, built with Vite, TypeScript, and Tailwind CSS.

## Features

- 🚀 **Real-time Stock Prices** - Get live stock data from multiple sources
- 🤖 **AI Predictions** - IBM Granite-powered stock price predictions
- 📊 **Technical Analysis** - RSI, MACD, moving averages, and more
- 📰 **Market News** - Latest news with sentiment analysis
- 💬 **Interactive Chat** - Natural language interface for stock queries
- 📱 **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **React Router** - Client-side routing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env-template.txt .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```
   VITE_AWS_API_URL=http://localhost:3001
   VITE_RAPIDAPI_KEY=your_rapidapi_key
   VITE_REPLICATE_API_KEY=your_replicate_key
   VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
   VITE_NEWS_API_KEY=your_news_api_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── HomePage.tsx    # Landing page
│   │   ├── ChatInterface.tsx # Main chat interface
│   │   └── ...
│   ├── pages/              # Route components
│   ├── services/           # API services
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json            # Dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## API Integration

The frontend integrates with multiple APIs:

1. **AWS Lambda** - Primary backend service
2. **Yahoo Finance (RapidAPI)** - Stock price data
3. **IBM Granite (Replicate)** - AI predictions
4. **Alpha Vantage** - Financial data fallback
5. **News API** - Market news

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_AWS_API_URL` | AWS Lambda API URL | No |
| `VITE_RAPIDAPI_KEY` | RapidAPI key for Yahoo Finance | No |
| `VITE_REPLICATE_API_KEY` | Replicate API key for IBM Granite | No |
| `VITE_ALPHA_VANTAGE_API_KEY` | Alpha Vantage API key | No |
| `VITE_NEWS_API_KEY` | News API key | No |

## Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Deploy to Vercel

1. Install Vercel CLI
   ```bash
   npm i -g vercel
   ```

2. Deploy
   ```bash
   vercel
   ```

### Deploy to Netlify

1. Build the project
   ```bash
   npm run build
   ```

2. Upload the `dist/` folder to Netlify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.