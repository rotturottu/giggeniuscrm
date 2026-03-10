import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function NavigationTracker() {
  const location = useLocation();

  useEffect(() => {
    // This is where you will eventually put your own analytics or tracking code!
    // For now, it just silently watches the page changes without crashing.
    console.log("Navigated to:", location.pathname);
  }, [location]);

  return null;
}