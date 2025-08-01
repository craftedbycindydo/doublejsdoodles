import * as React from "react"
import { Button } from "../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"

export function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16 mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">About Double J's Doodles</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          I'm Joanna Spangler, the breeder behind Double J's Doodles located in La Junta, CO. 
          The sweet, loyal, and playful disposition of our Goldendoodles inspired us to begin 
          responsibly breeding to expand the breed and share them with others.
        </p>
      </section>

      {/* Our Story Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Meet Joanna Spangler</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Welcome to Double J's Doodles, located in the heart of La Junta, Colorado. 
                I'm the breeder behind this dedicated Goldendoodle breeding program, inspired by 
                the sweet, loyal, and playful disposition of these amazing dogs.
              </p>
              <p>
                Our breeding program began as a passion project rooted in our love for Goldendoodles 
                and our commitment to responsible breeding practices. We focus on producing healthy, 
                well-socialized puppies with exceptional temperaments that make wonderful family companions.
              </p>
              <p>
                As a verified preferred breeder, we are committed to transparency and building lasting 
                relationships with our puppy families. Our goal is not just to breed beautiful dogs, 
                but to match each puppy with the perfect family where they will thrive for their entire life.
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🏔️</div>
            <h3 className="text-xl font-semibold mb-2">Colorado Raised</h3>
            <p className="text-muted-foreground">
              Our puppies are raised in La Junta, Colorado with plenty of love, socialization, 
              and all the care they need to become wonderful family companions.
            </p>
          </div>
        </div>
      </section>

      {/* Location & Experience Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="breeder-card shadow-glass text-center p-6">
            <CardHeader>
              <div className="w-16 h-16 glass-button rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📍</span>
              </div>
              <CardTitle className="text-lg">La Junta, Colorado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Located in La Junta, Colorado, serving families throughout Colorado 
                and surrounding states.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardHeader>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏆</span>
              </div>
              <CardTitle className="text-lg">Preferred Breeder</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Verified preferred breeder status with comprehensive health testing 
                and exceptional care standards.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardHeader>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏅</span>
              </div>
              <CardTitle className="text-lg">Health Tested</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All breeding dogs undergo comprehensive health testing including 
                PRA, DNA panels, cardiac, eye, hip and elbow evaluations.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardHeader>
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📋</span>
              </div>
              <CardTitle className="text-lg">Quality Guarantee</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Full health guarantees and comprehensive puppy care packages 
                for every family.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Our Process Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Breeding Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🧬</span>
              </div>
              <CardTitle className="text-lg">Health Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All our breeding dogs undergo comprehensive health testing including 
                hip/elbow dysplasia, eye clearances, and genetic testing for breed-specific conditions.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤱</span>
              </div>
              <CardTitle className="text-lg">Pregnancy Care</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our expecting mothers receive excellent veterinary care, proper nutrition, 
                and a stress-free environment to ensure healthy development.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🍼</span>
              </div>
              <CardTitle className="text-lg">Early Life Care</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                From birth to 8 weeks, puppies receive constant care, early neurological 
                stimulation, and gradual introduction to various sights, sounds, and experiences.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏠</span>
              </div>
              <CardTitle className="text-lg">Going Home</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Puppies go to their new families at 8 weeks with health certificates, 
                first vaccinations, and a comprehensive puppy package.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Health & Guarantees Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card className="p-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <span className="text-3xl mr-3">🏥</span>
                Health Commitments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Comprehensive Health Testing</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Progressive Retinal Atrophy (PRA)</li>
                  <li>• Golden Retriever 1 Testing</li>
                  <li>• DNA Disease Panel</li>
                  <li>• Cardiac Evaluation</li>
                  <li>• Eye Examination</li>
                  <li>• Hip and Elbow Dysplasia Evaluation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Health Guarantee</h4>
                <p className="text-sm text-muted-foreground">
                  We provide a 2-year health guarantee against genetic conditions and 
                  a lifetime commitment to support our puppy families.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="p-8">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <span className="text-3xl mr-3">📚</span>
                Early Training & Socialization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Comprehensive Socialization Program</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Our puppies receive extensive socialization and training to ensure they 
                  are well-adjusted and confident when they go to their new homes.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Various sounds exposure</li>
                  <li>• Car rides experience</li>
                  <li>• Surface & tactile stimulation</li>
                  <li>• Socialized with children</li>
                  <li>• Daily handling and interaction</li>
                  <li>• Socialized with other dogs and animals</li>
                  <li>• Introduced to people of different ages</li>
                  <li>• Initial potty training</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Meet Joanna & Our Program Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Meet Joanna & Our Goldendoodles</h2>
        <div className="text-center mb-8">
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our carefully selected breeding dogs are the foundation of our program. 
            Each parent is chosen for their excellent health, wonderful temperament, 
            and contribution to producing exceptional Goldendoodle puppies.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="overflow-hidden">
            <div className="h-64 relative">
              <img 
                src="https://tf-prod-bunny-pullzone-1.gooddog.com/images/0dw3quwpka7xeq62wcp7pk2a36sh?bounds=66-306x1174-1413&crop=300x300&type=smart"
                alt="Joanna Spangler with her Goldendoodles"
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>Joanna Spangler</CardTitle>
              <CardDescription>Dedicated breeder behind Double J's Doodles</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Located in La Junta, Colorado, Joanna is passionate about breeding 
                Goldendoodles with sweet, loyal, and playful dispositions. Every puppy 
                receives individual attention and love from day one.
              </p>
              <Button variant="outline" className="w-full" onClick={() => window.open('https://www.facebook.com/share/15gCm2ccV5/', '_blank')}>
                Connect on Facebook
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <div className="h-64 bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🐕</div>
                <p className="text-muted-foreground font-medium">Our Goldendoodles</p>
              </div>
            </div>
            <CardHeader>
              <CardTitle>Health-Tested Parents</CardTitle>
              <CardDescription>The exceptional dogs who create our bloodlines</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                All breeding dogs undergo comprehensive health testing including PRA, 
                DNA panels, cardiac evaluations, eye examinations, and hip/elbow screenings 
                to ensure the healthiest possible puppies.
              </p>
              <Button variant="outline" className="w-full" onClick={() => window.location.href = '/contact'}>
                Ask About Available Puppies
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Values Section */}
      <section className="mb-8 md:mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-12">Our Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          <Card className="text-center p-4 md:p-6">
            <CardHeader className="pb-3 md:pb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <span className="text-2xl md:text-3xl">❤️</span>
              </div>
              <CardTitle className="text-base md:text-lg">Ethical Breeding</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground">
                We prioritize the health and welfare of our dogs above all else. 
                Our breeding decisions are made with careful consideration of genetics, 
                temperament, and overall well-being.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-4 md:p-6">
            <CardHeader className="pb-3 md:pb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <span className="text-2xl md:text-3xl">🤝</span>
              </div>
              <CardTitle className="text-base md:text-lg">Transparency</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground">
                We believe in open communication with our puppy families. 
                We share health testing results, provide regular updates, 
                and are always available to answer questions.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-4 md:p-6 sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-3 md:pb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                <span className="text-2xl md:text-3xl">🌟</span>
              </div>
              <CardTitle className="text-base md:text-lg">Lifelong Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs md:text-sm text-muted-foreground">
                Our relationship with families doesn't end when puppies go home. 
                We provide ongoing support, training advice, and are always here 
                for the lifetime of your dog.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Breeder Philosophy & Commitment */}
      <section className="mb-8 md:mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          <Card className="p-4 md:p-8">
            <CardHeader className="pb-4 md:pb-6">
              <CardTitle className="text-lg md:text-2xl flex items-center">
                <span className="text-2xl md:text-3xl mr-2 md:mr-3">🐕</span>
                Our Breeding Philosophy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <p className="text-sm md:text-base text-muted-foreground">
                At Double Js Doodles, we believe that breeding exceptional doodles requires a 
                commitment to excellence in every aspect of our program. We focus on producing 
                puppies with:
              </p>
              <ul className="text-xs md:text-sm text-muted-foreground space-y-1 md:space-y-2">
                <li>• <strong>Outstanding temperaments</strong> - Gentle, intelligent, and family-friendly</li>
                <li>• <strong>Superior health</strong> - Comprehensive testing and genetic screening</li>
                <li>• <strong>Beautiful coats</strong> - Low-shedding and allergy-friendly</li>
                <li>• <strong>Proper socialization</strong> - Well-adjusted and confident puppies</li>
                <li>• <strong>Size consistency</strong> - Predictable adult sizes from mini to standard</li>
              </ul>
              <p className="text-xs md:text-sm text-muted-foreground">
                We carefully select our breeding pairs based on genetic diversity, health clearances, 
                temperament compatibility, and the quality traits we want to preserve and improve 
                in future generations.
              </p>
            </CardContent>
          </Card>

          <Card className="p-4 md:p-8">
            <CardHeader className="pb-4 md:pb-6">
              <CardTitle className="text-lg md:text-2xl flex items-center">
                <span className="text-2xl md:text-3xl mr-2 md:mr-3">📞</span>
                Get in Touch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div>
                <h4 className="font-semibold text-sm md:text-base mb-1 md:mb-2">Contact Information</h4>
                <div className="text-xs md:text-sm text-muted-foreground space-y-1">
                  <p><strong>Breeder:</strong> Joanna Spangler</p>
                  <p><strong>Location:</strong> La Junta, CO 81050</p>
                  <p><strong>Facebook:</strong> <a href="https://www.facebook.com/share/15gCm2ccV5/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Visit our Facebook page</a></p>
                  <p><strong>Serving:</strong> Colorado and surrounding states</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm md:text-base mb-1 md:mb-2">Visit Our Facility</h4>
                <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
                  We welcome prospective families to visit our facility by appointment. 
                  Come meet our adult dogs, see our setup, and learn more about our program!
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  <strong>Visiting Hours:</strong> By appointment only<br/>
                  <strong>Best Times:</strong> Weekends and evenings
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pickup & Delivery Information */}
      <section className="mb-8 md:mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-12">Pickup & Delivery Options</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          <Card className="p-4 md:p-6">
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="text-lg md:text-xl flex items-center">
                <span className="text-xl md:text-2xl mr-2 md:mr-3">📍</span>
                Pickup Locations
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Multiple convenient locations available for puppy pickup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="border-l-4 border-primary pl-3 md:pl-4">
                <h4 className="font-semibold text-sm md:text-base">La Junta, CO</h4>
                <p className="text-xs md:text-sm text-muted-foreground">Joanna's location</p>
              </div>
              <div className="border-l-4 border-green-500 pl-3 md:pl-4">
                <h4 className="font-semibold text-sm md:text-base">Denver, CO</h4>
                <p className="text-xs md:text-sm text-muted-foreground">6 miles • Free</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-3 md:pl-4">
                <h4 className="font-semibold text-sm md:text-base">DEN Airport</h4>
                <p className="text-xs md:text-sm text-muted-foreground">14 miles</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-3 md:pl-4">
                <h4 className="font-semibold text-sm md:text-base">Colorado Springs</h4>
                <p className="text-xs md:text-sm text-muted-foreground">68 miles • Free</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-3 md:pl-4">
                <h4 className="font-semibold text-sm md:text-base">Pueblo, CO</h4>
                <p className="text-xs md:text-sm text-muted-foreground">110 miles • Free</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-3 md:pl-4">
                <h4 className="font-semibold text-sm md:text-base">Flexible Point</h4>
                <p className="text-xs md:text-sm text-muted-foreground">Custom location</p>
              </div>
            </CardContent>
          </Card>

          <Card className="p-4 md:p-6">
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="text-lg md:text-xl flex items-center">
                <span className="text-xl md:text-2xl mr-2 md:mr-3">🚚</span>
                Transport Options
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Safe and reliable options to get your puppy home
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="bg-primary/5 p-3 md:p-4 rounded-lg">
                <h4 className="font-semibold text-primary text-sm md:text-base mb-1 md:mb-2">In-Person Pickup (Recommended)</h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Visit Joanna in person to pick up your puppy in La Junta, CO.
                </p>
              </div>
              <div className="bg-muted/30 p-3 md:p-4 rounded-lg">
                <h4 className="font-semibold text-sm md:text-base mb-1 md:mb-2">Ground Transport</h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Professional puppy transport services via car or van.
                </p>
              </div>
              <div className="bg-muted/30 p-3 md:p-4 rounded-lg">
                <h4 className="font-semibold text-sm md:text-base mb-1 md:mb-2">Meet Halfway</h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Drive to meet Joanna and your puppy at a convenient halfway point.
                </p>
              </div>
              <div className="bg-muted/30 p-3 md:p-4 rounded-lg">
                <h4 className="font-semibold text-sm md:text-base mb-1 md:mb-2">Airport Pickup</h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Meet Joanna at Denver International Airport.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-4">
            Joanna will coordinate all pickup details with you to ensure a smooth experience.
          </p>
          <Button onClick={() => window.location.href = '/contact'} className="glass-button-primary">
            Discuss Pickup Options
          </Button>
        </div>
      </section>

      {/* Puppy Package & Guarantee */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">What's Included With Your Puppy</h2>
        <Card className="p-8">
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-2">📦</span>
                  Comprehensive Puppy Package
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Complete health certificate from our veterinarian</li>
                  <li>• Age-appropriate vaccinations and deworming</li>
                  <li>• Microchip with registration information</li>
                  <li>• Puppy starter kit</li>
                  <li>• Blanket with mom and littermates' scent</li>
                  <li>• Initial potty training foundation</li>
                  <li>• Detailed health and genetic records</li>
                  <li>• Registration papers (when applicable)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-2">🛡️</span>
                  Our Guarantee to You
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• 2-year genetic health guarantee</li>
                  <li>• 72-hour health guarantee from pickup</li>
                  <li>• Lifetime breeder support and guidance</li>
                  <li>• Return policy - we'll always take our dogs back</li>
                  <li>• Access to our private puppy family group</li>
                  <li>• Training support and resources</li>
                  <li>• Annual puppy reunions and events</li>
                  <li>• Emergency support 24/7</li>
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-900">Our Promise</h4>
              <p className="text-sm text-blue-800">
                Every Double Js Doodles puppy comes with our commitment to excellence. We stand behind 
                our breeding program with comprehensive health guarantees and lifetime support. 
                If for any reason your puppy doesn't work out, we will gladly take them back and 
                help with rehoming at no charge.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contact CTA */}
      <section className="text-center py-12 bg-muted rounded-lg">
        <h2 className="text-3xl font-bold mb-4">Ready to Learn More?</h2>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          We'd love to answer any questions you have about our breeding program, 
          our dogs, or help you find the perfect puppy for your family.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => window.location.href = '/contact'}>
            Contact Us Today
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.location.href = '/litters'}>
            View Available Puppies
          </Button>
        </div>
        <div className="mt-6 text-sm text-muted-foreground">
          <p>Visit our Facebook page for the latest updates and contact information</p>
          <p>Located in La Junta, Colorado • Serving Colorado and surrounding states</p>
          <p>Goldendoodle puppies starting at $1,600 with $500 deposit</p>
        </div>
      </section>
    </div>
  )
}