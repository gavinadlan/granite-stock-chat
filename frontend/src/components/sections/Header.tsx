import { Button } from "@/components/ui/button"
import { Menu, X, User, LogOut, Settings, Edit } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Logo } from "@/components/brand/Logo"

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
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16"> {/* Fixed height untuk navbar */}
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleScrollToSection('hero')}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Home
            </button>
            <button 
              onClick={() => handleScrollToSection('features')}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Features
            </button>
            <button 
              onClick={() => handleScrollToSection('how-it-works')}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              How It Works
            </button>
            <button 
              onClick={() => handleScrollToSection('about')}
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              About
            </button>
          </nav>

          {/* Auth Buttons / User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              // Loading state - show skeleton to prevent flash
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
                <div className="w-20 h-4 bg-muted rounded animate-pulse"></div>
              </div>
            ) : isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-foreground" />
                  </div>
                  <span className="text-foreground font-medium">{user?.name}</span>
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg border border-border py-2">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center space-x-2"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </Link>
                    
                    <Link 
                      to="/settings" 
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center space-x-2"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    
                    <div className="border-t border-border mt-2 pt-2">
                      <button 
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center space-x-2"
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
                <Button variant="outline" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
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
              <X className="h-6 w-6 text-muted-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <button 
                onClick={() => handleScrollToSection('hero')}
                className="text-muted-foreground hover:text-foreground transition-colors text-left font-medium"
              >
                Home
              </button>
              <button 
                onClick={() => handleScrollToSection('features')}
                className="text-muted-foreground hover:text-foreground transition-colors text-left font-medium"
              >
                Features
              </button>
              <button 
                onClick={() => handleScrollToSection('how-it-works')}
                className="text-muted-foreground hover:text-foreground transition-colors text-left font-medium"
              >
                How It Works
              </button>
              <button 
                onClick={() => handleScrollToSection('about')}
                className="text-muted-foreground hover:text-foreground transition-colors text-left font-medium"
              >
                About
              </button>
              
              {/* Mobile Auth Buttons */}
              {isLoading ? (
                // Loading state - show skeleton
                <div className="mt-4 space-y-2">
                  <div className="px-4 py-2 bg-muted rounded-lg">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-32 bg-muted rounded animate-pulse"></div>
                  </div>
                  <div className="h-10 bg-muted rounded animate-pulse"></div>
                </div>
              ) : isAuthenticated ? (
                <div className="mt-4 space-y-2">
                  <div className="px-4 py-2 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
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