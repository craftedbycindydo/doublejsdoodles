from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse, Response
from datetime import datetime
import xml.etree.ElementTree as ET

router = APIRouter(prefix="/seo", tags=["seo"])

@router.get("/sitemap.xml", response_class=PlainTextResponse)
async def get_sitemap():
    """Generate dynamic sitemap.xml for SEO"""
    sitemap_content = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
  <!-- Homepage - Highest Priority -->
  <url>
    <loc>https://doublejsdoodles.com/</loc>
    <lastmod>{current_date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Main Pages -->
  <url>
    <loc>https://doublejsdoodles.com/litters</loc>
    <lastmod>{current_date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>https://doublejsdoodles.com/puppies</loc>
    <lastmod>{current_date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>https://doublejsdoodles.com/about</loc>
    <lastmod>{current_date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://doublejsdoodles.com/contact</loc>
    <lastmod>{current_date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Location-specific pages for SEO -->
  <url>
    <loc>https://doublejsdoodles.com/goldendoodle-breeder-colorado</loc>
    <lastmod>{current_date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://doublejsdoodles.com/goldendoodle-breeder-denver</loc>
    <lastmod>{current_date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://doublejsdoodles.com/goldendoodle-breeder-utah</loc>
    <lastmod>{current_date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>https://doublejsdoodles.com/goldendoodle-breeder-texas</loc>
    <lastmod>{current_date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>https://doublejsdoodles.com/golden-doodles-near-me</loc>
    <lastmod>{current_date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
</urlset>'''.format(current_date=datetime.now().strftime('%Y-%m-%d'))
    
    return sitemap_content

@router.get("/robots.txt", response_class=PlainTextResponse)
async def get_robots():
    """Generate robots.txt for SEO"""
    robots_content = '''# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin/*
Disallow: /api/

# Sitemap location
Sitemap: https://doublejsdoodles.com/sitemap.xml

# Optimize for specific search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Block common bad bots while allowing SEO bots
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: SemrushBot
Disallow: /'''
    
    return robots_content

@router.get("/location-meta/{location}")
async def get_location_meta(location: str):
    """Get SEO meta data for specific locations"""
    
    location_meta = {
        "colorado": {
            "title": "Goldendoodle Breeder Colorado - Double J's Doodles | Health Tested Puppies",
            "description": "Premier Goldendoodle breeder in Colorado. Serving Denver, Colorado Springs, Pueblo. Health tested, home-raised puppies from champion bloodlines.",
            "keywords": "goldendoodle breeder Colorado, goldendoodle puppies Colorado, Denver goldendoodle, Colorado Springs goldendoodle, Pueblo goldendoodle",
            "h1": "Premium Goldendoodle Breeder in Colorado",
            "content": "Located in La Junta, Colorado, Double J's Doodles serves families throughout Colorado including Denver, Colorado Springs, and Pueblo with premium Goldendoodle puppies.",
        },
        "denver": {
            "title": "Goldendoodle Breeder Near Denver Colorado - Double J's Doodles",
            "description": "Goldendoodle breeder serving Denver, Colorado. Airport pickup available. Health tested, champion bloodline puppies ready for Denver families.",
            "keywords": "goldendoodle Denver, goldendoodle breeder Denver, Denver goldendoodle puppies, DEN airport pickup goldendoodle",
            "h1": "Goldendoodle Breeder Serving Denver, Colorado",
            "content": "Serving Denver families with premium Goldendoodle puppies. Convenient Denver Airport pickup available. Drive to our La Junta location or meet us halfway.",
        },
        "utah": {
            "title": "Goldendoodle Breeder Serving Utah - Double J's Doodles Colorado",
            "description": "Colorado Goldendoodle breeder serving Utah families. Ground transport available. Health tested puppies from champion bloodlines.",
            "keywords": "goldendoodle Utah, goldendoodle breeder Utah, Utah goldendoodle puppies, Colorado goldendoodle Utah transport",
            "h1": "Goldendoodle Breeder Serving Utah Families",
            "content": "While located in Colorado, we proudly serve Utah families with our premium Goldendoodle puppies. Ground transport and meeting halfway options available.",
        },
        "texas": {
            "title": "Goldendoodle Breeder Serving Texas - Double J's Doodles Colorado",
            "description": "Colorado Goldendoodle breeder serving Texas families. Transport options available. Health tested, home-raised puppies from champion bloodlines.",
            "keywords": "goldendoodle Texas, goldendoodle breeder Texas, Texas goldendoodle puppies, Colorado goldendoodle Texas transport",
            "h1": "Goldendoodle Breeder Serving Texas Families",
            "content": "Proudly serving Texas families from our Colorado location. Multiple transport options available to bring your new Goldendoodle puppy safely to Texas.",
        },
        "golden-doodles-near-me": {
            "title": "Golden Doodles Near Me - Double J's Doodles Colorado, Utah, Texas",
            "description": "Looking for golden doodles near me? Double J's Doodles serves Colorado, Utah, and Texas with premium Goldendoodle puppies. Multiple pickup locations.",
            "keywords": "golden doodles near me, goldendoodle near me, goldendoodle puppies near me, local goldendoodle breeder",
            "h1": "Golden Doodles Near Me - Premium Breeder",
            "content": "Searching for 'golden doodles near me'? Double J's Doodles serves a wide area including Colorado, Utah, and Texas with convenient pickup and transport options.",
        }
    }
    
    if location.lower() not in location_meta:
        raise HTTPException(status_code=404, detail="Location not found")
    
    return location_meta[location.lower()]

@router.get("/schema-org/local-business")
async def get_local_business_schema():
    """Get structured data for local business"""
    schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": "https://doublejsdoodles.com",
        "name": "Double J's Doodles",
        "alternateName": "Double Js Doodles",
        "description": "Premium Goldendoodle breeder in Colorado serving Denver, Colorado Springs, Utah, and Texas. Health tested, home-raised puppies from champion bloodlines.",
        "url": "https://doublejsdoodles.com",
        "logo": "https://doublejsdoodles.com/logo512.png",
        "image": ["https://doublejsdoodles.com/logo512.png"],
        "telephone": "Contact via Facebook",
        "email": "Contact via website form",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "La Junta",
            "addressLocality": "La Junta",
            "addressRegion": "CO",
            "postalCode": "81050",
            "addressCountry": "US"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 37.9842,
            "longitude": -103.5472
        },
        "areaServed": [
            {"@type": "State", "name": "Colorado"},
            {"@type": "State", "name": "Utah"},
            {"@type": "State", "name": "Texas"},
            {"@type": "City", "name": "Denver", "addressRegion": "CO"},
            {"@type": "City", "name": "Colorado Springs", "addressRegion": "CO"},
            {"@type": "City", "name": "Pueblo", "addressRegion": "CO"}
        ],
        "founder": {
            "@type": "Person",
            "name": "Joanna Spangler",
            "jobTitle": "Professional Dog Breeder"
        },
        "foundingDate": "2020",
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Goldendoodle Puppies",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Product",
                        "name": "Goldendoodle Puppies",
                        "description": "Health tested, home-raised Goldendoodle puppies from champion bloodlines",
                        "category": "Pet"
                    },
                    "price": "1600",
                    "priceCurrency": "USD",
                    "availability": "InStock",
                    "areaServed": ["Colorado", "Utah", "Texas"]
                }
            ]
        },
        "knowsAbout": [
            "Goldendoodle breeding",
            "Dog health testing", 
            "Puppy socialization",
            "Pet care",
            "Dog training"
        ],
        "paymentAccepted": ["Cash", "Check", "Bank Transfer"],
        "priceRange": "$1600",
        "currenciesAccepted": "USD",
        "openingHours": "Mo-Su 09:00-18:00",
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "availableLanguage": "English"
        },
        "sameAs": [
            "https://www.facebook.com/doublejsdoodles",
            "https://www.gooddog.com/doublejsdoodles"
        ],
        "additionalType": "https://schema.org/PetStore"
    }
    
    return schema