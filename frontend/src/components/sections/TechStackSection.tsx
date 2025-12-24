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

function TechStackItem({ logo, name, alt, isLast }: { logo: string; name: string; alt: string; isLast?: boolean }) {
  return (
    <div className={`flex items-center space-x-2 md:space-x-3 px-3 md:px-4 lg:px-6 lg:px-8 flex-shrink-0 ${isLast ? 'mr-32 md:mr-20 lg:mr-0 xl:mr-0' : 'mr-16 md:mr-16 lg:mr-16 xl:mr-16'}`}>
      <img 
        src={logo} 
        alt={alt} 
        className="w-10 h-10 md:w-12 md:h-12 object-contain flex-shrink-0"
      />
      <span className="text-slate-700 font-semibold text-sm md:text-base whitespace-nowrap">{name}</span>
    </div>
  )
}

function SpacerItem() {
  return <div className="w-40 md:w-12 lg:w-8 xl:w-8 flex-shrink-0" />
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
                isLast={index === techStackItems.length - 1}
              />
            ))}
            <SpacerItem />
            {/* Extra spacer for mobile only */}
            <div className="md:hidden w-40 flex-shrink-0" />
            <div className="md:hidden w-40 flex-shrink-0" />
          </MarqueeItem>
          
          {/* Duplicate set for seamless loop */}
          <MarqueeItem>
            {/* Extra spacer for mobile only */}
            <div className="md:hidden w-40 flex-shrink-0" />
            <div className="md:hidden w-40 flex-shrink-0" />
            <SpacerItem />
            {techStackItems.map((item, index) => (
              <TechStackItem 
                key={`second-${index}`}
                logo={item.logo}
                name={item.name}
                alt={item.alt}
                isLast={index === techStackItems.length - 1}
              />
            ))}
          </MarqueeItem>
        </Marquee>
      </div>
    </div>
  )
}

