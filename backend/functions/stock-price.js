// AWS Lambda function for stock price data
const https = require('https');

exports.handler = async (event) => {
    console.log('Stock Price Lambda invoked:', JSON.stringify(event, null, 2));
    
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

        // Get stock data from Yahoo Finance
        const stockData = await getStockData(symbol);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify(stockData)
        };
        
    } catch (error) {
        console.error('Error in stock price lambda:', error);
        
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
                        
                        const stockData = {
                            symbol: meta.symbol,
                            price: meta.regularMarketPrice || 0,
                            change: meta.regularMarketChange || 0,
                            changePercent: meta.regularMarketChangePercent || 0,
                            volume: meta.regularMarketVolume || 0,
                            high: meta.regularMarketDayHigh || 0,
                            low: meta.regularMarketDayLow || 0,
                            open: meta.regularMarketOpen || 0,
                            previousClose: meta.previousClose || 0,
                            marketCap: meta.marketCap,
                            pe: meta.trailingPE,
                            eps: meta.trailingEPS,
                            dividend: meta.dividendRate,
                            yield: meta.dividendYield
                        };
                        
                        resolve(stockData);
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
