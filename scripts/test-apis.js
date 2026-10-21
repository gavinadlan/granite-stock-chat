// Smoke-test third-party providers. Usage: node --env-file=backend/.env scripts/test-apis.js
// Test script untuk memverifikasi semua API connections
console.log('🔍 Testing API Connections...\n');

// Test RapidAPI (Yahoo Finance)
async function testRapidAPI() {
  console.log('📊 Testing RapidAPI (Yahoo Finance)...');
  try {
    const response = await fetch('https://yahoo-finance-real-time1.p.rapidapi.com/stock/get-detail?symbol=AAPL&lang=en-US&region=US', {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'yahoo-finance-real-time1.p.rapidapi.com'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ RapidAPI (Yahoo Finance): CONNECTED');
      console.log(`   AAPL Price: $${data.price?.regularMarketPrice || 'N/A'}`);
    } else {
      console.log('❌ RapidAPI (Yahoo Finance): FAILED');
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ RapidAPI (Yahoo Finance): ERROR');
    console.log(`   Error: ${error.message}`);
  }
}

// Test News API
async function testNewsAPI() {
  console.log('\n📰 Testing News API...');
  try {
    const response = await fetch(`https://newsapi.org/v2/everything?q=AAPL&apiKey=${process.env.NEWS_API_KEY}&sortBy=publishedAt&pageSize=1`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ News API: CONNECTED');
      console.log(`   Articles found: ${data.totalResults || 0}`);
    } else {
      console.log('❌ News API: FAILED');
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ News API: ERROR');
    console.log(`   Error: ${error.message}`);
  }
}

// Test Alpha Vantage
async function testAlphaVantage() {
  console.log('\n📈 Testing Alpha Vantage...');
  try {
    const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data['Global Quote']) {
        console.log('✅ Alpha Vantage: CONNECTED');
        console.log(`   AAPL Price: $${data['Global Quote']['05. price'] || 'N/A'}`);
      } else {
        console.log('❌ Alpha Vantage: FAILED - No data');
      }
    } else {
      console.log('❌ Alpha Vantage: FAILED');
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Alpha Vantage: ERROR');
    console.log(`   Error: ${error.message}`);
  }
}

// Test Replicate (IBM Granite)
async function testReplicate() {
  console.log('\n🤖 Testing Replicate (IBM Granite)...');
  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'ibm/granite-3.0-8b-instruct',
        input: {
          prompt: 'Test connection',
          max_tokens: 10
        }
      })
    });
    
    if (response.ok) {
      console.log('✅ Replicate (IBM Granite): CONNECTED');
    } else {
      console.log('❌ Replicate (IBM Granite): FAILED');
      console.log(`   Status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Replicate (IBM Granite): ERROR');
    console.log(`   Error: ${error.message}`);
  }
}

// Run all tests
async function runAllTests() {
  await testRapidAPI();
  await testNewsAPI();
  await testAlphaVantage();
  await testReplicate();
  
  console.log('\n🎯 API Connection Test Complete!');
}

runAllTests();
