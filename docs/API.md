# 📚 API Documentation

## Stock Market Chatbot API

This document describes the API endpoints for the Stock Market Chatbot backend.

## Base URL

- **Development**: `http://localhost:3001`
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
curl "http://localhost:3001/stock-price?symbol=AAPL"
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

### 2. AI Outlook

Qualitative outlook written by IBM Granite on top of the real current price.
The model is not asked for a price target, percentage forecast, confidence number or
buy/sell recommendation (those would be invented figures).

**Endpoint**: `GET /ai-prediction`

**Parameters**:
- `symbol` (required): Stock symbol
- `timeframe` (optional): `1d`, `1w` (default), `1m`, `3m`

**Example Request**:
```bash
curl "http://localhost:3001/ai-prediction?symbol=TSLA&timeframe=1w"
```

**Example Response**:
```json
{
  "symbol": "TSLA",
  "current": 245.67,
  "currency": "USD",
  "timeframe": "1 week",
  "reasoning": "Earnings expectations and interest-rate news often move large growth stocks.",
  "risks": "Results can differ sharply from expectations.",
  "method": "llm-explanation",
  "model": "ibm-granite/granite-3.3-8b-instruct",
  "source": "Yahoo Finance + ibm-granite/granite-3.3-8b-instruct",
  "asOf": "2026-10-23T14:30:00.000Z"
}
```

**Errors**: `503` when the AI provider is unavailable or times out; `502 AI_BAD_RESPONSE` when its answer cannot be used.
A statistical projection computed from real data arrives in Sprint 1 (S1-08).

---

### 3. Technical Analysis

Get technical analysis indicators for a stock.

**Endpoint**: `GET /technical-analysis`

**Parameters**:
- `symbol` (required): Stock symbol

**Example Request**:
```bash
curl "http://localhost:3001/technical-analysis?symbol=MSFT"
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
curl "http://localhost:3001/market-news?query=stock%20market"
curl "http://localhost:3001/market-news?symbol=AAPL"
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
