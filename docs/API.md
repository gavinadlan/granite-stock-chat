# 📚 API Documentation

## Stock Market Chatbot API

This document describes the API endpoints for the Stock Market Chatbot backend.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-api-gateway-url.amazonaws.com/dev`

## Authentication

Currently, no authentication is required. All endpoints are publicly accessible.

## Endpoints

### 1. Stock Price

Get real-time stock price information.

**Endpoint**: `GET /stock-price`

**Parameters**:
- `symbol` (required): Stock symbol (e.g., AAPL, TSLA, MSFT)

**Example Request**:
```bash
curl "http://localhost:3000/stock-price?symbol=AAPL"
```

**Example Response**:
```json
{
  "symbol": "AAPL",
  "price": 175.43,
  "change": 2.15,
  "changePercent": 1.24,
  "volume": 45678900,
  "high": 176.50,
  "low": 173.20,
  "open": 174.80,
  "previousClose": 173.28
}
```

**Response Fields**:
- `symbol`: Stock symbol
- `price`: Current price
- `change`: Price change from previous close
- `changePercent`: Percentage change
- `volume`: Trading volume
- `high`: Day's high price
- `low`: Day's low price
- `open`: Opening price
- `previousClose`: Previous closing price

---

### 2. AI Prediction

Get AI-powered stock price predictions using IBM Granite.

**Endpoint**: `GET /ai-prediction`

**Parameters**:
- `symbol` (required): Stock symbol
- `timeframe` (optional): Prediction timeframe (default: "1 week")

**Example Request**:
```bash
curl "http://localhost:3000/ai-prediction?symbol=TSLA&timeframe=1%20week"
```

**Example Response**:
```json
{
  "symbol": "TSLA",
  "current": 245.67,
  "predicted": 252.30,
  "confidence": 78,
  "timeframe": "1 week",
  "change": 6.63,
  "changePercent": 2.70,
  "reasoning": "Analysis based on historical patterns and market trends. Consider market volatility and company fundamentals.",
  "riskLevel": "medium",
  "recommendation": "buy"
}
```

**Response Fields**:
- `symbol`: Stock symbol
- `current`: Current price
- `predicted`: Predicted price
- `confidence`: Confidence level (0-100)
- `timeframe`: Prediction timeframe
- `change`: Predicted price change
- `changePercent`: Predicted percentage change
- `reasoning`: AI reasoning for prediction
- `riskLevel`: Risk level (low/medium/high)
- `recommendation`: AI recommendation (buy/sell/hold)

---

### 3. Technical Analysis

Get technical analysis indicators for a stock.

**Endpoint**: `GET /technical-analysis`

**Parameters**:
- `symbol` (required): Stock symbol

**Example Request**:
```bash
curl "http://localhost:3000/technical-analysis?symbol=MSFT"
```

**Example Response**:
```json
{
  "symbol": "MSFT",
  "movingAverages": {
    "sma20": 340.25,
    "sma50": 335.80,
    "sma200": 320.45
  },
  "rsi": 65.4,
  "macd": {
    "macd": 2.15,
    "signal": 1.85,
    "histogram": 0.30
  },
  "support": 325.50,
  "resistance": 350.75,
  "trend": "bullish",
  "analysis": {
    "summary": "Technical analysis for MSFT shows bullish trend with RSI at 65.4.",
    "recommendation": "Consider buying on dips"
  }
}
```

**Response Fields**:
- `symbol`: Stock symbol
- `movingAverages`: Moving average values
  - `sma20`: 20-day simple moving average
  - `sma50`: 50-day simple moving average
  - `sma200`: 200-day simple moving average
- `rsi`: Relative Strength Index (0-100)
- `macd`: MACD indicators
  - `macd`: MACD line
  - `signal`: Signal line
  - `histogram`: MACD histogram
- `support`: Support level
- `resistance`: Resistance level
- `trend`: Overall trend (bullish/bearish/neutral)
- `analysis`: Analysis summary and recommendation

---

### 4. Market News

Get latest market news related to stocks.

**Endpoint**: `GET /market-news`

**Parameters**:
- `query` (optional): Search query (default: "stock market")
- `symbol` (optional): Specific stock symbol

**Example Request**:
```bash
curl "http://localhost:3000/market-news?query=stock%20market"
curl "http://localhost:3000/market-news?symbol=AAPL"
```

**Example Response**:
```json
[
  {
    "title": "Apple Reports Strong Q4 Earnings Beat Expectations",
    "source": "Bloomberg",
    "time": "2h ago",
    "url": "https://example.com/news/apple-earnings",
    "description": "Apple Inc. reported better-than-expected quarterly earnings..."
  },
  {
    "title": "Tesla Announces New Gigafactory in Mexico",
    "source": "Reuters",
    "time": "4h ago",
    "url": "https://example.com/news/tesla-gigafactory",
    "description": "Tesla Inc. announced plans to build a new Gigafactory..."
  }
]
```

**Response Fields**:
- `title`: News article title
- `source`: News source
- `time`: Time ago (e.g., "2h ago", "1d ago")
- `url`: Article URL
- `description`: Article description

---

## Error Responses

All endpoints return appropriate HTTP status codes and error messages.

**Example Error Response**:
```json
{
  "error": "Symbol parameter is required",
  "statusCode": 400
}
```

**Common Error Codes**:
- `400`: Bad Request - Missing or invalid parameters
- `500`: Internal Server Error - Server-side error

---

## Rate Limits

- **Free Tier**: 100 requests per hour
- **Paid Tier**: 1000 requests per hour

---

## CORS

All endpoints support CORS for cross-origin requests from web applications.

---

## Data Sources

The API uses multiple data sources with automatic fallback:

1. **Primary**: Yahoo Finance (direct scraping)
2. **Secondary**: Alpha Vantage API
3. **Tertiary**: RapidAPI Yahoo Finance
4. **Fallback**: Mock data

---

## Support

For API support and questions, please refer to the main project documentation or create an issue in the repository.
