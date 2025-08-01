import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';
import { Dialog, DialogContent } from './dialog';

interface PuppyImageData {
  url: string;
  puppyName: string;
  puppyColor: string;
  puppyStatus: string;
}

interface ImageGalleryProps {
  images: string[] | PuppyImageData[];
  alt?: string;
  className?: string;
  showThumbnails?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  showPuppyNames?: boolean;
  onSelectedPuppyChange?: (puppyData: PuppyImageData | null) => void;
}

export function ImageGallery({ 
  images, 
  alt = "Gallery image", 
  className,
  showThumbnails = true,
  autoplay = false,
  autoplayInterval = 5000,
  showPuppyNames = false,
  onSelectedPuppyChange
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState<{ [key: number]: boolean }>({});

  // Helper functions to handle both string[] and PuppyImageData[] types
  const getImageUrl = (index: number): string => {
    const image = images[index];
    return typeof image === 'string' ? image : image.url;
  };

  const getPuppyData = React.useCallback((index: number): PuppyImageData | null => {
    const image = images[index];
    return typeof image === 'string' ? null : image;
  }, [images]);

  // Call callback when selected image changes or on initial load
  React.useEffect(() => {
    if (onSelectedPuppyChange && images.length > 0) {
      const currentPuppyData = getPuppyData(currentIndex);
      onSelectedPuppyChange(currentPuppyData);
    }
  }, [currentIndex, onSelectedPuppyChange, images, getPuppyData]);

  // Auto-play functionality
  React.useEffect(() => {
    if (!autoplay || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [autoplay, autoplayInterval, images.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageLoad = (index: number) => {
    setIsLoading(prev => ({ ...prev, [index]: false }));
  };

  const handleImageLoadStart = (index: number) => {
    setIsLoading(prev => ({ ...prev, [index]: true }));
  };

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn("relative group p-2", className)}>
        {/* Main Image Display */}
        <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
          {isLoading[currentIndex] && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          {/* Image container with smooth transitions */}
          <div className="relative w-full h-full overflow-hidden">
            {images.map((image, index) => {
              const puppyData = getPuppyData(index);
              return (
                <div key={index} className="absolute inset-0">
                  <img
                    src={getImageUrl(index)}
                    alt={`${alt} ${index + 1}`}
                    className={cn(
                      "w-full h-full object-cover transition-all duration-500 ease-in-out",
                      index === currentIndex 
                        ? "opacity-100 transform scale-100" 
                        : "opacity-0 transform scale-[1.02]"
                    )}
                    onLoad={() => handleImageLoad(index)}
                    onLoadStart={() => handleImageLoadStart(index)}
                  />
                  {/* Puppy name overlay - small rounded circle */}
                  {showPuppyNames && puppyData && index === currentIndex && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                      <div className="bg-gradient-to-r from-primary/90 to-primary/80 text-primary-foreground px-3 py-1.5 rounded-full backdrop-blur-sm shadow-lg border border-primary/20">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-sm">{puppyData.puppyName}</div>
                          <div className={cn(
                            "px-1.5 py-0.5 rounded-full text-xs font-medium border border-black",
                            puppyData.puppyStatus === 'available' ? "bg-green-500 text-white" :
                            puppyData.puppyStatus === 'reserved' ? "bg-yellow-500 text-black" :
                            "bg-gray-500 text-white"
                          )}>
                            {puppyData.puppyStatus.charAt(0).toUpperCase() + puppyData.puppyStatus.slice(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          

          
          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
        
        {/* Thumbnail Strip */}
        {showThumbnails && images.length > 1 && (
          <div 
            className="mt-6 flex gap-2 overflow-x-auto pb-3 px-2 pt-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((image, index) => (
              <button
                key={index}
                className={cn(
                  "flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-300 ease-in-out transform",
                  index === currentIndex
                    ? "border-primary ring-2 ring-primary/20 scale-[1.03]"
                    : "border-transparent hover:border-muted-foreground/50 hover:scale-[1.01]"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
              >
                <img
                  src={getImageUrl(index)}
                  alt={`${alt} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 ease-in-out"
                />
              </button>
            ))}
          </div>
        )}
        
        {/* Dot indicators for mobile */}
        {images.length > 1 && (
          <div className="flex justify-center mt-4 gap-2 sm:hidden">
            {images.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex
                    ? "bg-primary"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Fullscreen Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-7xl w-screen h-screen p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            
            <img
              src={getImageUrl(currentIndex)}
              alt={`${alt} ${currentIndex + 1} - Fullscreen`}
              className="max-w-full max-h-full object-contain"
            />
            
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Simplified version for small spaces
export function ImageCarousel({ 
  images, 
  alt = "Carousel image", 
  className,
  aspectRatio = "aspect-[4/3]",
  autoplay = false,
  autoplayInterval = 5000
}: {
  images: string[];
  alt?: string;
  className?: string;
  aspectRatio?: string;
  autoplay?: boolean;
  autoplayInterval?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play functionality
  React.useEffect(() => {
    if (!autoplay || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [autoplay, autoplayInterval, images.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) {
    return (
      <div className={cn("flex items-center justify-center bg-muted rounded-lg", aspectRatio, className)}>
        <p className="text-muted-foreground text-sm">No images</p>
      </div>
    );
  }

  return (
    <div className={cn("relative group", className)}>
      <div className={cn("relative bg-muted rounded-lg overflow-hidden", aspectRatio)}>
        <img
          src={images[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
        
        {images.length > 1 && (
          <>
            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
              {currentIndex + 1}/{images.length}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
} 