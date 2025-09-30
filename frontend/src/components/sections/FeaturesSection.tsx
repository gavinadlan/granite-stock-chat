import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Brain, BarChart3, Newspaper } from "lucide-react"

const features = [
  {
    icon: TrendingUp,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-100",
    title: "Real-time Prices",
    description: "Live stock prices, volume, market cap, and price changes from Yahoo Finance API. Get instant updates on any stock symbol with accurate market data."
  },
  {
    icon: Brain,
    iconColor: "text-purple-600",
    bgColor: "bg-purple-100",
    title: "AI Predictions",
    description: "IBM Granite AI analyzes historical patterns, market sentiment, and technical indicators to forecast future stock movements with confidence levels and detailed reasoning."
  },
  {
    icon: BarChart3,
    iconColor: "text-green-600",
    bgColor: "bg-green-100",
    title: "Technical Analysis",
    description: "Comprehensive technical indicators including RSI, MACD, moving averages, Bollinger Bands, and support/resistance levels for professional trading analysis."
  },
  {
    icon: Newspaper,
    iconColor: "text-orange-600",
    bgColor: "bg-orange-100",
    title: "Market News",
    description: "Latest news and sentiment analysis from News API, filtered by stock symbols. Stay informed with real-time market updates and company announcements."
  }
]

export function FeaturesSection() {
  return (
    <div id="features" className="py-48">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Powerful Features</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Comprehensive AI-powered tools for intelligent stock market analysis
          </p>
          <p className="text-base text-slate-500 max-w-3xl mx-auto">
            Our advanced platform combines cutting-edge artificial intelligence with real-time market data 
            to provide you with professional-grade analysis tools that help you make smarter investment decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`mx-auto w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <IconComponent className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
