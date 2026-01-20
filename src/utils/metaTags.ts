/**
 * Update Open Graph meta tags dynamically for better social sharing previews
 */

interface MetaTagData {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: string;
}

const DEFAULT_IMAGE = "/og-image.png";
const DEFAULT_DESCRIPTION = "Learn neuroscience through interactive simulations of the C. elegans worm brain.";

/**
 * Update meta tags for a specific page or content
 */
export function updateMetaTags(data: MetaTagData): void {
  const { title, description, url, image, type = "website" } = data;
  
  // Update document title
  document.title = `${title} | NeuroQuest`;
  
  // Helper to update or create meta tag
  const setMetaTag = (property: string, content: string, isName = false) => {
    const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
    let element = document.querySelector(selector) as HTMLMetaElement;
    
    if (!element) {
      element = document.createElement("meta");
      if (isName) {
        element.name = property;
      } else {
        element.setAttribute("property", property);
      }
      document.head.appendChild(element);
    }
    
    element.content = content;
  };
  
  // Open Graph tags
  setMetaTag("og:title", title);
  setMetaTag("og:description", description);
  setMetaTag("og:type", type);
  if (url) setMetaTag("og:url", url);
  setMetaTag("og:image", image || DEFAULT_IMAGE);
  
  // Twitter tags
  setMetaTag("twitter:title", title);
  setMetaTag("twitter:description", description);
  setMetaTag("twitter:image", image || DEFAULT_IMAGE);
  
  // Standard meta description
  setMetaTag("description", description, true);
}

/**
 * Update meta tags for a circuit detail page
 */
export function updateCircuitMetaTags(circuit: {
  id: string;
  title: string;
  description?: string | null;
  behavior: string;
  neurons_used: string[];
  profiles?: { display_name: string } | null;
}): void {
  const author = circuit.profiles?.display_name || "Anonymous";
  const description = circuit.description 
    || `A ${circuit.behavior} neural circuit using ${circuit.neurons_used.length} neurons, created by ${author} on NeuroQuest.`;
  
  const baseUrl = window.location.origin;
  const url = `${baseUrl}/community?circuit=${circuit.id}`;
  
  updateMetaTags({
    title: circuit.title,
    description,
    url,
    type: "article",
  });
}

/**
 * Reset meta tags to default values
 */
export function resetMetaTags(): void {
  updateMetaTags({
    title: "NeuroQuest - Explore the C. elegans Connectome",
    description: DEFAULT_DESCRIPTION,
    url: window.location.origin,
  });
}
