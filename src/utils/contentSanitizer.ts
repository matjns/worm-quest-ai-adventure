/**
 * Content Sanitization Utilities
 * XSS protection for shared user content - US-server data sovereignty compliance
 */

// Allowed HTML tags for rich text content
const ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'span'];

// Allowed attributes per tag
const ALLOWED_ATTRS: Record<string, string[]> = {
  'span': ['class'],
  'p': ['class'],
};

// Dangerous patterns to strip
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick, onload, etc.
  /data:/gi,
  /vbscript:/gi,
  /<iframe/gi,
  /<embed/gi,
  /<object/gi,
  /<link/gi,
  /<style/gi,
  /expression\s*\(/gi,
  /url\s*\(/gi,
];

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };
  
  return text.replace(/[&<>"'`=/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * Sanitize user-provided circuit titles
 */
export function sanitizeTitle(title: string, maxLength: number = 100): string {
  if (!title || typeof title !== 'string') return '';
  
  // Remove HTML and trim
  const clean = escapeHtml(title.trim());
  
  // Limit length
  return clean.slice(0, maxLength);
}

/**
 * Sanitize user-provided descriptions
 */
export function sanitizeDescription(description: string, maxLength: number = 500): string {
  if (!description || typeof description !== 'string') return '';
  
  // Remove HTML and trim
  let clean = description.trim();
  
  // Remove dangerous patterns
  DANGEROUS_PATTERNS.forEach(pattern => {
    clean = clean.replace(pattern, '');
  });
  
  // Escape remaining HTML
  clean = escapeHtml(clean);
  
  // Limit length
  return clean.slice(0, maxLength);
}

/**
 * Sanitize tags array
 */
export function sanitizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  
  return tags
    .filter((tag): tag is string => typeof tag === 'string')
    .map(tag => sanitizeTitle(tag, 30))
    .filter(tag => tag.length > 0)
    .slice(0, 10); // Max 10 tags
}

/**
 * Sanitize circuit data JSON
 */
export function sanitizeCircuitData(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null;
  
  try {
    // Re-serialize to strip prototype pollution and functions
    const cleaned = JSON.parse(JSON.stringify(data));
    
    // Validate it's still an object
    if (typeof cleaned !== 'object' || Array.isArray(cleaned)) return null;
    
    return cleaned;
  } catch {
    return null;
  }
}

/**
 * Sanitize URL for safe navigation
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  
  const trimmed = url.trim();
  
  // Only allow http, https, and relative URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      // Block dangerous protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return '';
      }
      return parsed.href;
    } catch {
      return '';
    }
  }
  
  // Allow relative URLs
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }
  
  return '';
}

/**
 * Validate and sanitize user ID format
 */
export function validateUserId(userId: unknown): string | null {
  if (!userId || typeof userId !== 'string') return null;
  
  // UUID v4 format check
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (uuidRegex.test(userId)) {
    return userId.toLowerCase();
  }
  
  return null;
}

/**
 * Sanitize shared circuit for display
 */
export function sanitizeSharedCircuit(circuit: Record<string, unknown>): Record<string, unknown> {
  return {
    ...circuit,
    title: sanitizeTitle(String(circuit.title || '')),
    description: sanitizeDescription(String(circuit.description || '')),
    tags: sanitizeTags(circuit.tags),
    circuit_data: sanitizeCircuitData(circuit.circuit_data),
    // Preserve safe fields
    id: circuit.id,
    user_id: validateUserId(circuit.user_id),
    neurons_used: Array.isArray(circuit.neurons_used) ? circuit.neurons_used : [],
    behavior: sanitizeTitle(String(circuit.behavior || ''), 50),
    created_at: circuit.created_at,
    updated_at: circuit.updated_at,
    likes_count: typeof circuit.likes_count === 'number' ? circuit.likes_count : 0,
    forks_count: typeof circuit.forks_count === 'number' ? circuit.forks_count : 0,
  };
}

/**
 * Check if content contains suspicious patterns (for logging/monitoring)
 */
export function detectSuspiciousContent(content: string): boolean {
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(content));
}

/**
 * Generate content hash for integrity verification
 */
export async function generateContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * US Data Sovereignty verification header
 */
export function getDataSovereigntyHeaders(): Record<string, string> {
  return {
    'X-Data-Sovereignty': 'US',
    'X-Processing-Location': 'United States',
    'X-Compliance': 'FISMA-Moderate',
  };
}
