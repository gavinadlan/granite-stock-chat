// Protected route component
import { useState, useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { BoxLoader } from './BoxLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [showLoader, setShowLoader] = useState(true);
  const startTimeRef = useRef<number>(Date.now());

  // Smart delay: only add minimum delay if loading was too fast (< 500ms)
  // This prevents flash while not making fast loads feel slow
  useEffect(() => {
    if (isLoading) {
      startTimeRef.current = Date.now();
      setShowLoader(true);
    } else {
      const loadTime = Date.now() - startTimeRef.current;
      const minDisplayTime = 500; // Minimum 500ms to see the animation
      
      if (loadTime < minDisplayTime) {
        // If loading was too fast, add delay to reach minimum display time
        const remainingTime = minDisplayTime - loadTime;
        const timer = setTimeout(() => {
          setShowLoader(false);
        }, remainingTime);
        return () => clearTimeout(timer);
      } else {
        // If loading took longer, show immediately
        setShowLoader(false);
      }
    }
  }, [isLoading]);

  // Show loading spinner while checking authentication or during minimum loading time
  if (isLoading || showLoader) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <BoxLoader />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
