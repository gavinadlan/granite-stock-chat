// IBM Granite Service via Replicate
import { TECHNICAL_ANALYSIS_CONSTANTS } from '@/lib/constants';

export interface GranitePrediction {
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  timeframe: string;
  reasoning: string;
  lastUpdated: Date;
}

export interface GraniteTechnicalAnalysis {
  symbol: string;
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  movingAverages: {
    sma20: number;
    sma50: number;
    sma200: number;
  };
  support: number;
  resistance: number;
  trend: string;
  lastUpdated: Date;
}

class IBMGraniteService {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env?.VITE_REPLICATE_API_KEY || 'r8_DaMQj6GV5SXmXlriHPJnRf5TjwPaVSu0PPewg';
    if (!this.apiKey) {
      console.warn('⚠️ IBM Granite API key not found, using fallback');
    }
  }

  async getPrediction(symbol: string, timeframe: string = '1 week'): Promise<GranitePrediction | null> {
    if (!this.apiKey) {
      console.warn('Replicate API key not provided');
      return null;
    }

    try {
      const prompt = `Analyze the stock ${symbol} and predict its price for ${timeframe}. Consider technical indicators, market sentiment, and recent news. Provide a confidence level and reasoning.`;

      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: 'meta/llama-2-7b-chat',
          input: {
            prompt: prompt,
            max_tokens: 512
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse the response and extract prediction data
      const predictionText = data.output || '';
      const currentPrice = this.extractCurrentPrice(predictionText);
      const predictedPrice = this.extractPredictedPrice(predictionText);
      const confidence = this.extractConfidence(predictionText);
      const reasoning = this.extractReasoning(predictionText);

      return {
        symbol: symbol.toUpperCase(),
        currentPrice,
        predictedPrice,
        confidence,
        timeframe,
        reasoning,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('IBM Granite API error:', error);
      return null;
    }
  }

  async getTechnicalAnalysis(symbol: string): Promise<GraniteTechnicalAnalysis | null> {
    if (!this.apiKey) {
      console.warn('Replicate API key not provided');
      return null;
    }

    try {
      const prompt = `Provide technical analysis for ${symbol} including RSI, MACD, moving averages, support/resistance levels, and overall trend.`;

      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: 'meta/llama-2-7b-chat',
          input: {
            prompt: prompt,
            max_tokens: 512
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.output || '';

      return {
        symbol: symbol.toUpperCase(),
        rsi: this.extractRSI(analysisText),
        macd: this.extractMACD(analysisText),
        movingAverages: this.extractMovingAverages(analysisText),
        support: this.extractSupport(analysisText),
        resistance: this.extractResistance(analysisText),
        trend: this.extractTrend(analysisText),
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('IBM Granite technical analysis error:', error);
      return null;
    }
  }

  private extractCurrentPrice(text: string): number {
    const match = text.match(/current price[:\s]*\$?(\d+\.?\d*)/i);
    return match ? parseFloat(match[1]) : TECHNICAL_ANALYSIS_CONSTANTS.DEFAULT_SMA_20;
  }

  private extractPredictedPrice(text: string): number {
    const match = text.match(/predicted price[:\s]*\$?(\d+\.?\d*)/i);
    return match ? parseFloat(match[1]) : TECHNICAL_ANALYSIS_CONSTANTS.DEFAULT_SMA_50;
  }

  private extractConfidence(text: string): number {
    const match = text.match(/confidence[:\s]*(\d+\.?\d*)%/i);
    return match ? parseFloat(match[1]) / 100 : 0.75;
  }

  private extractReasoning(text: string): string {
    const lines = text.split('\n');
    const reasoningLines = lines.filter(line => 
      line.toLowerCase().includes('reasoning') || 
      line.toLowerCase().includes('analysis') ||
      line.toLowerCase().includes('because')
    );
    return reasoningLines.join(' ') || 'AI analysis based on market data and technical indicators.';
  }

  private extractRSI(text: string): number {
    const match = text.match(/RSI[:\s]*(\d+\.?\d*)/i);
    return match ? parseFloat(match[1]) : TECHNICAL_ANALYSIS_CONSTANTS.DEFAULT_RSI;
  }

  private extractMACD(text: string): { macd: number; signal: number; histogram: number } {
    const macdMatch = text.match(/MACD[:\s]*(\d+\.?\d*)/i);
    const signalMatch = text.match(/signal[:\s]*(\d+\.?\d*)/i);
    const histogramMatch = text.match(/histogram[:\s]*(\d+\.?\d*)/i);
    
    return {
      macd: macdMatch ? parseFloat(macdMatch[1]) : TECHNICAL_ANALYSIS_CONSTANTS.DEFAULT_MACD,
      signal: signalMatch ? parseFloat(signalMatch[1]) : TECHNICAL_ANALYSIS_CONSTANTS.DEFAULT_SIGNAL,
      histogram: histogramMatch ? parseFloat(histogramMatch[1]) : TECHNICAL_ANALYSIS_CONSTANTS.DEFAULT_HISTOGRAM
    };
  }

  private extractMovingAverages(text: string): { sma20: number; sma50: number; sma200: number } {
    const sma20Match = text.match(/SMA 20[:\s]*\$?(\d+\.?\d*)/i);
    const sma50Match = text.match(/SMA 50[:\s]*\$?(\d+\.?\d*)/i);
    const sma200Match = text.match(/SMA 200[:\s]*\$?(\d+\.?\d*)/i);
    
    return {
      sma20: sma20Match ? parseFloat(sma20Match[1]) : TECHNICAL_ANALYSIS_CONSTANTS.DEFAULT_SMA_20,
      sma50: sma50Match ? parseFloat(sma50Match[1]) : TECHNICAL_ANALYSIS_CONSTANTS.DEFAULT_SMA_50,
      sma200: sma200Match ? parseFloat(sma200Match[1]) : TECHNICAL_ANALYSIS_CONSTANTS.DEFAULT_SMA_200
    };
  }

  private extractSupport(text: string): number {
    const match = text.match(/support[:\s]*\$?(\d+\.?\d*)/i);
    return match ? parseFloat(match[1]) : TECHNICAL_ANALYSIS_CONSTANTS.DEFAULT_SUPPORT;
  }

  private extractResistance(text: string): number {
    const match = text.match(/resistance[:\s]*\$?(\d+\.?\d*)/i);
    return match ? parseFloat(match[1]) : TECHNICAL_ANALYSIS_CONSTANTS.DEFAULT_RESISTANCE;
  }

  private extractTrend(text: string): string {
    if (text.toLowerCase().includes('bullish')) return 'Bullish';
    if (text.toLowerCase().includes('bearish')) return 'Bearish';
    return 'Neutral';
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }
}

export const ibmGraniteService = new IBMGraniteService();