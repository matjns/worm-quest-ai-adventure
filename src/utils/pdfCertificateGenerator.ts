/**
 * PDF Micro-Credential Certificate Generator
 * 
 * Generates professional PDF certificates for stackable credentials
 * that can be shared on LinkedIn and MOOC enterprise platforms.
 */

export interface CertificateData {
  recipientName: string;
  credentialName: string;
  credentialId: string;
  shortName: string;
  level: string;
  issueDate: string;
  expiryDate?: string;
  competencies: string[];
  endorsedBy: string[];
  linkedinSkills: string[];
  score?: number;
  verificationUrl: string;
}

export interface CertificateTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl?: string;
}

const DEFAULT_THEME: CertificateTheme = {
  primaryColor: "#0EA5E9",
  secondaryColor: "#1E3A5F",
  accentColor: "#22C55E",
  fontFamily: "Helvetica, Arial, sans-serif",
};

/**
 * Generate SVG-based certificate (can be converted to PDF client-side)
 */
export function generateCertificateSVG(
  data: CertificateData,
  theme: CertificateTheme = DEFAULT_THEME
): string {
  const { recipientName, credentialName, credentialId, shortName, level, issueDate, competencies, endorsedBy, score } = data;
  
  // Create decorative border pattern
  const borderPattern = `
    <pattern id="border-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
      <circle cx="10" cy="10" r="2" fill="${theme.accentColor}" opacity="0.3"/>
    </pattern>
  `;
  
  // Certificate SVG
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    ${borderPattern}
    <linearGradient id="header-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${theme.primaryColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${theme.secondaryColor};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="badge-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${theme.accentColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${theme.primaryColor};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="800" height="600" fill="#FFFFFF"/>
  
  <!-- Decorative border -->
  <rect x="20" y="20" width="760" height="560" fill="none" stroke="url(#border-pattern)" stroke-width="10"/>
  <rect x="30" y="30" width="740" height="540" fill="none" stroke="${theme.secondaryColor}" stroke-width="2"/>
  
  <!-- Header -->
  <rect x="50" y="50" width="700" height="80" fill="url(#header-gradient)" rx="5"/>
  
  <!-- OpenWorm Logo area -->
  <circle cx="100" cy="90" r="25" fill="#FFFFFF"/>
  <text x="100" y="97" font-family="${theme.fontFamily}" font-size="24" fill="${theme.primaryColor}" text-anchor="middle">🧬</text>
  
  <!-- Title -->
  <text x="400" y="85" font-family="${theme.fontFamily}" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">OPENWORM FOUNDATION</text>
  <text x="400" y="110" font-family="${theme.fontFamily}" font-size="12" fill="#FFFFFF" text-anchor="middle" opacity="0.9">Professional Micro-Credential Certificate</text>
  
  <!-- Main content -->
  <text x="400" y="170" font-family="${theme.fontFamily}" font-size="14" fill="${theme.secondaryColor}" text-anchor="middle">This certifies that</text>
  
  <!-- Recipient Name -->
  <text x="400" y="210" font-family="${theme.fontFamily}" font-size="32" font-weight="bold" fill="${theme.secondaryColor}" text-anchor="middle">${recipientName}</text>
  
  <text x="400" y="245" font-family="${theme.fontFamily}" font-size="14" fill="${theme.secondaryColor}" text-anchor="middle">has successfully completed the requirements for</text>
  
  <!-- Credential Name -->
  <text x="400" y="290" font-family="${theme.fontFamily}" font-size="28" font-weight="bold" fill="${theme.primaryColor}" text-anchor="middle">${credentialName}</text>
  
  <!-- Badge -->
  <circle cx="400" cy="350" r="40" fill="url(#badge-gradient)"/>
  <text x="400" y="345" font-family="${theme.fontFamily}" font-size="12" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${shortName}</text>
  <text x="400" y="362" font-family="${theme.fontFamily}" font-size="10" fill="#FFFFFF" text-anchor="middle">${level}</text>
  ${score ? `<text x="400" y="378" font-family="${theme.fontFamily}" font-size="10" fill="#FFFFFF" text-anchor="middle">${score}%</text>` : ''}
  
  <!-- Competencies -->
  <text x="150" y="420" font-family="${theme.fontFamily}" font-size="11" font-weight="bold" fill="${theme.secondaryColor}">Demonstrated Competencies:</text>
  ${competencies.slice(0, 4).map((comp, i) => 
    `<text x="150" y="${438 + i * 16}" font-family="${theme.fontFamily}" font-size="10" fill="${theme.secondaryColor}">• ${comp}</text>`
  ).join('\n')}
  
  <!-- Endorsements -->
  <text x="500" y="420" font-family="${theme.fontFamily}" font-size="11" font-weight="bold" fill="${theme.secondaryColor}">Endorsed By:</text>
  ${endorsedBy.slice(0, 4).map((org, i) => 
    `<text x="500" y="${438 + i * 16}" font-family="${theme.fontFamily}" font-size="10" fill="${theme.secondaryColor}">• ${org}</text>`
  ).join('\n')}
  
  <!-- Footer -->
  <line x1="150" y1="510" x2="300" y2="510" stroke="${theme.secondaryColor}" stroke-width="1"/>
  <text x="225" y="530" font-family="${theme.fontFamily}" font-size="10" fill="${theme.secondaryColor}" text-anchor="middle">Date Issued: ${issueDate}</text>
  
  <line x1="500" y1="510" x2="650" y2="510" stroke="${theme.secondaryColor}" stroke-width="1"/>
  <text x="575" y="530" font-family="${theme.fontFamily}" font-size="10" fill="${theme.secondaryColor}" text-anchor="middle">OpenWorm Foundation</text>
  
  <!-- Credential ID -->
  <text x="400" y="560" font-family="${theme.fontFamily}" font-size="9" fill="${theme.secondaryColor}" text-anchor="middle" opacity="0.7">Credential ID: ${credentialId} | Verify at: ${data.verificationUrl}</text>
  
  <!-- QR Code placeholder -->
  <rect x="710" y="510" width="40" height="40" fill="${theme.secondaryColor}" opacity="0.1"/>
  <text x="730" y="535" font-family="${theme.fontFamily}" font-size="8" fill="${theme.secondaryColor}" text-anchor="middle">QR</text>
</svg>`;
}

/**
 * Download certificate as SVG
 */
export function downloadCertificateSVG(data: CertificateData, filename: string = "certificate.svg"): void {
  const svg = generateCertificateSVG(data);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download certificate as PNG (using canvas)
 */
export async function downloadCertificatePNG(data: CertificateData, filename: string = "certificate.png"): Promise<void> {
  const svg = generateCertificateSVG(data);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      // White background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 800, 600);
      
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Could not create blob"));
          return;
        }
        
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(url);
        resolve();
      }, "image/png");
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load SVG image"));
    };
    
    img.src = url;
  });
}

/**
 * Generate LinkedIn badge URL for credential
 */
export function getLinkedInBadgeUrl(data: CertificateData): string {
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: data.credentialName,
    organizationName: "OpenWorm Foundation",
    issueYear: new Date(data.issueDate).getFullYear().toString(),
    issueMonth: (new Date(data.issueDate).getMonth() + 1).toString(),
    certUrl: data.verificationUrl,
    certId: data.credentialId,
  });
  
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

/**
 * Generate verification data for credential
 */
export function generateVerificationHash(data: CertificateData): string {
  // Simple hash for demo - in production use proper cryptographic signing
  const str = `${data.recipientName}|${data.credentialId}|${data.issueDate}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).toUpperCase();
}

/**
 * Generate full certificate data with auto-generated fields
 */
export function createCertificateData(
  recipientName: string,
  credential: {
    name: string;
    shortName: string;
    level: string;
    competencies: string[];
    endorsedBy: string[];
    linkedinSkills: string[];
  },
  score?: number
): CertificateData {
  const credentialId = `OWF-${credential.shortName}-${Date.now().toString(36).toUpperCase()}`;
  const issueDate = new Date().toISOString().split("T")[0];
  
  const data: CertificateData = {
    recipientName,
    credentialName: credential.name,
    credentialId,
    shortName: credential.shortName,
    level: credential.level,
    issueDate,
    competencies: credential.competencies,
    endorsedBy: credential.endorsedBy,
    linkedinSkills: credential.linkedinSkills,
    score,
    verificationUrl: `${window.location.origin}/verify/${credentialId}`,
  };
  
  return data;
}
