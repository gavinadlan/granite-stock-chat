// AWS Lambda function for market news
const https = require('https');

exports.handler = async (event) => {
    console.log('Market News Lambda invoked:', JSON.stringify(event, null, 2));
    
    try {
        // Parse the request
        const { query = 'stock market', symbol } = event.queryStringParameters || {};
        
        // Get news data
        const newsData = await getMarketNews(query, symbol);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify(newsData)
        };
        
    } catch (error) {
        console.error('Error in market news lambda:', error);
        
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

// Function to get market news
async function getMarketNews(query, symbol) {
    const newsApiKey = process.env.NEWS_API_KEY;
    
    if (!newsApiKey) {
        // Fallback to mock news if no API key
        return getMockNews();
    }
    
    try {
        const searchQuery = symbol ? `${symbol} stock` : query;
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&apiKey=${newsApiKey}&pageSize=10&sortBy=publishedAt`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`News API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status !== 'ok') {
            throw new Error(data.message || 'Failed to fetch news');
        }

        return data.articles.map(article => ({
            title: article.title,
            source: article.source.name,
            time: formatTimeAgo(new Date(article.publishedAt)),
            url: article.url,
            description: article.description
        }));
        
    } catch (error) {
        console.error('Error fetching news:', error);
        // Fallback to mock news
        return getMockNews();
    }
}

// Format time ago
function formatTimeAgo(date) {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
        return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
}

// Mock news data
function getMockNews() {
    return [
        { title: "Apple Reports Strong Q4 Earnings Beat Expectations", source: "Bloomberg", time: "2h ago" },
        { title: "Tesla Announces New Gigafactory in Mexico", source: "Reuters", time: "4h ago" },
        { title: "Microsoft Azure Revenue Surges 30% in Latest Quarter", source: "CNBC", time: "6h ago" },
        { title: "Google's AI Investments Drive Stock Price Higher", source: "Wall Street Journal", time: "8h ago" },
        { title: "Amazon Web Services Sees Record Growth", source: "Financial Times", time: "10h ago" },
        { title: "Meta's Reality Labs Division Shows Promising Results", source: "TechCrunch", time: "12h ago" }
    ];
}
