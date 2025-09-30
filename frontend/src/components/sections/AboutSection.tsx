import { Badge } from "@/components/ui/badge"
import { CheckCircle, Star, Users, Shield, Clock } from "lucide-react"

const aboutFeatures = [
  {
    icon: Users,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-100",
    title: "User-Friendly",
    description: "Intuitive chat interface that makes complex financial analysis accessible to everyone. No technical knowledge required - just ask questions naturally."
  },
  {
    icon: Shield,
    iconColor: "text-green-600",
    bgColor: "bg-green-100",
    title: "Secure & Reliable",
    description: "Built on AWS infrastructure with enterprise-grade security and 99.9% uptime. Your data is protected with industry-standard encryption and security protocols."
  },
  {
    icon: Clock,
    iconColor: "text-purple-600",
    bgColor: "bg-purple-100",
    title: "Real-time Data",
    description: "Live market data updated every second from multiple trusted financial sources including Yahoo Finance, Alpha Vantage, and News API for accurate analysis."
  },
  {
    icon: Star,
    iconColor: "text-orange-600",
    bgColor: "bg-orange-100",
    title: "AI-Powered",
    description: "Advanced IBM Granite AI provides intelligent analysis and predictions with machine learning algorithms trained on vast financial datasets for accurate insights."
  }
]

const badges = [
  "Free to Use",
  "No Registration Required",
  "Real-time Updates",
  "AI-Powered Analysis"
]

export function AboutSection() {
  return (
    <div id="about" className="py-48">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-slate-900">About Our Platform</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Built with cutting-edge technology and AI innovation
          </p>
          <p className="text-base text-slate-500 max-w-3xl mx-auto">
            Our Stock Market AI Assistant leverages the power of IBM Granite AI, AWS Lambda, 
            and real-time market data APIs to deliver professional-grade financial analysis 
            accessible to everyone, from beginners to experienced traders.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {aboutFeatures.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div key={index} className="text-center space-y-4">
                <div className={`mx-auto w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center`}>
                  <IconComponent className={`h-8 w-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-slate-600">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        <div className="bg-slate-50 rounded-lg p-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-slate-900">Why Choose Our Platform?</h3>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Our Stock Market AI Assistant combines the power of artificial intelligence with real-time market data 
              to provide you with comprehensive analysis, accurate predictions, and actionable insights. 
              Whether you're a beginner investor or an experienced trader, our platform helps you make 
              informed decisions with confidence and precision.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {badges.map((badge, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

