import { LogoLoop, type LogoItem } from "@/components/LogoLoop"

// Import images
import ibmGraniteLogo from "../image/ibm-granite.png"
import awsLogo from "../image/aws.png"
import yahooFinanceLogo from "../image/yahoo-finance.png"
import alphaVantageLogo from "../image/alpha-vantage.png"

const techStackItems = [
  {
    logo: ibmGraniteLogo,
    name: "IBM Granite AI",
    alt: "IBM Granite"
  },
  {
    logo: awsLogo,
    name: "AWS Lambda",
    alt: "AWS"
  },
  {
    logo: yahooFinanceLogo,
    name: "Yahoo Finance",
    alt: "Yahoo Finance"
  },
  {
    logo: alphaVantageLogo,
    name: "Alpha Vantage",
    alt: "Alpha Vantage"
  }
]

export function TechStackSection() {
  // Convert techStackItems to LogoLoop format with custom rendering
  const logos: LogoItem[] = techStackItems.map((item) => ({
    node: (
      <div className="flex items-center space-x-2 md:space-x-3 px-3 md:px-4 lg:px-6 flex-shrink-0">
        <img 
          src={item.logo} 
          alt={item.alt} 
          className="w-10 h-10 md:w-12 md:h-12 object-contain flex-shrink-0"
        />
        <span className="text-slate-700 dark:text-slate-200 font-semibold text-sm md:text-base whitespace-nowrap">
          {item.name}
        </span>
      </div>
    ),
    title: item.name,
    ariaLabel: item.name
  }))

  return (
    <div className="py-16 bg-slate-50 dark:bg-slate-800/50">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Powered by Leading Technologies</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Built with industry-leading AI, cloud, and data technologies
          </p>
        </div>
        
        {/* LogoLoop Container */}
        <LogoLoop
          logos={logos}
          speed={70}
          direction="left"
          logoHeight={35}
          gap={60}
          pauseOnHover={true}
          scaleOnHover={true}
          fadeOut={true}
          ariaLabel="Technology partners"
          className="w-full logoloop-techstack"
        />
      </div>
    </div>
  )
}

