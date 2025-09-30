import { Button } from "@/components/ui/button"
import { TrendingUp, Menu, X } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"

interface HeaderProps {
  onScrollToSection: (sectionId: string) => void;
}

export function Header({ onScrollToSection }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleScrollToSection = (sectionId: string) => {
    onScrollToSection(sectionId)
    setIsMenuOpen(false) // Close mobile menu
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Stock AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleScrollToSection('hero')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => handleScrollToSection('features')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => handleScrollToSection('how-it-works')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              How It Works
            </button>
            <button 
              onClick={() => handleScrollToSection('about')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              About
            </button>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link to="/chat">Start Chatting</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-slate-600" />
            ) : (
              <Menu className="h-6 w-6 text-slate-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <button 
                onClick={() => handleScrollToSection('hero')}
                className="text-slate-600 hover:text-slate-900 transition-colors text-left"
              >
                Home
              </button>
              <button 
                onClick={() => handleScrollToSection('features')}
                className="text-slate-600 hover:text-slate-900 transition-colors text-left"
              >
                Features
              </button>
              <button 
                onClick={() => handleScrollToSection('how-it-works')}
                className="text-slate-600 hover:text-slate-900 transition-colors text-left"
              >
                How It Works
              </button>
              <button 
                onClick={() => handleScrollToSection('about')}
                className="text-slate-600 hover:text-slate-900 transition-colors text-left"
              >
                About
              </button>
              <Button asChild className="mt-4">
                <Link to="/chat" onClick={() => setIsMenuOpen(false)}>
                  Start Chatting
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
