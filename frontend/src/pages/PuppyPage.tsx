import * as React from "react"
import { useParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { CalendarDays, Heart, Mail, Phone, User, Weight } from "lucide-react"
import { ContactForm } from "../components/ContactForm"
import { api, type Puppy, type Litter } from "../lib/api"

export function PuppyPage() {
  const { litterId, puppyId } = useParams<{ litterId: string; puppyId: string }>()
  const [litter, setLitter] = React.useState<Litter | null>(null)
  const [puppy, setPuppy] = React.useState<Puppy | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [showContactForm, setShowContactForm] = React.useState(false)

  React.useEffect(() => {
    const fetchPuppyData = async () => {
      if (!litterId || !puppyId) return

      try {
        const litterData = await api.getLitter(litterId)
        const puppyData = litterData.puppies.find(p => p.id === puppyId)
        
        setLitter(litterData)
        setPuppy(puppyData || null)
      } catch (error) {
        console.error('Error fetching puppy data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPuppyData()
  }, [litterId, puppyId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!litter || !puppy) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Puppy Not Found</h1>
          <p className="text-muted-foreground">The puppy you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'sold':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - birth.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} old`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} week${weeks !== 1 ? 's' : ''} old`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months !== 1 ? 's' : ''} old`
    } else {
      const years = Math.floor(diffDays / 365)
      return `${years} year${years !== 1 ? 's' : ''} old`
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Navigation */}
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => window.history.back()}
      >
        ← Back to Litter
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl">{puppy.name}</CardTitle>
                  <CardDescription className="text-lg">
                    {litter.breed} • {litter.generation} Generation
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(puppy.status)}>
                  {puppy.status.charAt(0).toUpperCase() + puppy.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Puppy Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {puppy.images.length > 0 ? (
                  puppy.images.map((image, index) => (
                    <div key={index} className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                      <img 
                        src={image} 
                        alt={`${puppy.name} - Photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))
                ) : (
                  <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Photos coming soon!</p>
                  </div>
                )}
              </div>

              {/* Puppy Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Gender:</span>
                  <span>{puppy.gender}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Color:</span>
                  <span>{puppy.color}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Born:</span>
                  <span>{formatDate(puppy.birth_date)} ({calculateAge(puppy.birth_date)})</span>
                </div>
                
                {puppy.estimated_adult_weight && (
                  <div className="flex items-center gap-2">
                    <Weight className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Est. Adult Weight:</span>
                    <span>{puppy.estimated_adult_weight} lbs</span>
                  </div>
                )}
              </div>

              {puppy.notes && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Special Notes</h3>
                  <p className="text-muted-foreground">{puppy.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parent Information */}
          <Card>
            <CardHeader>
              <CardTitle>Meet the Parents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Mom - {litter.mother.name}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Breed: {litter.mother.breed}</p>
                    <p>Color: {litter.mother.color}</p>
                    {litter.mother.weight && <p>Weight: {litter.mother.weight} lbs</p>}
                    {litter.mother.health_clearances.length > 0 && (
                      <p>Health Clearances: {litter.mother.health_clearances.join(', ')}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Dad - {litter.father.name}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Breed: {litter.father.breed}</p>
                    <p>Color: {litter.father.color}</p>
                    {litter.father.weight && <p>Weight: {litter.father.weight} lbs</p>}
                    {litter.father.health_clearances.length > 0 && (
                      <p>Health Clearances: {litter.father.health_clearances.join(', ')}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle>Interested in {puppy.name}?</CardTitle>
              <CardDescription>
                {puppy.status === 'available' 
                  ? "This adorable puppy is looking for their forever home!" 
                  : puppy.status === 'reserved'
                  ? "This puppy is currently reserved, but feel free to inquire about our waiting list."
                  : "This puppy has found their forever home, but we have other amazing puppies available!"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => setShowContactForm(true)}
                disabled={puppy.status === 'sold'}
              >
                <Mail className="mr-2 h-4 w-4" />
                Contact Us About {puppy.name}
              </Button>
              
              <Button variant="outline" className="w-full">
                <Phone className="mr-2 h-4 w-4" />
                Call Us
              </Button>
            </CardContent>
          </Card>

          {/* Litter Information */}
          <Card>
            <CardHeader>
              <CardTitle>{litter.name}</CardTitle>
              <CardDescription>
                {litter.breed} • {litter.generation} Generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {litter.birth_date && (
                <p className="text-sm text-muted-foreground mb-2">
                  Born: {formatDate(litter.birth_date)}
                </p>
              )}
              {litter.expected_date && (
                <p className="text-sm text-muted-foreground mb-2">
                  Expected: {formatDate(litter.expected_date)}
                </p>
              )}
              <p className="text-sm text-muted-foreground mb-4">
                {litter.puppies.length} puppies in this litter
              </p>
              
              <Button variant="outline" className="w-full">
                View All Litter Mates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <ContactForm 
          isOpen={showContactForm}
          onClose={() => setShowContactForm(false)}
          puppyName={puppy.name}
          litterName={litter.name}
        />
      )}
    </div>
  )
}