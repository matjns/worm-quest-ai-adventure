import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface AccessibilityContextType {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  screenReaderMode: boolean;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  toggleLargeText: () => void;
  toggleScreenReaderMode: () => void;
  announceToScreenReader: (message: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('a11y-high-contrast') === 'true';
  });
  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem('a11y-reduced-motion') === 'true' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [largeText, setLargeText] = useState(() => {
    return localStorage.getItem('a11y-large-text') === 'true';
  });
  const [screenReaderMode, setScreenReaderMode] = useState(() => {
    return localStorage.getItem('a11y-screen-reader') === 'true';
  });

  // Apply high contrast mode
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
    localStorage.setItem('a11y-high-contrast', String(highContrast));
  }, [highContrast]);

  // Apply reduced motion
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
    localStorage.setItem('a11y-reduced-motion', String(reducedMotion));
  }, [reducedMotion]);

  // Apply large text
  useEffect(() => {
    document.documentElement.classList.toggle('large-text', largeText);
    localStorage.setItem('a11y-large-text', String(largeText));
  }, [largeText]);

  // Apply screen reader mode
  useEffect(() => {
    document.documentElement.classList.toggle('screen-reader-mode', screenReaderMode);
    localStorage.setItem('a11y-screen-reader', String(screenReaderMode));
  }, [screenReaderMode]);

  // Global keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // Global shortcuts
      switch (e.key) {
        case '?':
          if (e.shiftKey) {
            // Show keyboard shortcuts help
            announceToScreenReader('Keyboard shortcuts: Press H for home, P for play, L for learn, Escape to close dialogs');
          }
          break;
        case 'h':
          if (e.altKey) {
            e.preventDefault();
            window.location.href = '/';
          }
          break;
        case 'p':
          if (e.altKey) {
            e.preventDefault();
            window.location.href = '/play';
          }
          break;
        case 'l':
          if (e.altKey) {
            e.preventDefault();
            window.location.href = '/learn';
          }
          break;
        case 'c':
          if (e.altKey) {
            e.preventDefault();
            setHighContrast(prev => !prev);
            announceToScreenReader(highContrast ? 'High contrast mode disabled' : 'High contrast mode enabled');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [highContrast]);

  const toggleHighContrast = useCallback(() => {
    setHighContrast(prev => !prev);
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setReducedMotion(prev => !prev);
  }, []);

  const toggleLargeText = useCallback(() => {
    setLargeText(prev => !prev);
  }, []);

  const toggleScreenReaderMode = useCallback(() => {
    setScreenReaderMode(prev => !prev);
  }, []);

  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        reducedMotion,
        largeText,
        screenReaderMode,
        toggleHighContrast,
        toggleReducedMotion,
        toggleLargeText,
        toggleScreenReaderMode,
        announceToScreenReader,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}
