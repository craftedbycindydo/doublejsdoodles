import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

/**
 * HeroImageGallery - Enhanced image gallery component specifically for homepage hero sections
 * 
 * Features:
 * - Object-fit: contain to show complete images without cropping
 * - Auto-play with pause on hover
 * - Smooth slide animations
 * - Minimal dark overlay (5%)
 * - Responsive design
 * - No click-to-view or navigation arrows (clean presentation)
 */

interface HeroImageGalleryProps {
  images: string[];
  alt?: string;
  className?: string;
  autoplay?: boolean;
  autoplayInterval?: number;
  onImageChange?: (currentImage: string) => void;
}

export function HeroImageGallery({ 
  images, 
  alt = "Hero image", 
  className,
  autoplay = true,
  autoplayInterval = 5000,
  onImageChange
}: HeroImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get current image
  const currentImage = images[currentIndex];

  // Notify parent of image change for blurred background
  useEffect(() => {
    if (onImageChange && currentImage) {
      onImageChange(currentImage);
    }
  }, [currentImage, onImageChange]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoplay || images.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, autoplayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoplay, autoplayInterval, images.length]);

  // Pause autoplay on hover
  const handleMouseEnter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (autoplay && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, autoplayInterval);
    }
  };

  if (!images.length) return null;

  return (
    <div 
      className={cn("relative group", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Image Display with slide animation */}
      <div className="relative w-full h-full overflow-hidden rounded-lg">
        <div className="relative w-full h-full">
          {images.map((image, index) => (
            <div
              key={index}
              className={cn(
                "absolute inset-0 transition-all duration-700 ease-in-out",
                index === currentIndex 
                  ? "translate-x-0 opacity-100" 
                  : index < currentIndex 
                    ? "-translate-x-full opacity-0" 
                    : "translate-x-full opacity-0"
              )}
            >
              <img
                src={image}
                alt={`${alt} ${index + 1}`}
                className="w-full h-full object-contain"
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
        
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-black/5" />
        
        {/* Image indicators - only show if multiple images */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentIndex 
                    ? "bg-black w-8" 
                    : "bg-black/50 hover:bg-black/75"
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 