import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { api, type Litter, type Puppy } from "../lib/api"

export function LittersPage() {
  const [litters, setLitters] = useState<Litter[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'reserved' | 'sold'>('all')

  useEffect(() => {
    const fetchLitters = async () => {
      try {
        const litterData = await api.getLitters()
        setLitters(litterData)
      } catch (error) {
        console.error("Failed to fetch litters:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLitters()
  }, [])

  const formatDate = (dateString?: string) => {
    if (!dateString) return "TBD"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'glass-button-primary text-white'
      case 'reserved':
        return 'glass-button text-primary'
      case 'sold':
        return 'glass-button text-muted-foreground'
      default:
        return 'glass-button text-muted-foreground'
    }
  }

  const getBreedGradient = (breed: string) => {
    switch (breed.toLowerCase()) {
      case 'goldendoodle':
        return 'from-yellow-100 to-orange-100'
      case 'bernedoodle':
        return 'from-purple-100 to-pink-100'
      case 'labradoodle':
        return 'from-blue-100 to-cyan-100'
      default:
        return 'from-gray-100 to-gray-200'
    }
  }

  const filteredPuppies = (puppies: Puppy[]) => {
    if (filterStatus === 'all') return puppies
    return puppies.filter(puppy => puppy.status === filterStatus)
  }

  const getAvailableCount = (puppies: Puppy[]) => {
    return puppies.filter(puppy => puppy.status === 'available').length
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-20">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Litters</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Explore our current and upcoming litters of healthy, well-socialized puppies 
          ready to become cherished family members.
        </p>
      </section>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {(['all', 'available', 'reserved', 'sold'] as const).map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(status)}
            className={`capitalize ${filterStatus === status ? 'glass-button-primary' : 'glass-button'}`}
          >
            {status === 'all' ? 'All Puppies' : `${status} Puppies`}
          </Button>
        ))}
      </div>

      {/* Litters Grid */}
      {litters.length > 0 ? (
        <div className="space-y-12">
          {litters.map((litter) => (
            <section key={litter.id} className="glass-card shadow-glass rounded-2xl p-6">
              {/* Litter Header */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold">{litter.name}</h2>
                    <Badge variant="secondary" className="text-sm">
                      {litter.generation}
                    </Badge>
                    <Badge variant="outline">
                      {litter.breed}
                    </Badge>
                  </div>
                  <p className="text-lg text-muted-foreground">
                    {litter.birth_date ? `Born: ${formatDate(litter.birth_date)}` : `Expected: ${formatDate(litter.expected_date)}`}
                  </p>
                  {litter.description && (
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                      {litter.description}
                    </p>
                  )}
                </div>
                <div className="text-right mt-4 lg:mt-0">
                  <p className="text-2xl font-bold text-primary">
                    {getAvailableCount(litter.puppies)} Available
                  </p>
                  <p className="text-sm text-muted-foreground">
                    of {litter.puppies.length} total puppies
                  </p>
                </div>
              </div>

              {/* Puppies Grid */}
              {litter.puppies.length > 0 ? (
                <div>
                  <h3 className="text-2xl font-bold mb-6">
                    Puppies {filterStatus !== 'all' && `(${filterStatus})`}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPuppies(litter.puppies).map((puppy) => (
                      <Card key={puppy.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className={`h-48 bg-gradient-to-br ${getBreedGradient(litter.breed)} flex items-center justify-center`}>
                          {puppy.images.length > 0 ? (
                            <img 
                              src={puppy.images[0]} 
                              alt={puppy.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <p className="text-muted-foreground">Photo Coming Soon</p>
                          )}
                        </div>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{puppy.name}</CardTitle>
                            <Badge className={getStatusColor(puppy.status)}>
                              {puppy.status}
                            </Badge>
                          </div>
                          <CardDescription>
                            {puppy.gender} • {puppy.color}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <p>
                              <strong>Born:</strong> {formatDate(puppy.birth_date)}
                            </p>
                            {puppy.estimated_adult_weight && (
                              <p>
                                <strong>Est. Adult Weight:</strong> {puppy.estimated_adult_weight} lbs
                              </p>
                            )}
                            {puppy.notes && (
                              <p className="text-muted-foreground text-xs">
                                <strong>Notes:</strong> {puppy.notes}
                              </p>
                            )}
                          </div>
                          <div className="mt-4 space-y-2">
                            {puppy.status === 'available' ? (
                              <Button 
                                className="w-full" 
                                onClick={() => window.location.href = `/contact?puppy=${puppy.name}&litter=${litter.name}`}
                              >
                                Inquire About {puppy.name}
                              </Button>
                            ) : (
                              <Button variant="outline" className="w-full" disabled>
                                {puppy.status === 'reserved' ? 'Reserved' : 'No Longer Available'}
                              </Button>
                            )}
                            {puppy.images.length > 1 && (
                              <Button variant="outline" size="sm" className="w-full">
                                View More Photos ({puppy.images.length})
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {filteredPuppies(litter.puppies).length === 0 && (
                    <Card className="breeder-card shadow-glass text-center py-8">
                      <CardContent>
                        <p className="text-muted-foreground">
                          No {filterStatus === 'all' ? '' : filterStatus} puppies in this litter.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="breeder-card shadow-glass text-center py-8">
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Puppies not yet born. Expected {formatDate(litter.expected_date)}.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = `/contact?litter=${litter.name}`}
                      className="glass-button"
                    >
                      Join Waiting List
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Parent Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="text-pink-500 mr-2">♀</span>
                      Mother: {litter.mother.name}
                    </CardTitle>
                    <CardDescription>
                      {litter.mother.breed} • {litter.mother.color}
                      {litter.mother.weight && ` • ${litter.mother.weight} lbs`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {litter.mother.image_url && (
                      <div className="flex justify-center">
                        <img 
                          src={litter.mother.image_url} 
                          alt={litter.mother.name}
                          className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                        />
                      </div>
                    )}
                    {litter.mother.health_clearances.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Health Clearances:</p>
                        <div className="flex flex-wrap gap-1">
                          {litter.mother.health_clearances.map((clearance, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {clearance}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="text-blue-500 mr-2">♂</span>
                      Father: {litter.father.name}
                    </CardTitle>
                    <CardDescription>
                      {litter.father.breed} • {litter.father.color}
                      {litter.father.weight && ` • ${litter.father.weight} lbs`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {litter.father.image_url && (
                      <div className="flex justify-center">
                        <img 
                          src={litter.father.image_url} 
                          alt={litter.father.name}
                          className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                        />
                      </div>
                    )}
                    {litter.father.health_clearances.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Health Clearances:</p>
                        <div className="flex flex-wrap gap-1">
                          {litter.father.health_clearances.map((clearance, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {clearance}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Card className="breeder-card shadow-glass text-center py-16">
          <CardHeader>
            <CardTitle className="text-2xl text-muted-foreground">No Litters Available</CardTitle>
            <CardDescription>
              We're currently planning our next litters. Check back soon for updates!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/contact'} className="glass-button-primary shadow-glass">
              Join Our Waiting List
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Contact CTA */}
      <section className="text-center py-12 bg-muted rounded-lg mt-16">
        <h2 className="text-3xl font-bold mb-4">Interested in a Puppy?</h2>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          Contact us to learn more about our available puppies, reserve your spot on our waiting list, 
          or ask any questions about our breeding program.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => window.location.href = '/contact'}>
            Contact Us
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.location.href = '/about'}>
            Learn About Our Process
          </Button>
        </div>
      </section>
    </div>
  )
}