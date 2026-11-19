// src/components/shared/SEO.tsx
import React, { useEffect } from 'react';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string[];
    ogImage?: string;
    canonicalUrl?: string;
    structuredData?: Record<string, unknown>; // Google Rich Snippets (JSON-LD) ke liye
}

const SITE_NAME = 'StayFlow';

const setMetaTag = (
    attr: 'name' | 'property',
    key: string,
    content: string
): void => {
    let element = document.querySelector<HTMLMetaElement>(
        `meta[${attr}="${key}"]`
    );
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
};

export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    ogImage,
    canonicalUrl,
    structuredData,
}) => {
    useEffect(() => {
        // 1. Page Title
        document.title = `${title} | ${SITE_NAME}`;

        // 2. Standard Meta Tags
        setMetaTag('name', 'description', description);
        if (keywords && keywords.length > 0) {
            setMetaTag('name', 'keywords', keywords.join(', '));
        }

        // 3. OpenGraph Tags (WhatsApp / LinkedIn preview)
        setMetaTag('property', 'og:title', `${title} | ${SITE_NAME}`);
        setMetaTag('property', 'og:description', description);
        setMetaTag('property', 'og:type', 'website');
        if (ogImage) {
            setMetaTag('property', 'og:image', ogImage);
        }

        // 4. Canonical URL (Duplicate content se bachne ke liye)
        if (canonicalUrl) {
            let link = document.querySelector<HTMLLinkElement>(
                'link[rel="canonical"]'
            );
            if (!link) {
                link = document.createElement('link');
                link.setAttribute('rel', 'canonical');
                document.head.appendChild(link);
            }
            link.setAttribute('href', canonicalUrl);
        }

        // 5. JSON-LD Structured Data (Google Search mein price/location dikhane ke liye)
        const scriptId = 'seo-structured-data';
        const existingScript = document.getElementById(scriptId);
        if (existingScript) existingScript.remove();

        if (structuredData) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(structuredData);
            document.head.appendChild(script);
        }

        return () => {
            const scriptToRemove = document.getElementById(scriptId);
            if (scriptToRemove) scriptToRemove.remove();
        };
    }, [title, description, keywords, ogImage, canonicalUrl, structuredData]);

    return null;
};