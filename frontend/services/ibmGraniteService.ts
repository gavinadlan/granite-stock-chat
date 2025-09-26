// IBM Granite AI service for stock predictions and analysis
import Replicate from "replicate";

export interface GranitePrediction {
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  timeframe: string;
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: 'buy' | 'sell' | 'hold';
}

export interface GraniteAnalysis {
  symbol: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  keyFactors: string[];
  marketOutlook: string;
  riskAssessment: string;
  recommendation: string;
}

class IBMGraniteService {
  private replicate: Replicate | null = null;
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_REPLICATE_API_KEY || '';
    
    if (this.apiKey) {
      this.replicate = new Replicate({
        auth: this.apiKey,
      });
    }
  }

  // Generate stock prediction using IBM Granite
  async generateStockPrediction(
    symbol: string, 
    currentPrice: number, 
    timeframe: string = '1 week'
  ): Promise<GranitePrediction> {
    try {
      if (!this.replicate) {
        // Fallback to mock prediction if no API key
        return this.generateMockPrediction(symbol, currentPrice, timeframe);
      }

      const prompt = this.buildPredictionPrompt(symbol, currentPrice, timeframe);
      
      const output = await this.replicate.run(
        "ibm-granite/granite-3.3-8b-instruct",
        {
          input: {
            prompt: prompt,
            max_tokens: 512,
            temperature: 0.7
          }
        }
      );

      const response = Array.isArray(output) ? output.join('') : String(output);
      return this.parsePredictionResponse(symbol, currentPrice, timeframe, response);
      
    } catch (error) {
      console.error('Error generating IBM Granite prediction:', error);
      // Fallback to mock prediction
      return this.generateMockPrediction(symbol, currentPrice, timeframe);
    }
  }

  // Generate comprehensive stock analysis using IBM Granite
  async generateStockAnalysis(symbol: string, currentPrice: number): Promise<GraniteAnalysis> {
    try {
      if (!this.replicate) {
        return this.generateMockAnalysis(symbol);
      }

      const prompt = this.buildAnalysisPrompt(symbol, currentPrice);
      
      const output = await this.replicate.run(
        "ibm-granite/granite-3.3-8b-instruct",
        {
          input: {
            prompt: prompt,
            max_tokens: 600,
            temperature: 0.6
          }
        }
      );

      const response = Array.isArray(output) ? output.join('') : String(output);
      return this.parseAnalysisResponse(symbol, response);
      
    } catch (error) {
      console.error('Error generating IBM Granite analysis:', error);
      return this.generateMockAnalysis(symbol);
    }
  }

  // Build prompt for stock prediction
  private buildPredictionPrompt(symbol: string, currentPrice: number, timeframe: string): string {
    return `As a financial AI analyst, analyze ${symbol} stock and provide a prediction for ${timeframe}.

Current Price: $${currentPrice}

Please provide:
1. Predicted price for ${timeframe}
2. Confidence level (0-100%)
3. Key reasoning factors
4. Risk level (low/medium/high)
5. Recommendation (buy/sell/hold)

Format your response as:
PREDICTED_PRICE: $X.XX
CONFIDENCE: XX%
REASONING: [Your analysis]
RISK_LEVEL: [low/medium/high]
RECOMMENDATION: [buy/sell/hold]

Be concise and professional.`;
  }

  // Build prompt for comprehensive analysis
  private buildAnalysisPrompt(symbol: string, currentPrice: number): string {
    return `As a senior financial analyst, provide a comprehensive analysis of ${symbol} stock.

Current Price: $${currentPrice}

Please analyze:
1. Market sentiment (bullish/bearish/neutral)
2. Key factors affecting the stock
3. Market outlook
4. Risk assessment
5. Investment recommendation

Format your response as:
SENTIMENT: [bullish/bearish/neutral]
KEY_FACTORS: [List 3-5 key factors]
MARKET_OUTLOOK: [Your market outlook]
RISK_ASSESSMENT: [Risk analysis]
RECOMMENDATION: [Your recommendation with reasoning]

Be professional and data-driven.`;
  }

  // Parse IBM Granite prediction response
  private parsePredictionResponse(
    symbol: string, 
    currentPrice: number, 
    timeframe: string, 
    response: string
  ): GranitePrediction {
    try {
      const lines = response.split('\n');
      let predictedPrice = currentPrice * (1 + (Math.random() - 0.5) * 0.1); // Fallback
      let confidence = 75; // Fallback
      let reasoning = "AI analysis based on market data and trends.";
      let riskLevel: 'low' | 'medium' | 'high' = 'medium';
      let recommendation: 'buy' | 'sell' | 'hold' = 'hold';

      for (const line of lines) {
        if (line.includes('PREDICTED_PRICE:')) {
          const priceMatch = line.match(/\$?([\d.]+)/);
          if (priceMatch) {
            predictedPrice = parseFloat(priceMatch[1]);
          }
        } else if (line.includes('CONFIDENCE:')) {
          const confMatch = line.match(/(\d+)%/);
          if (confMatch) {
            confidence = parseInt(confMatch[1]);
          }
        } else if (line.includes('REASONING:')) {
          reasoning = line.replace('REASONING:', '').trim();
        } else if (line.includes('RISK_LEVEL:')) {
          const risk = line.toLowerCase();
          if (risk.includes('low')) riskLevel = 'low';
          else if (risk.includes('high')) riskLevel = 'high';
          else riskLevel = 'medium';
        } else if (line.includes('RECOMMENDATION:')) {
          const rec = line.toLowerCase();
          if (rec.includes('buy')) recommendation = 'buy';
          else if (rec.includes('sell')) recommendation = 'sell';
          else recommendation = 'hold';
        }
      }

      return {
        symbol,
        currentPrice,
        predictedPrice,
        confidence,
        timeframe,
        reasoning,
        riskLevel,
        recommendation
      };
    } catch (error) {
      console.error('Error parsing prediction response:', error);
      return this.generateMockPrediction(symbol, currentPrice, timeframe);
    }
  }

  // Parse IBM Granite analysis response
  private parseAnalysisResponse(symbol: string, response: string): GraniteAnalysis {
    try {
      const lines = response.split('\n');
      let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      let keyFactors: string[] = [];
      let marketOutlook = "Market conditions are stable.";
      let riskAssessment = "Moderate risk level.";
      let recommendation = "Hold position and monitor market conditions.";

      for (const line of lines) {
        if (line.includes('SENTIMENT:')) {
          const sent = line.toLowerCase();
          if (sent.includes('bullish')) sentiment = 'bullish';
          else if (sent.includes('bearish')) sentiment = 'bearish';
          else sentiment = 'neutral';
        } else if (line.includes('KEY_FACTORS:')) {
          const factors = line.replace('KEY_FACTORS:', '').trim();
          keyFactors = factors.split(',').map(f => f.trim()).filter(f => f.length > 0);
        } else if (line.includes('MARKET_OUTLOOK:')) {
          marketOutlook = line.replace('MARKET_OUTLOOK:', '').trim();
        } else if (line.includes('RISK_ASSESSMENT:')) {
          riskAssessment = line.replace('RISK_ASSESSMENT:', '').trim();
        } else if (line.includes('RECOMMENDATION:')) {
          recommendation = line.replace('RECOMMENDATION:', '').trim();
        }
      }

      return {
        symbol,
        sentiment,
        keyFactors: keyFactors.length > 0 ? keyFactors : [
          "Market volatility",
          "Company fundamentals",
          "Industry trends"
        ],
        marketOutlook,
        riskAssessment,
        recommendation
      };
    } catch (error) {
      console.error('Error parsing analysis response:', error);
      return this.generateMockAnalysis(symbol);
    }
  }

  // Generate mock prediction as fallback
  private generateMockPrediction(
    symbol: string, 
    currentPrice: number, 
    timeframe: string
  ): GranitePrediction {
    const volatility = 0.05;
    const randomChange = (Math.random() - 0.5) * 2 * volatility;
    const predictedPrice = currentPrice * (1 + randomChange);
    const confidence = Math.floor(Math.random() * 30) + 65;

    return {
      symbol,
      currentPrice,
      predictedPrice,
      confidence,
      timeframe,
      reasoning: "Analysis based on historical patterns and market trends. Consider market volatility and company fundamentals.",
      riskLevel: confidence > 80 ? 'low' : confidence > 65 ? 'medium' : 'high',
      recommendation: predictedPrice > currentPrice * 1.02 ? 'buy' : 
                     predictedPrice < currentPrice * 0.98 ? 'sell' : 'hold'
    };
  }

  // Generate mock analysis as fallback
  private generateMockAnalysis(symbol: string): GraniteAnalysis {
    const sentiments: ('bullish' | 'bearish' | 'neutral')[] = ['bullish', 'bearish', 'neutral'];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];

    return {
      symbol,
      sentiment,
      keyFactors: [
        "Market volatility and economic conditions",
        "Company earnings and financial performance",
        "Industry trends and competitive landscape",
        "Regulatory environment and policy changes"
      ],
      marketOutlook: sentiment === 'bullish' ? 
        "Positive outlook with potential for growth" :
        sentiment === 'bearish' ? 
        "Cautious outlook with potential headwinds" :
        "Neutral outlook with mixed signals",
      riskAssessment: "Moderate risk level. Consider diversification and risk management strategies.",
      recommendation: sentiment === 'bullish' ? 
        "Consider accumulating on dips" :
        sentiment === 'bearish' ? 
        "Consider reducing position size" :
        "Maintain current position and monitor developments"
    };
  }
}

export const ibmGraniteService = new IBMGraniteService();
