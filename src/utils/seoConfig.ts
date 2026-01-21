/**
 * SEO Configuration & Meta Tag Management
 * Optimized for viral X (Twitter) sharing and search engine visibility
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterCreator?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

// Default SEO configuration for WormQuest
export const DEFAULT_SEO: SEOConfig = {
  title: "WormQuest - AI Nematode Sim: Decode Biology's Code",
  description: "Simulate organisms to decode biology. Learn neuroscience through interactive C. elegans brain simulations. 302 neurons, infinite discoveries. The AI learning platform of choice for educators, corporations, and individuals.",
  keywords: [
    "neuroscience education",
    "C. elegans",
    "connectome",
    "neural circuits",
    "OpenWorm",
    "brain simulation",
    "AI learning",
    "STEM education",
    "biology simulation",
    "worm brain",
    "computational neuroscience",
    "White House AI Challenge",
    "science education",
    "interactive learning",
  ],
  ogImage: "/og-image.png",
  ogType: "website",
  twitterCard: "summary_large_image",
  twitterCreator: "@realrealHeidi",
};

// Page-specific SEO configurations
export const PAGE_SEO: Record<string, Partial<SEOConfig>> = {
  home: {
    title: "WormQuest - AI Nematode Sim: Decode Biology's Code",
    description: "Simulate organisms to decode biology. The first complete brain simulation for K-12 and beyond. 302 neurons, OpenWorm-powered, AI-enhanced learning.",
  },
  play: {
    title: "Play & Learn | WormQuest",
    description: "Interactive neuroscience games for all ages. From Pre-K color matching to advanced circuit building. Learn from the lowly!",
  },
  learn: {
    title: "Learn Neuroscience | WormQuest",
    description: "Structured lessons on C. elegans neurobiology. From basic neurons to advanced connectome analysis.",
  },
  chaos: {
    title: "Chaos Simulation Lab | WormQuest",
    description: "Optimize dynamical systems via strange attractors. Worm proxy for supply-chain chaos modeling.",
  },
  race: {
    title: "Worm Racing | WormQuest",
    description: "Design neural circuits that make worms race! Compete with RL opponents and earn Chaos Tamer badges.",
  },
  community: {
    title: "Community Gallery | WormQuest",
    description: "Share and discover neural circuit designs. Fork, remix, and contribute to the OpenWorm project.",
  },
  research: {
    title: "Research Mode | WormQuest",
    description: "Contribute to real neuroscience research. Export NeuroML, validate against OpenWorm data.",
  },
  certifications: {
    title: "Micro-Credentials | WormQuest",
    description: "Earn stackable certifications in computational neuroscience. LinkedIn-ready badges, MOOC-enterprise compatible.",
  },
  enterprise: {
    title: "Enterprise & MOOC | WormQuest",
    description: "High-fidelity simulation tracks for Cyber Resilience, Drug Discovery, and Org Dynamics. Government and corporate training.",
  },
  teacher: {
    title: "Teacher Dashboard | WormQuest",
    description: "Manage classrooms, track student progress, assign modules. AI-powered learning analytics.",
  },
};

/**
 * Generate complete meta tags for a page
 */
export function generateMetaTags(pageName: string = 'home'): SEOConfig {
  const pageConfig = PAGE_SEO[pageName] || {};
  return {
    ...DEFAULT_SEO,
    ...pageConfig,
  };
}

/**
 * Apply meta tags to the document head
 */
export function applyMetaTags(config: SEOConfig): void {
  // Update document title
  document.title = config.title;

  // Helper to update or create meta tag
  const setMeta = (name: string, content: string, isProperty = false) => {
    const selector = isProperty 
      ? `meta[property="${name}"]` 
      : `meta[name="${name}"]`;
    let element = document.querySelector(selector) as HTMLMetaElement;
    
    if (!element) {
      element = document.createElement('meta');
      if (isProperty) {
        element.setAttribute('property', name);
      } else {
        element.name = name;
      }
      document.head.appendChild(element);
    }
    element.content = content;
  };

  // Standard meta tags
  setMeta('description', config.description);
  setMeta('keywords', config.keywords.join(', '));

  // Open Graph tags
  setMeta('og:title', config.title, true);
  setMeta('og:description', config.description, true);
  setMeta('og:type', config.ogType || 'website', true);
  setMeta('og:site_name', 'WormQuest', true);
  if (config.ogImage) {
    setMeta('og:image', `${window.location.origin}${config.ogImage}`, true);
  }
  if (config.canonicalUrl) {
    setMeta('og:url', config.canonicalUrl, true);
  }

  // Twitter/X tags for viral sharing
  setMeta('twitter:card', config.twitterCard || 'summary_large_image');
  setMeta('twitter:title', config.title);
  setMeta('twitter:description', config.description);
  if (config.ogImage) {
    setMeta('twitter:image', `${window.location.origin}${config.ogImage}`);
  }
  if (config.twitterCreator) {
    setMeta('twitter:creator', config.twitterCreator);
  }
  setMeta('twitter:site', '@realrealHeidi');

  // Additional SEO tags
  if (config.noIndex) {
    setMeta('robots', 'noindex, nofollow');
  } else {
    setMeta('robots', 'index, follow, max-image-preview:large');
  }

  // Canonical URL
  if (config.canonicalUrl) {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = config.canonicalUrl;
  }
}

/**
 * Generate structured data for circuits (JSON-LD)
 */
export function generateCircuitStructuredData(circuit: {
  id: string;
  title: string;
  description?: string;
  neurons_used: string[];
  behavior: string;
  profiles?: { display_name: string } | null;
  created_at: string;
}): string {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": circuit.title,
    "description": circuit.description || `A ${circuit.behavior} neural circuit simulation`,
    "creator": {
      "@type": "Person",
      "name": circuit.profiles?.display_name || "Anonymous",
    },
    "dateCreated": circuit.created_at,
    "educationalLevel": "HighSchool",
    "learningResourceType": "Simulation",
    "about": {
      "@type": "Thing",
      "name": "C. elegans Neural Circuit",
      "description": `Uses ${circuit.neurons_used.length} neurons for ${circuit.behavior} behavior`,
    },
    "provider": {
      "@type": "Organization",
      "name": "WormQuest",
      "url": "https://wormquest.app",
    },
  };

  return JSON.stringify(structuredData);
}

/**
 * Generate structured data for educational content
 */
export function generateEducationalStructuredData(lesson: {
  title: string;
  description: string;
  gradeLevel: string;
  duration: number;
}): string {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": lesson.title,
    "description": lesson.description,
    "provider": {
      "@type": "Organization",
      "name": "WormQuest",
      "sameAs": "https://wormquest.app",
    },
    "educationalLevel": lesson.gradeLevel,
    "timeRequired": `PT${lesson.duration}M`,
    "isAccessibleForFree": true,
    "inLanguage": "en-US",
    "about": [
      { "@type": "Thing", "name": "Neuroscience" },
      { "@type": "Thing", "name": "C. elegans" },
      { "@type": "Thing", "name": "Connectome" },
    ],
  };

  return JSON.stringify(structuredData);
}

/**
 * Share configuration for viral X posts
 */
export function getViralShareText(circuit?: { title: string; behavior: string }): string {
  const baseTexts = [
    "🧬 Just simulated a C. elegans brain on @WormQuest! 302 neurons, infinite discoveries. #AIEducation #WhiteHouseAIChallenge",
    "🪱 Decode biology's code with AI-powered worm brain simulations. This is the future of STEM education! #WormQuest #OpenWorm",
    "🧠 From strange attractors to neural circuits—learning neuroscience has never been this fun! @realrealHeidi #AILearning",
  ];

  if (circuit) {
    return `🧠 Check out my "${circuit.title}" circuit on WormQuest! It makes the worm ${circuit.behavior}. Build your own AI-powered simulation! #WormQuest #OpenWorm`;
  }

  return baseTexts[Math.floor(Math.random() * baseTexts.length)];
}
