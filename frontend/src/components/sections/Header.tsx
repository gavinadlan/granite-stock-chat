import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut, Settings, Edit } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import StockAILogo from "@/components/image/image.png"

interface HeaderProps {
  onScrollToSection: (sectionId: string) => void;
}

export function Header({ onScrollToSection }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  const handleScrollToSection = (sectionId: string) => {
    onScrollToSection(sectionId)
    setIsMenuOpen(false) // Close mobile menu
  }

  const handleLogout = () => {
    logout()
    setIsProfileDropdownOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm border-b dark:border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16"> {/* Fixed height untuk navbar */}
          {/* Logo dengan position absolute dan transform */}
          <Link 
            to="/" 
            className="flex items-center origin-left"
            style={{ 
              transform: 'scale(2.5)',
              marginLeft: '1.5rem'
            }}
          >
            <img 
              src={StockAILogo} 
              alt="Stock AI" 
              className="h-12 w-12 object-contain" // Base size lebih kecil untuk scaling yang lebih besar
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleScrollToSection('hero')}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
            >
              Home
            </button>
            <button 
              onClick={() => handleScrollToSection('features')}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
            >
              Features
            </button>
            <button 
              onClick={() => handleScrollToSection('how-it-works')}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
            >
              How It Works
            </button>
            <button 
              onClick={() => handleScrollToSection('about')}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors font-medium"
            >
              About
            </button>
          </nav>

          {/* Auth Buttons / User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              // Loading state - show skeleton to prevent flash
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
                <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
              </div>
            ) : isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-200 font-medium">{user?.name}</span>
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </Link>
                    
                    <Link 
                      to="/settings" 
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    
                    <div className="border-t border-slate-100 dark:border-slate-700 mt-2 pt-2">
                      <button 
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="outline" className="dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button className="dark:bg-blue-600 dark:hover:bg-blue-700" asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-slate-600 dark:text-slate-300" />
            ) : (
              <Menu className="h-6 w-6 text-slate-600 dark:text-slate-300" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t dark:border-slate-700">
            <nav className="flex flex-col space-y-4">
              <button 
                onClick={() => handleScrollToSection('hero')}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-left font-medium"
              >
                Home
              </button>
              <button 
                onClick={() => handleScrollToSection('features')}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-left font-medium"
              >
                Features
              </button>
              <button 
                onClick={() => handleScrollToSection('how-it-works')}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-left font-medium"
              >
                How It Works
              </button>
              <button 
                onClick={() => handleScrollToSection('about')}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-left font-medium"
              >
                About
              </button>
              
              {/* Mobile Auth Buttons */}
              {isLoading ? (
                // Loading state - show skeleton
                <div className="mt-4 space-y-2">
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  </div>
                  <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
              ) : isAuthenticated ? (
                <div className="mt-4 space-y-2">
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                  <Button asChild className="w-full">
                    <Link to="/chat" onClick={() => setIsMenuOpen(false)}>
                      Start Chatting
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={handleLogout} className="w-full">
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  <Button asChild className="w-full">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}