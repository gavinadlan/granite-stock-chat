import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Brain, BarChart3, Newspaper } from "lucide-react"

const features = [
  {
    icon: TrendingUp,
    title: "Market Prices",
    description: "Stock prices, volume and daily change from Yahoo Finance for US and Indonesian (IDX) tickers. Every number shows its source and time; free data may be delayed."
  },
  {
    icon: Brain,
    title: "AI Predictions",
    description: "IBM Granite explains the data in plain language and sketches a short-term scenario. Outlooks are clearly labelled as AI-generated and are never a guarantee."
  },
  {
    icon: BarChart3,
    title: "Technical Analysis",
    description: "Comprehensive technical indicators including RSI, MACD, moving averages, Bollinger Bands, and support/resistance levels for professional trading analysis."
  },
  {
    icon: Newspaper,
    title: "Market News",
    description: "Recent articles from NewsAPI filtered by ticker, with links to the original source. No made-up headlines: if there is no news, we tell you."
  }
]

export function FeaturesSection() {
  return (
    <div id="features" className="py-48">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-foreground">Powerful Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive AI-powered tools for intelligent stock market analysis
          </p>
          <p className="text-base text-muted-foreground max-w-3xl mx-auto">
            Our advanced platform combines cutting-edge artificial intelligence with public market data 
            to give you analysis tools for learning about the market. It is not investment advice.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card key={index} className="text-center transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-foreground" />
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
