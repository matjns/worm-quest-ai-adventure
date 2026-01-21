import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  generateMetaTags, 
  applyMetaTags, 
  SEOConfig,
  generateCircuitStructuredData,
  generateEducationalStructuredData,
} from "@/utils/seoConfig";

/**
 * Hook for managing SEO meta tags based on current route
 */
export function useSEO(customConfig?: Partial<SEOConfig>) {
  const location = useLocation();

  useEffect(() => {
    // Determine page name from route
    const path = location.pathname;
    let pageName = 'home';
    
    if (path.startsWith('/play')) pageName = 'play';
    else if (path.startsWith('/learn')) pageName = 'learn';
    else if (path.startsWith('/chaos')) pageName = 'chaos';
    else if (path.startsWith('/race')) pageName = 'race';
    else if (path.startsWith('/community')) pageName = 'community';
    else if (path.startsWith('/research')) pageName = 'research';
    else if (path.startsWith('/certifications')) pageName = 'certifications';
    else if (path.startsWith('/enterprise')) pageName = 'enterprise';
    else if (path.startsWith('/teacher')) pageName = 'teacher';

    // Generate and apply meta tags
    const config = {
      ...generateMetaTags(pageName),
      ...customConfig,
      canonicalUrl: `${window.location.origin}${path}`,
    };

    applyMetaTags(config);

    // Cleanup on unmount
    return () => {
      // Reset to default when leaving page
      const defaultConfig = generateMetaTags('home');
      applyMetaTags(defaultConfig);
    };
  }, [location.pathname, customConfig]);
}

/**
 * Hook for setting circuit-specific SEO
 */
export function useCircuitSEO(circuit: {
  id: string;
  title: string;
  description?: string;
  neurons_used: string[];
  behavior: string;
  profiles?: { display_name: string } | null;
  created_at: string;
} | null) {
  useEffect(() => {
    if (!circuit) return;

    const config: SEOConfig = {
      title: `${circuit.title} | NeuroQuest Circuit`,
      description: circuit.description || 
        `A ${circuit.behavior} neural circuit using ${circuit.neurons_used.length} neurons. Built on NeuroQuest.`,
      keywords: [
        circuit.behavior,
        'neural circuit',
        'C. elegans',
        ...circuit.neurons_used.slice(0, 5),
      ],
      ogType: 'article',
      twitterCard: 'summary_large_image',
      canonicalUrl: `${window.location.origin}/community?circuit=${circuit.id}`,
    };

    applyMetaTags(config);

    // Add structured data
    const structuredData = generateCircuitStructuredData(circuit);
    let scriptTag = document.querySelector('#circuit-structured-data') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'circuit-structured-data';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = structuredData;

    return () => {
      scriptTag?.remove();
    };
  }, [circuit]);
}

/**
 * Hook for setting lesson-specific SEO
 */
export function useLessonSEO(lesson: {
  title: string;
  description: string;
  gradeLevel: string;
  duration: number;
} | null) {
  useEffect(() => {
    if (!lesson) return;

    const config: SEOConfig = {
      title: `${lesson.title} | NeuroQuest Lesson`,
      description: lesson.description,
      keywords: [
        'neuroscience lesson',
        lesson.gradeLevel,
        'C. elegans',
        'STEM education',
      ],
      ogType: 'article',
      twitterCard: 'summary_large_image',
    };

    applyMetaTags(config);

    // Add structured data
    const structuredData = generateEducationalStructuredData(lesson);
    let scriptTag = document.querySelector('#lesson-structured-data') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'lesson-structured-data';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = structuredData;

    return () => {
      scriptTag?.remove();
    };
  }, [lesson]);
}

export default useSEO;
