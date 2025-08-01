import * as React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Button } from "../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { api } from "../lib/api"

interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
  subject?: string
  puppy_name?: string
  litter_name?: string
}

export function ContactPage() {
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    subject: '',
    puppy_name: '',
    litter_name: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  // Pre-fill form if URL params exist - run on every searchParams change
  useEffect(() => {
    const puppyName = searchParams.get('puppy')
    const litterName = searchParams.get('litter')
    
    if (puppyName || litterName) {
      setFormData(prev => ({
        ...prev,
        puppy_name: puppyName || '',
        litter_name: litterName || '',
        subject: puppyName && litterName ? `${litterName}-${puppyName}` : 
                 puppyName ? `Inquiry about ${puppyName}` : 
                 litterName ? `Inquiry about ${litterName} litter` : prev.subject
      }))
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await api.submitContactForm(formData)
      
      if (response.success) {
        setSubmitStatus({
          type: 'success',
          message: response.message
        })
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
          subject: '',
          puppy_name: '',
          litter_name: ''
        })
      } else {
        throw new Error('Submission failed')
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Sorry, there was an error sending your message. Please try again or contact us directly.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Contact Us</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          We'd love to hear from you! Whether you're interested in a puppy, have questions 
          about our breeding program, or just want to say hello, we're here to help.
        </p>
      </section>

      {/* Main Form Section - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* Contact Form */}
        <Card className="breeder-card shadow-glass">
          <CardHeader>
            <CardTitle className="text-2xl">Send us a Message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="What's this about?"
                />
              </div>

              {/* Pre-fill fields if coming from puppy/litter page */}
              {(formData.puppy_name || formData.litter_name) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.puppy_name && (
                    <div>
                      <Label htmlFor="puppy_name">Puppy Interest</Label>
                      <Input
                        id="puppy_name"
                        name="puppy_name"
                        type="text"
                        value={formData.puppy_name}
                        onChange={handleInputChange}
                        placeholder="Which puppy interests you?"
                      />
                    </div>
                  )}
                  {formData.litter_name && (
                    <div>
                      <Label htmlFor="litter_name">Litter Interest</Label>
                      <Input
                        id="litter_name"
                        name="litter_name"
                        type="text"
                        value={formData.litter_name}
                        onChange={handleInputChange}
                        placeholder="Which litter interests you?"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself, your family, and what you're looking for in a puppy..."
                  rows={10}
                  className="min-h-[200px]"
                />
              </div>

              {submitStatus.type && (
                <div className={`p-4 rounded-lg ${
                  submitStatus.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  <p>{submitStatus.message}</p>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Get in Touch */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Get in Touch</CardTitle>
            <CardDescription>
              Prefer to contact us directly? Here are other ways to reach us.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 text-xl">📘</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">Facebook</h4>
                <p className="text-muted-foreground mb-1">
                  <a href="https://www.facebook.com/share/15gCm2ccV5/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                    Message us on Facebook
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">Primary contact method - We respond quickly!</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-xl">📱</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">Contact Form</h4>
                <p className="text-muted-foreground mb-1">Use the form on this page</p>
                <p className="text-sm text-muted-foreground">We'll respond as soon as possible via email</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-xl">📍</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">Location</h4>
                <p className="text-muted-foreground mb-1">La Junta, CO 81050</p>
                <p className="text-sm text-muted-foreground">Visits by appointment only - Come meet our dogs!</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Stay Updated</h4>
              <p className="text-sm text-blue-800 mb-3">
                Follow us on Facebook for puppy updates, training tips, and behind-the-scenes 
                glimpses of life at Double J's Doodles!
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-100"
                onClick={() => window.open('https://www.facebook.com/share/15gCm2ccV5/', '_blank')}
              >
                <span className="mr-2">📘</span>
                Follow on Facebook
              </Button>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="font-semibold text-amber-900 mb-2">Response Time</h4>
              <p className="text-sm text-amber-800">
                We typically respond to Facebook messages within a few hours and contact form 
                submissions within 24 hours. We're excited to hear from potential puppy families!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Sections - 3 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-1">When will my puppy be ready to go home?</h4>
              <p className="text-sm text-muted-foreground">
                Puppies are ready to go to their new families at 8 weeks of age, 
                after their first vaccinations and health check.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-1">Do you require a deposit?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, we require a $500 non-refundable deposit to reserve your puppy. 
                Total puppy price is $1,600 including the deposit.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-1">What comes with my puppy?</h4>
              <p className="text-sm text-muted-foreground">
                Your puppy comes with health certificates, first vaccinations, 
                microchip, puppy starter kit, and a blanket with mom and littermates' scent.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-1">How can I get my puppy?</h4>
              <p className="text-sm text-muted-foreground">
                Multiple options available: in-person pickup in La Junta, CO; ground transport; 
                meet halfway; or pickup in Denver, Colorado Springs, Pueblo, or Denver Airport.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pickup & Delivery Options */}
        <Card>
          <CardHeader className="pb-4 md:pb-6">
            <CardTitle className="text-lg md:text-xl">Pickup & Delivery Options</CardTitle>
            <CardDescription className="text-sm md:text-base">
              Convenient options to get your new puppy home safely
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              <div>
                <h4 className="font-semibold text-sm md:text-base mb-1 md:mb-2">Pickup Locations</h4>
                <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>• La Junta, CO</span>
                    <span className="text-xs">Joanna's location</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Denver, CO</span>
                    <span className="text-xs text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Denver Airport (DEN)</span>
                    <span className="text-xs">14 miles</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Colorado Springs, CO</span>
                    <span className="text-xs text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Pueblo, CO</span>
                    <span className="text-xs text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Flexible meeting point</span>
                    <span className="text-xs">By arrangement</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm md:text-base mb-1 md:mb-2">Transport Methods</h4>
                <div className="space-y-1 text-xs md:text-sm text-muted-foreground">
                  <div>• <strong>In-person pickup</strong> (Recommended)</div>
                  <div>• <strong>Ground transport</strong> via car/van</div>
                  <div>• <strong>Meet halfway</strong> between locations</div>
                  <div>• <strong>Airport pickup</strong> at Denver International</div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-2 md:p-3 rounded-lg mt-3 md:mt-4">
                <p className="text-xs md:text-sm text-blue-800">
                  <strong>Note:</strong> Joanna will coordinate all pickup details with you to ensure 
                  a smooth and safe experience for both you and your new puppy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health & Care Information */}
        <Card>
          <CardHeader>
            <CardTitle>Health & Care</CardTitle>
            <CardDescription>
              Our commitment to healthy, well-cared-for puppies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Health Testing</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• Progressive Retinal Atrophy (PRA)</div>
                <div>• DNA Disease Panel</div>
                <div>• Cardiac Evaluation</div>
                <div>• Eye Examination</div>
                <div>• Hip & Elbow Dysplasia</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-2">Socialization Program</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• Daily handling and interaction</div>
                <div>• Various sounds exposure</div>
                <div>• Socialized with children</div>
                <div>• Car rides experience</div>
                <div>• Initial potty training</div>
              </div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Preferred Breeder Status:</strong> Verified by GoodDog with comprehensive 
                health testing and exceptional care standards.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <section className="mt-8 md:mt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          <Card className="breeder-card shadow-glass text-center p-4 md:p-6">
            <CardHeader className="pb-3 md:pb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 glass-button rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <span className="text-2xl md:text-3xl">⚡</span>
              </div>
              <CardTitle className="text-base md:text-lg">Quick Response</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground">
                We typically respond to all inquiries within 24 hours. 
                We understand you're excited about finding your perfect puppy!
              </p>
            </CardContent>
          </Card>

          <Card className="breeder-card shadow-glass text-center p-4 md:p-6">
            <CardHeader className="pb-3 md:pb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 glass-button rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <span className="text-2xl md:text-3xl">🤝</span>
              </div>
              <CardTitle className="text-base md:text-lg">Personal Service</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground">
                We take time to get to know each family to ensure the best 
                match between puppies and their new homes.
              </p>
            </CardContent>
          </Card>

          <Card className="breeder-card shadow-glass text-center p-4 md:p-6 sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3 md:pb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 glass-button rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <span className="text-2xl md:text-3xl">💝</span>
              </div>
              <CardTitle className="text-base md:text-lg">Ongoing Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground">
                Our relationship doesn't end when your puppy goes home. 
                We're here to support you throughout your dog's lifetime.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}