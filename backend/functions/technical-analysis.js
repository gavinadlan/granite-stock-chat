// AWS Lambda function for technical analysis
const https = require('https');

exports.handler = async (event) => {
    console.log('Technical Analysis Lambda invoked:', JSON.stringify(event, null, 2));
    
    try {
        // Parse the request
        const { symbol } = event.queryStringParameters || {};
        
        if (!symbol) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
                },
                body: JSON.stringify({
                    error: 'Symbol parameter is required'
                })
            };
        }

        // Get stock data and generate technical analysis
        const stockData = await getStockData(symbol);
        const technicalAnalysis = generateTechnicalAnalysis(symbol, stockData);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify(technicalAnalysis)
        };
        
    } catch (error) {
        console.error('Error in technical analysis lambda:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};

// Function to get stock data from Yahoo Finance
async function getStockData(symbol) {
    return new Promise((resolve, reject) => {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
        
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };
        
        https.get(url, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    
                    if (jsonData.chart && jsonData.chart.result && jsonData.chart.result.length > 0) {
                        const result = jsonData.chart.result[0];
                        const meta = result.meta;
                        
                        resolve({
                            symbol: meta.symbol,
                            price: meta.regularMarketPrice || 0,
                            change: meta.regularMarketChange || 0,
                            changePercent: meta.regularMarketChangePercent || 0,
                            volume: meta.regularMarketVolume || 0,
                            high: meta.regularMarketDayHigh || 0,
                            low: meta.regularMarketDayLow || 0,
                            open: meta.regularMarketOpen || 0,
                            previousClose: meta.previousClose || 0
                        });
                    } else {
                        reject(new Error('No data found for symbol'));
                    }
                } catch (parseError) {
                    reject(parseError);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

// Generate technical analysis
function generateTechnicalAnalysis(symbol, stockData) {
    // Generate mock technical analysis based on current price
    const sma20 = stockData.price * (0.98 + Math.random() * 0.04);
    const sma50 = stockData.price * (0.96 + Math.random() * 0.08);
    const sma200 = stockData.price * (0.90 + Math.random() * 0.20);
    
    const rsi = 30 + Math.random() * 40; // RSI between 30-70
    const macd = (Math.random() - 0.5) * 2;
    const signal = macd * (0.8 + Math.random() * 0.4);
    
    const support = stockData.price * (0.92 + Math.random() * 0.04);
    const resistance = stockData.price * (1.04 + Math.random() * 0.04);
    
    const trend = stockData.change > 0 ? 'bullish' : stockData.change < -0.02 ? 'bearish' : 'neutral';

    return {
        symbol: symbol.toUpperCase(),
        movingAverages: {
            sma20: parseFloat(sma20.toFixed(2)),
            sma50: parseFloat(sma50.toFixed(2)),
            sma200: parseFloat(sma200.toFixed(2))
        },
        rsi: parseFloat(rsi.toFixed(2)),
        macd: {
            macd: parseFloat(macd.toFixed(4)),
            signal: parseFloat(signal.toFixed(4)),
            histogram: parseFloat((macd - signal).toFixed(4))
        },
        support: parseFloat(support.toFixed(2)),
        resistance: parseFloat(resistance.toFixed(2)),
        trend,
        analysis: {
            summary: `Technical analysis for ${symbol} shows ${trend} trend with RSI at ${rsi.toFixed(2)}.`,
            recommendation: trend === 'bullish' ? 'Consider buying on dips' : 
                           trend === 'bearish' ? 'Consider selling on rallies' : 
                           'Hold and monitor for clearer signals'
        }
    };
}
