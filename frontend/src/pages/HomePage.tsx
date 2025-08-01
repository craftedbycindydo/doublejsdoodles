import * as React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../components/ui/button"
import {
  Card,
  CardContent,
} from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { ImageGallery } from "../components/ui/image-gallery"
import { HeroImageGallery } from "../components/ui/hero-image-gallery"
import { api, type Litter } from "../lib/api"
import { Heart, Dog, Star, Users, Award, Phone, Mail, MapPin, Plane, Car, User, Truck, Navigation } from "lucide-react"

interface HeroImage {
  id: string
  image_url: string
  title?: string
  subtitle?: string
  alt_text: string
  is_active: boolean
  order: number
}

interface HomepageContent {
  hero_images: HeroImage[]
  sections: any[]
  meta_title?: string
  meta_description?: string
}

export function HomePage() {
  const [litters, setLitters] = useState<Litter[]>([])
  const [homepageContent, setHomepageContent] = useState<HomepageContent>({
    hero_images: [],
    sections: []
  })
  const [loading, setLoading] = useState(true)
  const [selectedPuppyData, setSelectedPuppyData] = useState<{puppyName: string; puppyColor: string; puppyStatus: string} | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [litterData, homepageData] = await Promise.all([
          api.getLitters(),
          fetchHomepageContent()
        ])
        setLitters(litterData.filter((litter: Litter) => litter.is_current))
        setHomepageContent(homepageData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchHomepageContent = async (): Promise<HomepageContent> => {
    try {
      return await api.getHomepageContent()
    } catch (error) {
      console.error("Failed to fetch homepage content:", error)
      return { hero_images: [], sections: [] }
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Expected Soon"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
  }

  const getAvailablePuppies = (puppies: Litter['puppies']) => {
    return puppies.filter(puppy => puppy.status === 'available').length
  }

  const handleSelectedPuppyChange = (puppyData: {puppyName: string; puppyColor: string; puppyStatus: string} | null) => {
    setSelectedPuppyData(puppyData)
  }

  // Clear selected puppy data when there are no litters
  useEffect(() => {
    if (litters.length === 0) {
      setSelectedPuppyData(null)
    }
  }, [litters])

  const getLitterImagesWithPuppyNames = (litter: Litter): { url: string; puppyName: string; puppyColor: string; puppyStatus: string }[] => {
    // Collect all puppy images with their associated puppy names
    const imagesWithNames = litter.puppies.flatMap(puppy => 
      (puppy.images || []).map(imageUrl => ({
        url: imageUrl,
        puppyName: puppy.name,
        puppyColor: puppy.color,
        puppyStatus: puppy.status
      }))
    );
    return imagesWithNames;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-breeder-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading our beautiful puppies...</p>
        </div>
      </div>
    )
  }

  const heroImages = homepageContent.hero_images?.filter(img => img.is_active) || []

  return (
    <div className="min-h-screen bg-breeder-gradient pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {heroImages.length > 0 ? (
          <div className="space-y-4">
            {/* Title above image container */}
            <div className="text-center pt-8 pb-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                Double Js Doodles
              </h1>
            </div>
            
            {/* Image container with proper aspect ratio and fit */}
            <div className="relative w-full h-[60vh] min-h-[400px] max-h-[80vh] overflow-hidden rounded-lg mx-auto max-w-7xl hero-image-container">
              <HeroImageGallery 
                images={heroImages.map(img => img.image_url)}
                alt="Double Js Doodles Hero"
                autoplay={true}
                autoplayInterval={5000}
                className="absolute inset-0 w-full h-full"
              />
            </div>
            
            {/* Content below image */}
            <div className="mt-8 px-8">
              <div className="text-center max-w-4xl mx-auto">
                <p className="text-xl md:text-2xl mb-6 text-foreground font-medium">
                  Premium Goldendoodle Breeder • Health Tested • Loving Homes
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="glass-button-primary text-lg px-8 py-6"
                    onClick={() => navigate('/litters')}
                  >
                    <Heart className="mr-2 h-5 w-5" />
                    View Available Puppies
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="glass-button text-lg px-8 py-6 border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => navigate('/contact')}
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Contact Us
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative h-[70vh] min-h-[500px] bg-gradient-to-br from-breeder-cream/40 via-breeder-beige/60 to-breeder-warm/80 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/15"></div>
            <div className="relative text-center max-w-4xl px-4 glass-card p-12 shadow-glass-lg">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
                Double Js Doodles
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
                Premium Goldendoodle Breeder • Health Tested • Loving Homes
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="glass-button-primary text-lg px-8 py-6"
                  onClick={() => navigate('/litters')}
                >
                  <Heart className="mr-2 h-5 w-5" />
                  View Available Puppies
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="glass-button text-lg px-8 py-6"
                  onClick={() => navigate('/contact')}
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Stats Section */}
      <section className="py-8 md:py-16 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <div className="text-center glass-card p-3 md:p-6 shadow-glass">
              <div className="mb-2 md:mb-4 mx-auto">
                <Award className="h-8 w-8 md:h-12 md:w-12 text-primary mx-auto" />
              </div>
              <div className="text-lg md:text-3xl lg:text-4xl font-bold text-foreground mb-1 md:mb-2">Preferred</div>
              <div className="text-sm md:text-base text-muted-foreground">Breeder</div>
              <div className="text-xs text-muted-foreground/80 mt-1">GoodDog Verified</div>
            </div>
            
            <div className="text-center glass-card p-3 md:p-6 shadow-glass">
              <div className="mb-2 md:mb-4 mx-auto">
                <Heart className="h-8 w-8 md:h-12 md:w-12 text-primary mx-auto" />
              </div>
              <div className="text-lg md:text-3xl lg:text-4xl font-bold text-foreground mb-1 md:mb-2">Health</div>
              <div className="text-sm md:text-base text-muted-foreground">Tested</div>
              <div className="text-xs text-muted-foreground/80 mt-1">PRA, DNA, Cardiac</div>
            </div>
            
            <div className="text-center glass-card p-3 md:p-6 shadow-glass">
              <div className="mb-2 md:mb-4 mx-auto">
                <Star className="h-8 w-8 md:h-12 md:w-12 text-primary mx-auto" />
              </div>
              <div className="text-lg md:text-3xl lg:text-4xl font-bold text-foreground mb-1 md:mb-2">$1,600</div>
              <div className="text-sm md:text-base text-muted-foreground">Pricing</div>
              <div className="text-xs text-muted-foreground/80 mt-1">$500 Deposit</div>
            </div>
            
            <div className="text-center glass-card p-3 md:p-6 shadow-glass">
              <div className="mb-2 md:mb-4 mx-auto">
                <Dog className="h-8 w-8 md:h-12 md:w-12 text-primary mx-auto" />
              </div>
              <div className="text-lg md:text-3xl lg:text-4xl font-bold text-foreground mb-1 md:mb-2">La Junta</div>
              <div className="text-sm md:text-base text-muted-foreground">Colorado</div>
              <div className="text-xs text-muted-foreground/80 mt-1">Our Location</div>
            </div>
          </div>
        </div>
      </section>

      {/* Current Litters Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Current Available Litters
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our beautiful, healthy puppies ready for their forever homes
            </p>
          </div>

          {litters.length > 0 ? (
            <div className="max-w-7xl mx-auto space-y-8">
              {litters.map((litter) => (
                <Card key={litter.id} className="breeder-card hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden" onClick={() => navigate('/litters')}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                                         {/* Image Gallery Section */}
                     <div 
                       className="relative"
                       onClick={(e) => e.stopPropagation()}
                     >
                       {(() => {
                         const litterImagesWithNames = getLitterImagesWithPuppyNames(litter);
                         return litterImagesWithNames.length > 0 ? (
                           <div className="relative">
                             <ImageGallery 
                               images={litterImagesWithNames}
                               alt={`${litter.name} litter puppies`}
                               className="w-full"
                               showThumbnails={true}
                               autoplay={false}
                               autoplayInterval={5000}
                               showPuppyNames={true}
                               onSelectedPuppyChange={handleSelectedPuppyChange}
                             />
                             <div className="absolute top-4 right-4 z-10">
                               <Badge className="bg-primary text-primary-foreground shadow-lg">
                                 {getAvailablePuppies(litter.puppies)} Available
                               </Badge>
                             </div>
                           </div>
                         ) : (
                           <div className="aspect-[4/3] glass-card flex items-center justify-center">
                             <Dog className="h-16 w-16 text-primary/60" />
                             <div className="absolute top-4 right-4">
                               <Badge className="bg-primary text-primary-foreground shadow-lg">
                                 {getAvailablePuppies(litter.puppies)} Available
                               </Badge>
                             </div>
                           </div>
                         );
                       })()}
                     </div>

                    {/* Content Section */}
                    <div 
                      className="p-6 lg:p-8 flex flex-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="mb-6">
                        <h3 className="text-2xl lg:text-3xl font-bold group-hover:text-primary transition-colors mb-2">
                          {litter.name}
                        </h3>
                        <p className="text-lg text-muted-foreground">
                          {litter.breed} • Generation {litter.generation}
                        </p>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between text-base">
                          <span className="text-muted-foreground">Born:</span>
                          <span className="font-medium">{formatDate(litter.birth_date)}</span>
                        </div>
                        <div className="flex items-center justify-between text-base">
                          <span className="text-muted-foreground">Total Puppies:</span>
                          <span className="font-medium">{litter.puppies.length}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="text-center p-3 glass-button rounded-lg">
                          <div className="text-xl font-bold text-primary">
                            {litter.puppies.filter(p => p.status === 'available').length}
                          </div>
                          <div className="text-sm text-muted-foreground">Available</div>
                        </div>
                        <div className="text-center p-3 glass-button rounded-lg">
                          <div className="text-xl font-bold text-primary/80">
                            {litter.puppies.filter(p => p.status === 'reserved').length}
                          </div>
                          <div className="text-sm text-muted-foreground">Reserved</div>
                        </div>
                        <div className="text-center p-3 glass-button rounded-lg">
                          <div className="text-xl font-bold text-muted-foreground">
                            {litter.puppies.filter(p => p.status === 'sold').length}
                          </div>
                          <div className="text-sm text-muted-foreground">Sold</div>
                        </div>
                      </div>

                      {/* Selected Puppy Details */}
                      {selectedPuppyData && (
                        <div className="mb-6 p-4 glass-card rounded-lg">
                          <h4 className="text-lg font-semibold text-primary mb-3">Selected Puppy</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Name:</span>
                              <span className="font-medium">{selectedPuppyData.puppyName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Color:</span>
                              <span className="font-medium">{selectedPuppyData.puppyColor}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Status:</span>
                              <span className={`font-medium capitalize ${
                                selectedPuppyData.puppyStatus === 'available' ? 'text-green-600' :
                                selectedPuppyData.puppyStatus === 'reserved' ? 'text-yellow-600' :
                                'text-gray-600'
                              }`}>
                                {selectedPuppyData.puppyStatus}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div 
                        className="space-y-3 mt-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button 
                          size="lg" 
                          className="w-full glass-button-primary gap-2 shadow-glass text-lg py-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/litters');
                          }}
                        >
                          <Heart className="h-5 w-5" />
                          View All Puppies
                        </Button>
                        <Button 
                          size="lg" 
                          variant="outline" 
                          className="w-full glass-button gap-2 shadow-glass text-lg py-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            const contactUrl = selectedPuppyData 
                              ? `/contact?litter=${encodeURIComponent(litter.name)}&puppy=${encodeURIComponent(selectedPuppyData.puppyName)}`
                              : `/contact?litter=${encodeURIComponent(litter.name)}`;
                            navigate(contactUrl);
                          }}
                        >
                          <Mail className="h-5 w-5" />
                          {selectedPuppyData ? `Contact About ${selectedPuppyData.puppyName}` : `Contact About This Litter`}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="breeder-card max-w-2xl mx-auto">
              <CardContent className="text-center py-12">
                <div className="floating">
                  <Dog className="h-16 w-16 text-primary/60 mx-auto mb-4" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Current Litters</h3>
                <p className="text-muted-foreground mb-6">
                  We don't have any litters available right now, but new ones are always on the way!
                </p>
                <Button onClick={() => navigate('/contact')} className="glass-button-primary gap-2 shadow-glass">
                  <Mail className="h-4 w-4" />
                  Get Notified of New Litters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="glass-card p-8 shadow-glass">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                About Double J's Doodles
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  Welcome to Double J's Doodles, where Joanna Spangler breeds exceptional Goldendoodles 
                  with love and dedication in La Junta, Colorado. Our mission is to provide families 
                  with healthy, well-socialized puppies that become cherished family members.
                </p>
                <p>
                  Every puppy is raised with love and care, comprehensive health 
                  testing, and early socialization. We believe in transparent breeding practices 
                  and lifelong support for our puppy families.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center gap-2 glass-button px-3 py-2 rounded-lg">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="font-medium">Health Tested Parents</span>
                  </div>
                  <div className="flex items-center gap-2 glass-button px-3 py-2 rounded-lg">
                    <Heart className="h-5 w-5 text-primary" />
                    <span className="font-medium">Home Raised</span>
                  </div>
                  <div className="flex items-center gap-2 glass-button px-3 py-2 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-medium">Early Socialization</span>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Button size="lg" onClick={() => navigate('/about')} className="glass-button-primary gap-2 shadow-glass">
                  Learn More About Us
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] glass-card rounded-2xl overflow-hidden shadow-glass-lg">
                {/* Meet the Breeder - Joanna Spangler */}
                <div className="w-full h-full relative">
                  <img 
                    src="https://tf-prod-bunny-pullzone-1.gooddog.com/images/0dw3quwpka7xeq62wcp7pk2a36sh?bounds=66-306x1174-1413&crop=300x300&type=smart"
                    alt="Joanna Spangler - Double J's Doodles Breeder"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <h3 className="text-white font-semibold text-lg">Meet Joanna Spangler</h3>
                    <p className="text-white/90 text-sm">Breeder, Double J's Doodles</p>
                    <p className="text-white/80 text-xs">La Junta, Colorado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pickup & Delivery Section */}
      <section className="py-8 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 md:mb-4">
              Location & Pickup Options
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              You can fly or drive to pick up your puppy from Joanna. Multiple convenient locations available.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Pickup Locations */}
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Puppy Pick-up Locations</h3>
              <p className="text-muted-foreground mb-4 md:mb-6">Joanna will coordinate all the details with you.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
                <Card className="breeder-card">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base truncate">La Junta, CO</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Joanna's location</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="breeder-card">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base truncate">Denver, CO</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">6 miles • Free</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="breeder-card">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Plane className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base truncate">DEN Airport</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">14 miles</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="breeder-card">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base truncate">Colorado Springs</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">68 miles • Free</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="breeder-card">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base truncate">Pueblo, CO</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">110 miles • Free</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="breeder-card">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Car className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base truncate">Flexible Point</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">Custom location</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Transport Options */}
            <div>
              <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Puppy Transport Options</h3>
              <p className="text-muted-foreground mb-4 md:mb-6">Joanna offers options to safely drop-off your new puppy.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 md:gap-6">
                <Card className="breeder-card">
                  <CardContent className="p-3 md:p-6">
                    <div className="flex items-start gap-2 md:gap-4">
                      <div className="w-8 h-8 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 md:h-6 md:w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base mb-1 md:mb-2">In-Person Pickup</h4>
                        <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
                          Visit breeder in La Junta, CO.
                        </p>
                        <div className="text-xs text-primary font-medium">RECOMMENDED</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="breeder-card">
                  <CardContent className="p-3 md:p-6">
                    <div className="flex items-start gap-2 md:gap-4">
                      <div className="w-8 h-8 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Truck className="h-4 w-4 md:h-6 md:w-6 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base mb-1 md:mb-2">Ground Transport</h4>
                        <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
                          Puppy transported via car or van.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="breeder-card">
                  <CardContent className="p-3 md:p-6">
                    <div className="flex items-start gap-2 md:gap-4">
                      <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Navigation className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base mb-1 md:mb-2">Meet Halfway</h4>
                        <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
                          Meet breeder and pup halfway.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="breeder-card">
                  <CardContent className="p-3 md:p-6">
                    <div className="flex items-start gap-2 md:gap-4">
                      <div className="w-8 h-8 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Plane className="h-4 w-4 md:h-6 md:w-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base mb-1 md:mb-2">Airport Pickup</h4>
                        <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
                          Meet at Denver Airport.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 text-center">
                <Button onClick={() => navigate('/contact')} className="glass-button-primary shadow-glass">
                  Discuss Pickup Options
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 md:mb-4">
              Ready to Find Your Perfect Puppy?
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Contact us today to learn more about our available puppies and upcoming litters
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto">
            <Card className="breeder-card text-center">
              <CardContent className="p-3 md:pt-6">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                  <Phone className="h-4 w-4 md:h-6 md:w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xs md:text-base mb-1 md:mb-2">Contact Us</h3>
                <p className="text-muted-foreground text-xs md:text-sm">Via Facebook</p>
              </CardContent>
            </Card>

            <Card className="breeder-card text-center">
              <CardContent className="p-3 md:pt-6">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                  <Mail className="h-4 w-4 md:h-6 md:w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xs md:text-base mb-1 md:mb-2">Follow Us</h3>
                <p className="text-muted-foreground text-xs md:text-sm">Page Updates</p>
              </CardContent>
            </Card>

            <Card className="breeder-card text-center">
              <CardContent className="p-3 md:pt-6">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                  <MapPin className="h-4 w-4 md:h-6 md:w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-xs md:text-base mb-1 md:mb-2">Visit Us</h3>
                <p className="text-muted-foreground text-xs md:text-sm">By appointment</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button size="lg" onClick={() => navigate('/contact')} className="glass-button-primary gap-2 shadow-glass-lg">
              <Mail className="h-5 w-5" />
              Send Us a Message
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}