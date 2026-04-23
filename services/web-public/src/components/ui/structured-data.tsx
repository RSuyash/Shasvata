import { siteConfig } from "@/content/site";

/**
 * Organization JSON-LD Schema
 * Establishes Shasvata as a recognized entity for search engines and AI systems.
 * Place in root layout to apply site-wide.
 */
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    alternateName: "Shasvata Private Limited",
    legalName: "Shasvata Private Limited",
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      "@id": `${siteConfig.url}/#logo`,
      url: `${siteConfig.url}/logo-icon.png`,
      contentUrl: `${siteConfig.url}/logo-icon.png`,
      width: 512,
      height: 512,
      caption: "Shasvata Logo",
    },
    image: `${siteConfig.url}/og-default.png`,
    description: siteConfig.description,
    foundingDate: "2024",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pune",
      addressRegion: "Maharashtra",
      addressCountry: {
        "@type": "Country",
        name: "India",
      },
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: siteConfig.email,
        url: `${siteConfig.url}/contact`,
        availableLanguage: ["English", "Hindi"],
      },
    ],
    sameAs: [
      siteConfig.social.linkedin,
      siteConfig.social.twitter,
      siteConfig.social.instagram,
    ].filter(Boolean),
    knowsAbout: [
      "Growth Marketing",
      "Fractional CMO",
      "AI Automation",
      "Growth Engineering",
      "B2B SaaS Marketing",
      "Startup Growth",
      "Marketing Technology",
      "Business Systems",
      "Workflow Automation",
    ],
    areaServed: {
      "@type": "GeoShape",
      name: "Worldwide",
    },
    slogan: siteConfig.tagline,
  };

  return (
    <script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * WebSite JSON-LD Schema
 * Provides site-level metadata for search features.
 */
export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    alternateName: `${siteConfig.name} - ${siteConfig.tagline}`,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      "@id": `${siteConfig.url}/#organization`,
    },
    inLanguage: "en-IN",
    copyrightYear: new Date().getFullYear(),
    copyrightHolder: {
      "@id": `${siteConfig.url}/#organization`,
    },
  };

  return (
    <script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
