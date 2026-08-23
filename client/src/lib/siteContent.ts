export type SiteLink = {
  href: string;
  label: string;
};

export const primaryNavigation: SiteLink[] = [
  { href: "/#workspace", label: "Workspace" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const policyNavigation: SiteLink[] = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export const footerExploreLinks: SiteLink[] = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/#workspace", label: "Workspace" },
];

export const footerPolicyLinks: SiteLink[] = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of use" },
];

export const publicPageMetadata = {
  about: {
    eyebrow: "ABOUT THE PRODUCT",
    title: "Clear routes for media tasks that stay within service boundaries.",
    intro: "Background Removex helps people identify the right workflow for a media URL instead of treating every service the same.",
  },
  contact: {
    eyebrow: "CONTACT & SUPPORT",
    title: "Tell us what you need help with.",
    intro: "Send a clear description of your question, the source you selected, and the behavior you observed. Messages are retained so the site team can review the request.",
  },
  privacy: {
    eyebrow: "PRIVACY POLICY",
    title: "A plain-language view of how this site handles information.",
    intro: "This policy describes the current Background Removex product experience. It should be reviewed and adapted by the site owner for the jurisdictions and services in which the product operates.",
  },
  terms: {
    eyebrow: "TERMS OF USE",
    title: "Use the right source flow for content you are allowed to handle.",
    intro: "These terms establish the core rules for using the Background Removex workspace and its support features.",
  },
  search: {
    eyebrow: "SITE SEARCH",
    title: "Find the right page or workflow.",
    intro: "Search the site's core product, support, privacy, and use-policy pages.",
  },
} as const;

export type SearchItem = {
  title: string;
  description: string;
  href: string;
  keywords: string;
};

export const siteSearchItems: SearchItem[] = [
  { title: "Workspace", description: "Choose YouTube, Spotify, or Apple Music and start with the supported workflow.", href: "/#workspace", keywords: "home workspace youtube spotify apple music job url" },
  { title: "About", description: "Learn how the product separates authorized downloads from catalog and official-link workflows.", href: "/about", keywords: "about purpose authorized metadata service boundaries" },
  { title: "Contact support", description: "Send a question to the site team through the support form.", href: "/contact", keywords: "contact help support message" },
  { title: "Privacy policy", description: "Read how the product handles workflow details and support messages.", href: "/privacy", keywords: "privacy information data analytics logs" },
  { title: "Terms of use", description: "Review authorized-use rules and restrictions for supported workflows.", href: "/terms", keywords: "terms legal authorized use drm rules" },
];

export function searchSiteContent(query: string): SearchItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return siteSearchItems;
  return siteSearchItems.filter((item) => `${item.title} ${item.description} ${item.keywords}`.toLowerCase().includes(normalized));
}
