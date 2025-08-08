import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  structuredData?: object
}

export function useSEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  twitterTitle,
  twitterDescription,
  twitterImage,
  structuredData
}: SEOProps) {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title
    }

    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name'
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement
      
      if (element) {
        element.content = content
      } else {
        element = document.createElement('meta')
        element.setAttribute(attribute, name)
        element.content = content
        document.head.appendChild(element)
      }
    }

    // Helper function to update or create link tags
    const updateLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement
      
      if (element) {
        element.href = href
      } else {
        element = document.createElement('link')
        element.rel = rel
        element.href = href
        document.head.appendChild(element)
      }
    }

    // Update basic meta tags
    if (description) updateMetaTag('description', description)
    if (keywords) updateMetaTag('keywords', keywords)

    // Update canonical URL
    if (canonicalUrl) updateLinkTag('canonical', canonicalUrl)

    // Update Open Graph tags
    if (ogTitle) updateMetaTag('og:title', ogTitle, true)
    if (ogDescription) updateMetaTag('og:description', ogDescription, true)
    if (ogImage) updateMetaTag('og:image', ogImage, true)
    if (ogUrl) updateMetaTag('og:url', ogUrl, true)

    // Update Twitter tags
    if (twitterTitle) updateMetaTag('twitter:title', twitterTitle)
    if (twitterDescription) updateMetaTag('twitter:description', twitterDescription)
    if (twitterImage) updateMetaTag('twitter:image', twitterImage)

    // Update structured data
    if (structuredData) {
      let scriptElement = document.querySelector('script[data-type="structured-data"]') as HTMLScriptElement
      
      if (scriptElement) {
        scriptElement.textContent = JSON.stringify(structuredData)
      } else {
        scriptElement = document.createElement('script')
        scriptElement.type = 'application/ld+json'
        scriptElement.setAttribute('data-type', 'structured-data')
        scriptElement.textContent = JSON.stringify(structuredData)
        document.head.appendChild(scriptElement)
      }
    }

    // Cleanup function
    return () => {
      // Optionally reset to default values when component unmounts
      // This might not be necessary for most SPAs
    }
  }, [
    title,
    description,
    keywords,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    twitterTitle,
    twitterDescription,
    twitterImage,
    structuredData
  ])
}

// Pre-defined SEO configurations for different locations
export const locationSEOConfig = {
  colorado: {
    title: "Goldendoodle Breeder Colorado - Double J's Doodles | Health Tested Puppies",
    description: "Premier Goldendoodle breeder in Colorado. Serving Denver, Colorado Springs, Pueblo. Health tested, home-raised puppies from champion bloodlines.",
    keywords: "goldendoodle breeder Colorado, goldendoodle puppies Colorado, Denver goldendoodle, Colorado Springs goldendoodle, Pueblo goldendoodle",
    canonicalUrl: "https://doublejsdoodles.com/goldendoodle-breeder-colorado",
    ogTitle: "Goldendoodle Breeder Colorado - Double J's Doodles",
    ogDescription: "Premier Goldendoodle breeder in Colorado. Serving Denver, Colorado Springs, Pueblo. Health tested, home-raised puppies from champion bloodlines.",
  },
  denver: {
    title: "Goldendoodle Breeder Near Denver Colorado - Double J's Doodles",
    description: "Goldendoodle breeder serving Denver, Colorado. Airport pickup available. Health tested, champion bloodline puppies ready for Denver families.",
    keywords: "goldendoodle Denver, goldendoodle breeder Denver, Denver goldendoodle puppies, DEN airport pickup goldendoodle",
    canonicalUrl: "https://doublejsdoodles.com/goldendoodle-breeder-denver",
    ogTitle: "Goldendoodle Breeder Near Denver Colorado - Double J's Doodles",
    ogDescription: "Goldendoodle breeder serving Denver, Colorado. Airport pickup available. Health tested, champion bloodline puppies ready for Denver families.",
  },
  utah: {
    title: "Goldendoodle Breeder Serving Utah - Double J's Doodles Colorado",
    description: "Colorado Goldendoodle breeder serving Utah families. Ground transport available. Health tested puppies from champion bloodlines.",
    keywords: "goldendoodle Utah, goldendoodle breeder Utah, Utah goldendoodle puppies, Colorado goldendoodle Utah transport",
    canonicalUrl: "https://doublejsdoodles.com/goldendoodle-breeder-utah",
    ogTitle: "Goldendoodle Breeder Serving Utah - Double J's Doodles Colorado",
    ogDescription: "Colorado Goldendoodle breeder serving Utah families. Ground transport available. Health tested puppies from champion bloodlines.",
  },
  texas: {
    title: "Goldendoodle Breeder Serving Texas - Double J's Doodles Colorado",
    description: "Colorado Goldendoodle breeder serving Texas families. Transport options available. Health tested, home-raised puppies from champion bloodlines.",
    keywords: "goldendoodle Texas, goldendoodle breeder Texas, Texas goldendoodle puppies, Colorado goldendoodle Texas transport",
    canonicalUrl: "https://doublejsdoodles.com/goldendoodle-breeder-texas",
    ogTitle: "Goldendoodle Breeder Serving Texas - Double J's Doodles Colorado",
    ogDescription: "Colorado Goldendoodle breeder serving Texas families. Transport options available. Health tested, home-raised puppies from champion bloodlines.",
  },
  'golden-doodles-near-me': {
    title: "Golden Doodles Near Me - Double J's Doodles Colorado, Utah, Texas",
    description: "Looking for golden doodles near me? Double J's Doodles serves Colorado, Utah, and Texas with premium Goldendoodle puppies. Multiple pickup locations.",
    keywords: "golden doodles near me, goldendoodle near me, goldendoodle puppies near me, local goldendoodle breeder",
    canonicalUrl: "https://doublejsdoodles.com/golden-doodles-near-me",
    ogTitle: "Golden Doodles Near Me - Double J's Doodles Colorado, Utah, Texas",
    ogDescription: "Looking for golden doodles near me? Double J's Doodles serves Colorado, Utah, and Texas with premium Goldendoodle puppies. Multiple pickup locations.",
  }
}

// Default SEO configuration
export const defaultSEOConfig = {
  title: "Double J's Doodles - Premium Goldendoodle Breeder Colorado | Golden Doodles Near Me | Denver, Utah, Texas",
  description: "Premium Goldendoodle breeder in Colorado serving Denver, Colorado Springs, Utah, and Texas. Health tested, home-raised puppies. Golden doodles near me - Double J's Doodles La Junta CO.",
  keywords: "goldendoodle breeder, golden doodles near me, goldendoodle puppies Colorado, goldendoodle breeder Colorado, goldendoodle puppies Denver, goldendoodle Utah, goldendoodle Texas, La Junta Colorado breeder, health tested goldendoodle, home raised puppies",
  canonicalUrl: "https://doublejsdoodles.com",
  ogTitle: "Double J's Doodles - Premium Goldendoodle Breeder Colorado",
  ogDescription: "Premium Goldendoodle breeder in Colorado serving Denver, Colorado Springs, Utah, and Texas. Health tested, home-raised puppies ready for loving homes.",
  ogImage: "https://doublejsdoodles.com/logo512.png",
  ogUrl: "https://doublejsdoodles.com",
  twitterTitle: "Double J's Doodles - Premium Goldendoodle Breeder Colorado",
  twitterDescription: "Premium Goldendoodle breeder in Colorado serving Denver, Colorado Springs, Utah, and Texas. Health tested, home-raised puppies.",
  twitterImage: "https://doublejsdoodles.com/logo512.png"
}