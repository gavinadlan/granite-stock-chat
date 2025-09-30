import { Marquee, MarqueeItem } from "@/components/ui/marquee"

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

function TechStackItem({ logo, name, alt }: { logo: string; name: string; alt: string }) {
  return (
    <div className="flex items-center space-x-3">
      <img 
        src={logo} 
        alt={alt} 
        className="w-12 h-12 object-contain"
      />
      <span className="text-slate-700 font-semibold">{name}</span>
    </div>
  )
}

export function TechStackSection() {
  return (
    <div className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Powered by Leading Technologies</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Built with industry-leading AI, cloud, and data technologies
          </p>
        </div>
        
        {/* Marquee Container */}
        <Marquee pauseOnHover speed={30}>
          {/* First set of logos */}
          <MarqueeItem>
            {techStackItems.map((item, index) => (
              <TechStackItem 
                key={`first-${index}`}
                logo={item.logo}
                name={item.name}
                alt={item.alt}
              />
            ))}
          </MarqueeItem>
          
          {/* Duplicate set for seamless loop */}
          <MarqueeItem>
            {techStackItems.map((item, index) => (
              <TechStackItem 
                key={`second-${index}`}
                logo={item.logo}
                name={item.name}
                alt={item.alt}
              />
            ))}
          </MarqueeItem>
        </Marquee>
      </div>
    </div>
  )
}

