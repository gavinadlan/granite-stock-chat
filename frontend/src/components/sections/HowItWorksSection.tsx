const steps = [
  {
    number: 1,
    title: "Ask Questions",
    description: "Type your questions about stocks, prices, predictions, or market analysis. Our AI understands natural language and extracts relevant information automatically."
  },
  {
    number: 2,
    title: "AI Processing",
    description: "Our AI analyzes data from multiple sources including IBM Granite, AWS Lambda, Yahoo Finance, and News API to provide comprehensive insights."
  },
  {
    number: 3,
    title: "Get Results",
    description: "Receive detailed analysis, predictions, technical indicators, and news with confidence levels and actionable recommendations."
  }
]

export function HowItWorksSection() {
  return (
    <div id="how-it-works" className="py-48">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How It Works</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Simple 3-step process to get AI-powered stock analysis
          </p>
          <p className="text-base text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
            Our intelligent chatbot processes your requests using advanced AI algorithms, 
            combining multiple data sources to provide comprehensive market insights in seconds.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold dark:text-white">{step.title}</h3>
              <p className="text-slate-600 dark:text-slate-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

