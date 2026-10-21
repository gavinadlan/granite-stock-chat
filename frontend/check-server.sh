#!/bin/bash
echo "=== Checking Vite Dev Server ==="
echo ""

# Check if server is running
if lsof -ti:5173 > /dev/null 2>&1; then
    echo "✅ Server is running on port 5173"
    PID=$(lsof -ti:5173 | head -1)
    echo "   Process ID: $PID"
else
    echo "❌ Server is NOT running on port 5173"
    echo ""
    echo "Starting server..."
    npm run dev &
    sleep 3
fi

echo ""
echo "=== Testing Connection ==="
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Server responds at http://localhost:5173"
    echo ""
    echo "🌐 Open in browser: http://localhost:5173"
else
    echo "❌ Server not responding"
    echo ""
    echo "Try running: npm run dev"
fi

echo ""
echo "=== File Check ==="
if [ -f "src/components/StockSymbolTable.tsx" ]; then
    echo "✅ StockSymbolTable.tsx exists"
else
    echo "❌ StockSymbolTable.tsx missing"
fi

if [ -f "src/lib/usStocks.ts" ]; then
    echo "✅ usStocks.ts exists"
else
    echo "❌ usStocks.ts missing"
fi

