export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold">Stock Market AI Assistant</h3>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Powered by IBM Granite AI, AWS Lambda, and real-time market data. 
            Make informed trading decisions with advanced AI analysis and comprehensive market insights.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-slate-400">
            <span>© 2025 Stock Market AI</span>
            <span>•</span>
            <span>Powered by IBM Granite AI</span>
            <span>•</span>
            <span>Real-time Data</span>
            <span>•</span>
            <span>Free to Use</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
