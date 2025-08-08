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
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { ImageGallery, ImageCarousel } from "../components/ui/image-gallery"
import { LitterInfoStep, ParentInfoStep, PuppyInfoStep, ReviewStep } from '../components/LitterCreationSteps'
import { useAuth, withAuth } from "../contexts/AuthContext"
import { api, type Litter, type Puppy } from "../lib/api"
import { toast } from 'sonner'
import { 
  Home, 
  Camera, 
  Heart, 
  Dog, 
  Mail, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Menu,
  X,
  Upload
} from "lucide-react"

interface ContactInquiry {
  id: string
  name: string
  email: string
  phone: string
  message: string
  puppy_name?: string
  litter_name?: string
  subject?: string
  submitted_at: string
  responded: boolean
  notes?: string
}

interface HeroImage {
  id: string
  image_url: string
  title?: string
  subtitle?: string
  alt_text: string
  is_active: boolean
  order: number
}

interface HomepageSection {
  id: string
  section_type: string
  title: string
  content?: string
  images: string[]
  is_active: boolean
  order: number
}

interface HomepageContent {
  hero_images: HeroImage[]
  sections: HomepageSection[]
  meta_title?: string
  meta_description?: string
}

type NavigationItem = 'overview' | 'homepage' | 'litters' | 'inquiries' | 'create-litter' | 'edit-litter'

function AdminDashboardComponent() {
  const [litters, setLitters] = useState<Litter[]>([])
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([])
  const [homepageContent, setHomepageContent] = useState<HomepageContent>({
    hero_images: [],
    sections: []
  })
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState<NavigationItem>('overview')
  const [selectedLitter, setSelectedLitter] = useState<Litter | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [editingLitter, setEditingLitter] = useState<Litter | null>(null)
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [litterToDelete, setLitterToDelete] = useState<{ id: string; name: string } | null>(null)
  
  const { user } = useAuth()

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setSidebarCollapsed(true)
        setMobileMenuOpen(false)
      }
    }

    // Check on mount
    if (typeof window !== 'undefined') {
      handleResize()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchData = async () => {
    try {
      const [litterData, inquiryData, homepageData] = await Promise.all([
        api.getLitters(),
        api.getContactInquiries(),
        fetchHomepageContent()
      ])
      setLitters(litterData)
      setInquiries(inquiryData)
      setHomepageContent(homepageData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHomepageContent = async (): Promise<HomepageContent> => {
    try {
      return await api.getHomepageContent()
    } catch (error) {
      console.error("Failed to fetch homepage content:", error)
      return { hero_images: [], sections: [] }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'reserved':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'sold':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getAvailableCount = (puppies: Puppy[]) => {
    return puppies.filter(puppy => puppy.status === 'available').length
  }

  const handleDeleteLitter = (litterId: string, litterName: string) => {
    setLitterToDelete({ id: litterId, name: litterName })
    setShowDeleteModal(true)
  }

  const confirmDeleteLitter = async () => {
    if (!litterToDelete) return
    
    try {
      await api.deleteLitter(litterToDelete.id)
      await fetchData()
      if (selectedLitter?.id === litterToDelete.id) {
        setSelectedLitter(null)
        setActiveNav('litters')
      }
      setShowDeleteModal(false)
      setLitterToDelete(null)
      toast.success("Litter deleted successfully")
    } catch (error) {
      console.error("Failed to delete litter:", error)
      toast.error(
        "Failed to delete litter",
        {
          description: error instanceof Error ? error.message : "Please try again"
        }
      )
    }
  }

  const cancelDeleteLitter = () => {
    setShowDeleteModal(false)
    setLitterToDelete(null)
  }

  const handleUpdatePuppyStatus = async (litterId: string, puppyId: string, newStatus: string) => {
    try {
      await api.updatePuppy(litterId, puppyId, { status: newStatus as any })
      await fetchData()
      // Update selected litter if it's currently being viewed
      if (selectedLitter?.id === litterId) {
        const updatedLitter = await api.getLitter(litterId)
        setSelectedLitter(updatedLitter)
      }
      
      toast.success(`Updated puppy status to ${newStatus}`)
    } catch (error) {
      console.error("Failed to update puppy status:", error)
      toast.error(
        "Failed to update puppy status",
        {
          description: error instanceof Error ? error.message : "Please try again"
        }
      )
    }
  }

  const handleMarkInquiryResponded = async (inquiryId: string) => {
    try {
      await api.markInquiryResponded(inquiryId)
      await fetchData()
      toast.success('Inquiry marked as responded')
    } catch (error) {
      console.error("Failed to mark inquiry as responded:", error)
      toast.error(
        "Failed to update inquiry",
        {
          description: error instanceof Error ? error.message : "Please try again"
        }
      )
    }
  }

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'homepage', label: 'Homepage', icon: Camera },
    { id: 'litters', label: 'Litters', icon: Heart, count: litters.length },
    { id: 'inquiries', label: 'Inquiries', icon: Mail, count: inquiries.filter(i => !i.responded).length }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-breeder-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-breeder-gradient">
      {/* Mobile Overlay */}
      {mobileMenuOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Header - Only visible on mobile */}
      {isMobile && (
        <div className="fixed top-20 left-0 right-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/10 h-16">
          <div className="flex items-center justify-between h-full px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="hover:bg-background/20 p-2 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex-1 text-center">
              <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
            </div>
            <div className="w-10"></div> {/* Spacer for balance */}
          </div>
        </div>
      )}

      <div className={`flex relative ${isMobile ? 'pt-36' : 'pt-20'}`}>
        {/* Responsive Sidebar */}
        <div className={`bg-background/40 backdrop-blur-md sidebar-transition border-r border-border/10 z-50 ${
          isMobile 
            ? `fixed left-0 top-36 bottom-0 ${mobileMenuOpen ? 'w-80' : 'w-0 overflow-hidden'} shadow-xl`
            : `min-h-[calc(100vh-5rem)] ${sidebarCollapsed ? 'w-16' : 'w-80'}`
        }`}>
          {/* Desktop Header in Sidebar - Hidden on mobile */}
          {!isMobile && (
            <div className={`border-b border-border/10 bg-background/20 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hover:bg-background/20 p-2 flex-shrink-0 rounded-lg transition-colors"
                >
                  {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
                </Button>
                {!sidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg md:text-xl font-bold text-foreground truncate">Admin Dashboard</h1>
                    <p className="text-xs text-muted-foreground truncate">Welcome back, {user?.username}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Navigation Items */}
          <div className={`${sidebarCollapsed && !isMobile ? 'p-2' : 'p-4'} space-y-2`}>
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isCollapsedDesktop = sidebarCollapsed && !isMobile
              
              return (
                <Button
                  key={item.id}
                  variant={activeNav === item.id ? "default" : "ghost"}
                  className={`w-full h-11 transition-all duration-200 ${
                    activeNav === item.id 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'hover:bg-background/30 text-foreground'
                  } ${
                    isCollapsedDesktop 
                      ? 'justify-center p-2' 
                      : 'justify-start gap-3 px-3'
                  }`}
                  onClick={() => {
                    setActiveNav(item.id as NavigationItem)
                    if (item.id !== 'litters') {
                      setSelectedLitter(null)
                    }
                    // Close mobile menu after selection
                    if (isMobile) {
                      setMobileMenuOpen(false)
                    }
                  }}
                  title={isCollapsedDesktop ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsedDesktop && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.count !== undefined && item.count > 0 && (
                        <Badge variant={activeNav === item.id ? "secondary" : "default"} className="text-xs">
                          {item.count}
                        </Badge>
                      )}
                      {item.id === 'litters' && <ChevronRight className="h-4 w-4" />}
                    </>
                  )}
                </Button>
              )
            })}

            {/* Litters Sub-navigation - only show when not collapsed */}
            {activeNav === 'litters' && !(sidebarCollapsed && !isMobile) && (
              <div className="ml-4 space-y-1 pt-2 border-t border-border/10">
                {litters.map((litter) => (
                  <Button
                    key={litter.id}
                    variant={selectedLitter?.id === litter.id ? "secondary" : "ghost"}
                    size="sm"
                    className={`w-full justify-start text-xs transition-all ${
                      selectedLitter?.id === litter.id 
                        ? 'bg-secondary/60 text-secondary-foreground' 
                        : 'hover:bg-background/20 text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => {
                      setSelectedLitter(litter)
                      setActiveNav('litters')
                      // Close mobile menu after selection
                      if (isMobile) {
                        setMobileMenuOpen(false)
                      }
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{litter.name}</span>
                      {litter.is_current && (
                        <Badge variant="outline" className="text-xs ml-2">
                          Active
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Responsive Content Panel */}
        <div className="flex-1 overflow-y-auto bg-background/20 backdrop-blur-sm">
          <div className={`p-3 sm:p-4 md:p-6 ${isMobile ? 'min-h-[calc(100vh-9rem)]' : 'min-h-[calc(100vh-5rem)]'}`}>
            {activeNav === 'overview' && (
              <OverviewContent 
                litters={litters}
                inquiries={inquiries}
                formatDate={formatDate}
                getAvailableCount={getAvailableCount}
              />
            )}

            {activeNav === 'homepage' && (
              <HomepageManagement 
                content={homepageContent} 
                onUpdate={fetchData}
              />
            )}

            {activeNav === 'litters' && selectedLitter && (
              <LitterDetailView 
                litter={selectedLitter}
                onUpdate={fetchData}
                onDelete={() => handleDeleteLitter(selectedLitter.id!, selectedLitter.name)}
                onUpdatePuppyStatus={handleUpdatePuppyStatus}
                formatDate={formatDate}
                getStatusColor={getStatusColor}
                onEdit={() => {
                  setEditingLitter(selectedLitter)
                  setActiveNav('edit-litter')
                }}
                onBack={() => setSelectedLitter(null)}
              />
            )}

            {activeNav === 'litters' && !selectedLitter && (
              <LittersOverview 
                litters={litters}
                onSelectLitter={setSelectedLitter}
                onCreateLitter={() => setActiveNav('create-litter')}
                formatDate={formatDate}
                getAvailableCount={getAvailableCount}
                getLitterImagesWithPuppyNames={getLitterImagesWithPuppyNames}
              />
            )}

            {activeNav === 'create-litter' && (
              <CreateLitterFlow 
                onSuccess={() => {
                  fetchData()
                  setActiveNav('litters')
                }}
                onCancel={() => setActiveNav('litters')}
              />
            )}

            {activeNav === 'edit-litter' && editingLitter && (
              <EditLitterFlow 
                litter={editingLitter}
                onSuccess={() => {
                  fetchData()
                  setActiveNav('litters')
                  setEditingLitter(null)
                }}
                onCancel={() => {
                  setActiveNav('litters')
                  setEditingLitter(null)
                }}
              />
            )}

            {activeNav === 'inquiries' && (
              <InquiriesManagement 
                inquiries={inquiries}
                onMarkResponded={handleMarkInquiryResponded}
                formatDate={formatDate}
              />
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-700">
              Delete Litter
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                Are you sure you want to delete the litter <strong>"{litterToDelete?.name}"</strong>?
              </p>
              <p className="text-red-600">
                This action cannot be undone. All puppies and associated data will be permanently deleted.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                variant="outline"
                onClick={cancelDeleteLitter}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteLitter}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Litter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Overview Content Component
function OverviewContent({ litters, inquiries, formatDate, getAvailableCount }: {
  litters: Litter[];
  inquiries: ContactInquiry[];
  formatDate: (date: string) => string;
  getAvailableCount: (puppies: Puppy[]) => number;
}) {
  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">Dashboard Overview</h2>
        <p className="text-sm md:text-base text-muted-foreground">Your breeding business at a glance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card className="breeder-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Litters</CardTitle>
            <Heart className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{litters.length}</div>
            <p className="text-xs text-muted-foreground">
              {litters.filter(l => l.is_current).length} currently active
            </p>
          </CardContent>
        </Card>

        <Card className="breeder-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Puppies</CardTitle>
            <Dog className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {litters.reduce((acc, litter) => acc + getAvailableCount(litter.puppies), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for new homes
            </p>
          </CardContent>
        </Card>

        <Card className="breeder-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Puppies</CardTitle>
            <Dog className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {litters.reduce((acc, litter) => acc + litter.puppies.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time total
            </p>
          </CardContent>
        </Card>

        <Card className="breeder-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Inquiries</CardTitle>
            <Mail className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inquiries.filter(i => !i.responded).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Current Litters */}
        <Card className="breeder-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              Current Litters
            </CardTitle>
            <CardDescription className="text-sm">
              Active litters with available puppies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {litters.filter(l => l.is_current).slice(0, 3).map((litter) => (
              <div key={litter.id} className="flex items-center gap-3 p-2 sm:p-3 glass-button rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  {litter.images && litter.images.length > 0 && (
                    <img 
                      src={litter.images[0]} 
                      alt={litter.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs sm:text-sm md:text-base truncate">{litter.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {getAvailableCount(litter.puppies)}/{litter.puppies.length} available
                    </p>
                  </div>
                </div>
                <Badge className="glass-button-primary text-xs flex-shrink-0">
                  {litter.birth_date ? formatDate(litter.birth_date) : 'TBD'}
                </Badge>
              </div>
            ))}
            {litters.filter(l => l.is_current).length === 0 && (
              <p className="text-center text-muted-foreground py-4 text-sm">No current litters</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Inquiries */}
        <Card className="breeder-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              Recent Inquiries
            </CardTitle>
            <CardDescription className="text-sm">
              Latest customer inquiries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {inquiries.slice(0, 3).map((inquiry) => (
              <div key={inquiry.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 bg-secondary/30 rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{inquiry.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{inquiry.email}</p>
                  {inquiry.puppy_name && (
                    <p className="text-xs text-primary truncate">About: {inquiry.puppy_name}</p>
                  )}
                </div>
                <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-2 sm:gap-1 flex-shrink-0">
                  <Badge variant={inquiry.responded ? "secondary" : "destructive"} className="text-xs">
                    {inquiry.responded ? "Responded" : "Pending"}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(inquiry.submitted_at)}
                  </p>
                </div>
              </div>
            ))}
            {inquiries.length === 0 && (
              <p className="text-center text-muted-foreground py-4 text-sm">No inquiries yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Litters Overview Component
function LittersOverview({ litters, onSelectLitter, onCreateLitter, formatDate, getAvailableCount, getLitterImagesWithPuppyNames }: {
  litters: Litter[];
  onSelectLitter: (litter: Litter) => void;
  onCreateLitter: () => void;
  formatDate: (date: string) => string;
  getAvailableCount: (puppies: Puppy[]) => number;
  getLitterImagesWithPuppyNames: (litter: Litter) => { url: string; puppyName: string; puppyColor: string; puppyStatus: string }[];
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">All Litters</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your litters and puppies</p>
        </div>
        <Button 
          onClick={onCreateLitter}
          className="glass-button-primary gap-2 flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create New Litter
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...litters]
          .sort((a, b) => {
            // Sort active litters first, then by creation date (newest first)
            if (a.is_current && !b.is_current) return -1;
            if (!a.is_current && b.is_current) return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          })
          .map((litter) => (
          <Card 
            key={litter.id} 
            className="breeder-card hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => onSelectLitter(litter)}
          >
            <div className="relative">
              {(() => {
                const litterImagesWithNames = getLitterImagesWithPuppyNames(litter);
                return litterImagesWithNames.length > 0 ? (
                  <div className="relative">
                    <ImageGallery 
                      images={litterImagesWithNames}
                      alt={`${litter.name} litter puppies`}
                      className="rounded-t-lg"
                      showThumbnails={false}
                      autoplay={true}
                      autoplayInterval={4000}
                      showPuppyNames={true}
                    />
                    {litter.is_current && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-green-50 text-green-700 border-green-200">
                          Current
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <div className="aspect-[4/3] bg-gradient-to-br from-breeder-cream to-breeder-warm flex items-center justify-center rounded-t-lg">
                      <Dog className="h-12 w-12 text-primary/50" />
                    </div>
                    {litter.is_current && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-50 text-green-700 border-green-200">
                          Current
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <CardHeader>
              <CardTitle className="text-lg">{litter.name}</CardTitle>
              <CardDescription>
                {litter.breed} • Generation {litter.generation}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Born:</span>
                  <span>{litter.birth_date ? formatDate(litter.birth_date) : 'TBD'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Puppies:</span>
                  <span>{litter.puppies.length} total</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available:</span>
                  <span className="text-green-600 font-medium">
                    {getAvailableCount(litter.puppies)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {litters.length === 0 && (
        <Card className="breeder-card">
          <CardContent className="text-center py-16">
            <div className="floating">
              <Heart className="h-20 w-20 text-primary/60 mx-auto mb-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">No Litters Yet</h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Create your first litter to get started managing your puppies
            </p>
            <Button 
              onClick={onCreateLitter}
              size="lg"
              className="glass-button-primary gap-3 text-lg px-8 py-6 shadow-glass-lg"
            >
              <Plus className="h-6 w-6" />
              Create New Litter
            </Button>
            <div className="mt-8 text-sm text-muted-foreground/70">
              <p>Track puppies, manage availability, and connect with potential families</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Create Litter Flow Component
function CreateLitterFlow({ onSuccess, onCancel }: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(1)
  const [litterData, setLitterData] = useState({
    name: '',
    breed: 'Goldendoodle',
    generation: 'F1',
    birth_date: '',
    expected_date: '',
    description: '',
    mother: {
      name: '',
      breed: '',
      color: '',
      weight: undefined as number | undefined,
      health_clearances: [] as string[]
    },
    father: {
      name: '',
      breed: '',
      color: '',
      weight: undefined as number | undefined,
      health_clearances: [] as string[]
    },
    is_current: true
  })
  
  const [validationErrors, setValidationErrors] = useState({
    name: '',
    mother: { name: '', breed: '', color: '' },
    father: { name: '', breed: '', color: '' }
  })

  // Modal state for handling active litter conflicts
  const [showActiveLitterModal, setShowActiveLitterModal] = useState(false)
  const [existingActiveLitter, setExistingActiveLitter] = useState<{ id: string; name: string } | null>(null)

  const clearValidationError = (field: string, parent?: 'mother' | 'father') => {
    setValidationErrors(prev => {
      if (parent) {
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [field]: ''
          }
        }
      } else {
        return {
          ...prev,
          [field]: ''
        }
      }
    })
  }
  const [puppies, setPuppies] = useState<Array<{
    name: string;
    gender: string;
    color: string;
    birth_date: string;
    estimated_adult_weight?: number;
    status: 'available' | 'reserved' | 'sold';
    microchip_id?: string;
    notes?: string;
    images?: File[];
  }>>([])
  const [loading, setLoading] = useState(false)

  const steps = [
    { number: 1, title: 'Litter Information', description: 'Basic litter details' },
    { number: 2, title: 'Parent Information', description: 'Mother and father details' },
    { number: 3, title: 'Puppy Information', description: 'Add puppies to the litter' },
    { number: 4, title: 'Review & Create', description: 'Confirm and create litter' }
  ]

  const validateCurrentStep = () => {
    let isValid = true
    const newErrors = {
      name: '',
      mother: { name: '', breed: '', color: '' },
      father: { name: '', breed: '', color: '' }
    }
    
    if (currentStep === 1) {
      // Step 1: Litter Information validation
      if (!litterData.name.trim()) {
        newErrors.name = 'Litter name is required'
        isValid = false
      }
    } else if (currentStep === 2) {
      // Step 2: Parent Information validation - ALL required fields
      
      // Mother validation
      if (!litterData.mother.name.trim()) {
        newErrors.mother.name = 'Mother\'s name is required'
        isValid = false
      }
      if (!litterData.mother.breed.trim()) {
        newErrors.mother.breed = 'Mother\'s breed is required'
        isValid = false
      }
      if (!litterData.mother.color.trim()) {
        newErrors.mother.color = 'Mother\'s color is required'
        isValid = false
      }
      
      // Father validation
      if (!litterData.father.name.trim()) {
        newErrors.father.name = 'Father\'s name is required'
        isValid = false
      }
      if (!litterData.father.breed.trim()) {
        newErrors.father.breed = 'Father\'s breed is required'
        isValid = false
      }
      if (!litterData.father.color.trim()) {
        newErrors.father.color = 'Father\'s color is required'
        isValid = false
      }
    } else if (currentStep === 3) {
      // Step 3: Puppy Information validation - check if any puppies have incomplete required fields
      for (let i = 0; i < puppies.length; i++) {
        const puppy = puppies[i]
        
        if (!puppy.name.trim() || !puppy.color.trim()) {
          // For puppies, we'll show a toast since they're dynamic
          toast.error(`Puppy ${i + 1} is missing required fields (name, color)`)
          isValid = false
          break
        }
      }
    }
    
    setValidationErrors(newErrors)
    return isValid
  }

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreateLitter = async (forceActive: boolean = false) => {
    setLoading(true)
    
    // Final validation using the same logic as step validation
    const finalErrors = {
      name: '',
      mother: { name: '', breed: '', color: '' },
      father: { name: '', breed: '', color: '' }
    }
    
    let hasErrors = false
    
    // Validate all required fields
    if (!litterData.name.trim()) {
      finalErrors.name = 'Litter name is required'
      hasErrors = true
    }
    
    if (!litterData.mother.name.trim()) {
      finalErrors.mother.name = 'Mother\'s name is required'
      hasErrors = true
    }
    if (!litterData.mother.breed.trim()) {
      finalErrors.mother.breed = 'Mother\'s breed is required'
      hasErrors = true
    }
    if (!litterData.mother.color.trim()) {
      finalErrors.mother.color = 'Mother\'s color is required'
      hasErrors = true
    }
    
    if (!litterData.father.name.trim()) {
      finalErrors.father.name = 'Father\'s name is required'
      hasErrors = true
    }
    if (!litterData.father.breed.trim()) {
      finalErrors.father.breed = 'Father\'s breed is required'
      hasErrors = true
    }
    if (!litterData.father.color.trim()) {
      finalErrors.father.color = 'Father\'s color is required'
      hasErrors = true
    }
    
    // Check puppies - validate all required fields and data types
    for (let i = 0; i < puppies.length; i++) {
      const puppy = puppies[i]
      const puppyErrors = []
      
      if (!puppy.name.trim()) puppyErrors.push("Name")
      if (!puppy.color.trim()) puppyErrors.push("Color")
      
      // Validate birth_date - REQUIRED field
      if (!puppy.birth_date || !puppy.birth_date.trim()) {
        puppyErrors.push("Birth Date (required)")
      } else {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(puppy.birth_date)) {
          puppyErrors.push("Birth Date (must be in YYYY-MM-DD format)")
        }
      }
      
      // Validate estimated_adult_weight if provided
      if (puppy.estimated_adult_weight !== undefined && 
          puppy.estimated_adult_weight !== null &&
          String(puppy.estimated_adult_weight).trim() !== '') {
        const weight = typeof puppy.estimated_adult_weight === 'string' 
          ? parseFloat(puppy.estimated_adult_weight) 
          : puppy.estimated_adult_weight
        if (isNaN(weight) || weight <= 0) {
          puppyErrors.push("Estimated Adult Weight (must be a positive number)")
        }
      }
      
      if (puppyErrors.length > 0) {
        toast.error(`Puppy ${i + 1} has invalid data: ${puppyErrors.join(", ")}`)
        hasErrors = true
        break
      }
    }
    
    if (hasErrors) {
      setValidationErrors(finalErrors)
      setLoading(false)
      return
    }
    
    try {
      // Create the litter first
      const litter = await api.createLitter({
        name: litterData.name.trim(),
        breed: litterData.breed as any,
        generation: litterData.generation as any,
        birth_date: litterData.birth_date || undefined,
        expected_date: litterData.expected_date || undefined,
        description: litterData.description?.trim() || undefined,
        mother: {
          ...litterData.mother,
          name: litterData.mother.name.trim(),
          breed: litterData.mother.breed.trim(),
          color: litterData.mother.color.trim(),
          weight: litterData.mother.weight || undefined
        },
        father: {
          ...litterData.father,
          name: litterData.father.name.trim(),
          breed: litterData.father.breed.trim(),
          color: litterData.father.color.trim(),
          weight: litterData.father.weight || undefined
        },
        is_current: litterData.is_current
      }, forceActive)

      // Add puppies if any
      if (puppies.length > 0 && litter.id) {
        for (const puppy of puppies) {
          const sanitizedPuppyData = sanitizePuppyData(puppy)
          await api.addPuppyToLitter(litter.id, sanitizedPuppyData)
          
          // Upload images if any
          if (puppy.images && puppy.images.length > 0) {
            // Note: This would need the puppy ID which we'd get from the addPuppyToLitter response
            // For now, we'll handle image uploads after litter creation
          }
        }
      }

      // Close modal if it was open
      setShowActiveLitterModal(false)
      setExistingActiveLitter(null)
      onSuccess()
    } catch (error: any) {
      console.error("Failed to create litter:", error)
      
      // Check if this is an active litter conflict (status 409)
      if (error.status === 409 && !forceActive && litterData.is_current) {
        // Check if we have the error data with existing litter info
        if (error.data?.detail?.existing_litter) {
          setExistingActiveLitter(error.data.detail.existing_litter);
          setShowActiveLitterModal(true);
          setLoading(false);
          return;
        } else {
          // Fallback: try to check for active litter
          try {
            const activeCheck = await api.checkActiveLitter();
            if (activeCheck.has_active_litter && activeCheck.active_litter) {
              setExistingActiveLitter(activeCheck.active_litter);
              setShowActiveLitterModal(true);
              setLoading(false);
              return;
            }
          } catch (checkError) {
            console.error("Failed to check active litter:", checkError);
          }
        }
      }
      
      toast.error(
        "Failed to create litter",
        {
          description: error instanceof Error ? error.message : "Please try again"
        }
      )
    } finally {
      setLoading(false)
    }
  }

  // Helper function to sanitize puppy data before sending to backend
  const sanitizePuppyData = (puppy: any) => {
    return {
      name: puppy.name.trim(),
      gender: puppy.gender,
      color: puppy.color.trim(),
      birth_date: puppy.birth_date.trim(), // Required field - must be provided
      estimated_adult_weight: puppy.estimated_adult_weight && String(puppy.estimated_adult_weight).trim() !== '' 
        ? (typeof puppy.estimated_adult_weight === 'string' 
           ? parseFloat(puppy.estimated_adult_weight) 
           : puppy.estimated_adult_weight)
        : undefined,
      status: puppy.status,
      microchip_id: puppy.microchip_id && puppy.microchip_id.trim() ? puppy.microchip_id.trim() : undefined,
      notes: puppy.notes && puppy.notes.trim() ? puppy.notes.trim() : undefined
    }
  }

  const handleConfirmMakeActive = () => {
    handleCreateLitter(true);
  }

  const handleCancelActiveLitter = () => {
    setShowActiveLitterModal(false);
    setExistingActiveLitter(null);
    // Set the litter to not be current
    setLitterData(prev => ({ ...prev, is_current: false }));
  }

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1">Create New Litter</h2>
          <p className="text-sm text-muted-foreground">Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}</p>
        </div>
        <Button variant="outline" onClick={onCancel} className="glass-button self-start sm:self-auto">
          Cancel
        </Button>
      </div>

      {/* Progress Steps */}
      <Card className="breeder-card">
        <CardContent className="pt-4 sm:pt-6">
          {/* Mobile: Vertical Progress */}
          <div className="block sm:hidden space-y-3">
            {steps.map((step) => (
              <div key={step.number} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                  step.number <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step.number < currentStep ? <Check className="h-4 w-4" /> : step.number}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${
                    step.number <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Horizontal Progress */}
          <div className="hidden sm:flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.number <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step.number < currentStep ? <Check className="h-4 w-4" /> : step.number}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium whitespace-nowrap ${
                    step.number <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-px w-8 lg:w-12 mx-4 ${
                    step.number < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="breeder-card">
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <LitterInfoStep 
              data={litterData}
              onChange={setLitterData}
              errors={validationErrors}
              clearError={clearValidationError}
            />
          )}

          {currentStep === 2 && (
            <ParentInfoStep 
              data={litterData}
              onChange={setLitterData}
              errors={validationErrors}
              clearError={clearValidationError}
            />
          )}

          {currentStep === 3 && (
            <PuppyInfoStep 
              puppies={puppies}
              onChange={setPuppies}
              litterBirthDate={litterData.birth_date}
            />
          )}

          {currentStep === 4 && (
            <ReviewStep 
              litterData={litterData}
              puppies={puppies}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="glass-button gap-2 w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        {currentStep < steps.length ? (
          <Button onClick={handleNext} className="glass-button-primary gap-2 w-full sm:w-auto">
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={() => handleCreateLitter()} 
            disabled={loading}
            className="glass-button-primary gap-2 w-full sm:w-auto"
          >
            {loading ? "Creating..." : "Create Litter"}
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active Litter Conflict Modal */}
      <Dialog open={showActiveLitterModal} onOpenChange={setShowActiveLitterModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-orange-700">
              Active Litter Already Exists
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                There is already an active litter: <strong>"{existingActiveLitter?.name}"</strong>
              </p>
              <p>
                Only one litter can be active at a time. Would you like to make this new litter active instead? 
                This will automatically set the existing litter to inactive.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleCancelActiveLitter}
                className="flex-1"
              >
                No, Keep Existing Active
              </Button>
              <Button
                onClick={handleConfirmMakeActive}
                disabled={loading}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {loading ? "Creating..." : "Yes, Make This Active"}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              You can change the active litter later from the litter management page.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
  }

// Litter Detail View Component
function LitterDetailView({ litter, onUpdate, onDelete, onUpdatePuppyStatus, formatDate, getStatusColor, onEdit, onBack }: {
  litter: Litter;
  onUpdate: () => void;
  onDelete: () => void;
  onUpdatePuppyStatus: (litterId: string, puppyId: string, status: string) => void;
  formatDate: (date: string) => string;
  getStatusColor: (status: string) => string;
  onEdit: () => void;
  onBack: () => void;
}) {
  const [editingPuppyId, setEditingPuppyId] = useState<string | null>(null)
  const [editingPuppyData, setEditingPuppyData] = useState<any>(null)
  const [showAddPuppyDialog, setShowAddPuppyDialog] = useState(false)
  const [newPuppyData, setNewPuppyData] = useState({
    name: '',
    gender: 'Male',
    color: '',
    birth_date: litter.birth_date || '',
    estimated_adult_weight: '',
    status: 'available',
    microchip_id: '',
    notes: ''
  })

  const handleAddPuppy = async (puppyData: any) => {
    if (!puppyData.name || !puppyData.color || !litter.id) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await api.addPuppyToLitter(litter.id, {
        name: puppyData.name,
        gender: puppyData.gender,
        color: puppyData.color,
        birth_date: puppyData.birth_date,
        estimated_adult_weight: puppyData.estimated_adult_weight ? parseFloat(puppyData.estimated_adult_weight) : undefined,
        status: puppyData.status as any,
        microchip_id: puppyData.microchip_id || undefined,
        notes: puppyData.notes || undefined
      })
      
      onUpdate()
      setShowAddPuppyDialog(false)
      setNewPuppyData({
        name: '',
        gender: 'Male',
        color: '',
        birth_date: litter.birth_date || '',
        estimated_adult_weight: '',
        status: 'available',
        microchip_id: '',
        notes: ''
      })
      toast.success(`Added ${puppyData.name} successfully!`)
    } catch (error) {
      console.error('Failed to add puppy:', error)
      toast.error(
        'Failed to add puppy',
        {
          description: error instanceof Error ? error.message : 'Please try again'
        }
      )
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className="glass-button gap-2" 
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All Litters
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 truncate">{litter.name}</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {litter.breed} • Generation {litter.generation}
            {litter.birth_date && (
              <><br className="sm:hidden" /><span className="hidden sm:inline"> • </span>Born {formatDate(litter.birth_date)}</>
            )}
            {!litter.birth_date && (
              <><br className="sm:hidden" /><span className="hidden sm:inline"> • </span>Expected Soon</>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" className="glass-button" onClick={onEdit}>
            <Edit3 className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Edit</span>
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete} className="glass-button">
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Delete</span>
          </Button>
        </div>
      </div>

      {/* Litter Images */}
      {litter.images && litter.images.length > 0 && (
        <Card className="breeder-card">
          <CardHeader>
            <CardTitle>Litter Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageGallery 
              images={litter.images}
              alt={`${litter.name} litter`}
              className="max-w-2xl"
            />
          </CardContent>
        </Card>
      )}

      {/* Litter Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="breeder-card">
          <CardHeader>
            <CardTitle>Litter Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge className={litter.is_current ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-700 border-gray-200"}>
                {litter.is_current ? 'Current' : 'Past'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Puppies:</span>
              <span className="font-medium">{litter.puppies.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Available:</span>
              <span className="text-green-600 font-medium">
                {litter.puppies.filter(p => p.status === 'available').length}
              </span>
            </div>
            {litter.description && (
              <div>
                <span className="text-muted-foreground">Description:</span>
                <p className="text-sm mt-1">{litter.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="breeder-card">
          <CardHeader>
            <CardTitle>Parent Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <span className="text-pink-600">♀</span>
                Mother (Dam)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm space-y-2">
                  <p><span className="text-muted-foreground">Name:</span> {litter.mother.name}</p>
                  <p><span className="text-muted-foreground">Breed:</span> {litter.mother.breed}</p>
                  <p><span className="text-muted-foreground">Color:</span> {litter.mother.color}</p>
                </div>
                {litter.mother.image_url && (
                  <div className="flex justify-center md:justify-end">
                    <img 
                      src={litter.mother.image_url} 
                      alt={litter.mother.name}
                      className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <span className="text-blue-600">♂</span>
                Father (Sire)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm space-y-2">
                  <p><span className="text-muted-foreground">Name:</span> {litter.father.name}</p>
                  <p><span className="text-muted-foreground">Breed:</span> {litter.father.breed}</p>
                  <p><span className="text-muted-foreground">Color:</span> {litter.father.color}</p>
                </div>
                {litter.father.image_url && (
                  <div className="flex justify-center md:justify-end">
                    <img 
                      src={litter.father.image_url} 
                      alt={litter.father.name}
                      className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Puppies */}
      <Card className="breeder-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Puppies ({litter.puppies.length})</CardTitle>
            <Dialog open={showAddPuppyDialog} onOpenChange={setShowAddPuppyDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Puppy
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Puppy</DialogTitle>
                </DialogHeader>
                <PuppyEditForm 
                  puppy={newPuppyData}
                  onSave={handleAddPuppy}
                  onCancel={() => setShowAddPuppyDialog(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {litter.puppies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {litter.puppies.map((puppy) => (
                <div key={puppy.id} className="border border-border/20 rounded-lg p-4 bg-background/50">
                  {editingPuppyId === puppy.id ? (
                    <PuppyEditForm
                      puppy={editingPuppyData}
                      onSave={async (updatedPuppy) => {
                        try {
                          if (litter.id && puppy.id) {
                            await api.updatePuppy(litter.id, puppy.id, {
                              name: updatedPuppy.name,
                              gender: updatedPuppy.gender,
                              color: updatedPuppy.color,
                              birth_date: updatedPuppy.birth_date,
                              estimated_adult_weight: updatedPuppy.estimated_adult_weight,
                              status: updatedPuppy.status,
                              microchip_id: updatedPuppy.microchip_id,
                              notes: updatedPuppy.notes
                            })
                            onUpdate()
                            setEditingPuppyId(null)
                            setEditingPuppyData(null)
                            toast.success(`Updated ${updatedPuppy.name} successfully!`)
                          }
                        } catch (error) {
                          console.error('Failed to update puppy:', error)
                          toast.error(
                            'Failed to update puppy',
                            {
                              description: error instanceof Error ? error.message : 'Please try again'
                            }
                          )
                        }
                      }}
                      onCancel={() => {
                        setEditingPuppyId(null)
                        setEditingPuppyData(null)
                      }}
                      onUpdate={onUpdate}
                    />
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{puppy.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${getStatusColor(puppy.status)}`}>
                          {puppy.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{puppy.gender}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          setEditingPuppyId(puppy.id!)
                          setEditingPuppyData({
                            ...puppy,
                            existing_images: Array.isArray(puppy.images) ? puppy.images : []
                          })
                        }}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {puppy.images && puppy.images.length > 0 && (
                    <ImageCarousel 
                      images={puppy.images}
                      alt={puppy.name}
                      aspectRatio="aspect-square"
                      className="mb-3"
                    />
                  )}
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color:</span>
                      <span>{puppy.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Birth Date:</span>
                      <span>{puppy.birth_date || 'TBD'}</span>
                    </div>
                    {puppy.estimated_adult_weight && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. Weight:</span>
                        <span>{puppy.estimated_adult_weight} lbs</span>
                      </div>
                    )}
                    {puppy.microchip_id && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Microchip:</span>
                        <span className="text-xs">{puppy.microchip_id}</span>
                      </div>
                    )}
                  </div>

                  {puppy.notes && (
                    <div className="mt-2 p-2 bg-secondary/20 rounded text-xs">
                      <span className="text-muted-foreground">Notes: </span>
                      {puppy.notes}
                    </div>
                  )}

                  <div className="flex gap-1 mt-3">
                    {['available', 'reserved', 'sold'].map((status) => (
                      <Button
                        key={status}
                        variant={puppy.status === status ? "default" : "outline"}
                        size="sm"
                        className="text-xs capitalize flex-1"
                        onClick={() => {
                          if (litter.id && puppy.id && puppy.status !== status) {
                            onUpdatePuppyStatus(litter.id, puppy.id, status)
                          }
                        }}
                        disabled={puppy.status === status}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                      </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Dog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No puppies added yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Homepage Management Component (keeping the existing one)
function HomepageManagement({ content, onUpdate }: { 
  content: HomepageContent; 
  onUpdate: () => void;
}) {
  const [showHeroUpload, setShowHeroUpload] = useState(false)
  const [editingHeroImage, setEditingHeroImage] = useState<HeroImage | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const handleHeroImageUpload = async (files: File[], title?: string, subtitle?: string, altText?: string) => {
    if (files.length === 0) return

    const toastId = toast.loading(`Uploading ${files.length} image(s)...`)
    let successCount = 0

    try {
      for (let i = 0; i < files.length; i++) {
        try {
          await api.uploadHeroImage(files[i], title, subtitle, altText || `Hero image ${i + 1}`)
          successCount++
          toast.loading(`Uploaded ${successCount}/${files.length} images...`, { id: toastId })
        } catch (error) {
          console.error(`Failed to upload image ${i + 1}:`, error)
        }
      }

      onUpdate()
      setShowHeroUpload(false)
      
      if (successCount === files.length) {
        toast.success(`All ${successCount} images uploaded successfully!`, { id: toastId })
      } else if (successCount > 0) {
        toast.success(`${successCount} of ${files.length} images uploaded successfully!`, { id: toastId })
      } else {
        toast.error('Failed to upload any images', { id: toastId })
      }
    } catch (error) {
      console.error('Failed to upload hero images:', error)
      toast.error('Upload failed', { id: toastId })
    }
  }

  const handleDeleteHeroImage = async (heroId: string) => {
    try {
      await api.deleteHeroImage(heroId)
      onUpdate()
      toast.success('Hero image deleted successfully!')
    } catch (error) {
      console.error('Failed to delete hero image:', error)
      toast.error(
        'Failed to delete image',
        {
          description: error instanceof Error ? error.message : 'Please try again'
        }
      )
    }
  }

  const handleEditHeroImage = (image: HeroImage) => {
    setEditingHeroImage(image)
    setShowEditDialog(true)
  }

  const handleUpdateHeroImage = async (updates: { title?: string; subtitle?: string; alt_text?: string }) => {
    if (!editingHeroImage) return

    try {
      await api.updateHeroImage(editingHeroImage.id, updates)
      onUpdate()
      setShowEditDialog(false)
      setEditingHeroImage(null)
      toast.success('Hero image updated successfully!')
    } catch (error) {
      console.error('Failed to update hero image:', error)
      toast.error(
        'Failed to update image',
        {
          description: error instanceof Error ? error.message : 'Please try again'
        }
      )
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">Homepage Management</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your website's homepage content and images</p>
      </div>

      {/* Hero Images Section */}
      <Card className="breeder-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Hero Images
              </CardTitle>
              <CardDescription>
                Main images displayed on your homepage ({content.hero_images?.length || 0} images)
              </CardDescription>
            </div>
            <Dialog open={showHeroUpload} onOpenChange={setShowHeroUpload}>
              <DialogTrigger asChild>
                <Button className="glass-button-primary gap-2">
                  <Plus className="h-4 w-4" />
                  Add Hero Image
                </Button>
              </DialogTrigger>
              <HeroImageUploadDialog 
                onUpload={handleHeroImageUpload}
                onClose={() => setShowHeroUpload(false)}
              />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {content.hero_images && content.hero_images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {content.hero_images.map((image) => (
                <div key={image.id} className="relative group">
                  <ImageCarousel 
                    images={[image.image_url]}
                    alt={image.alt_text}
                    className="w-full"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="glass-button"
                      onClick={() => handleEditHeroImage(image)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="glass-button"
                      onClick={() => handleDeleteHeroImage(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {image.title && (
                    <div className="mt-2">
                      <p className="font-medium text-sm">{image.title}</p>
                      {image.subtitle && (
                        <p className="text-xs text-muted-foreground">{image.subtitle}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hero images uploaded yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add some beautiful images to showcase your puppies</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Hero Image Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Hero Image</DialogTitle>
          </DialogHeader>
          {editingHeroImage && (
            <HeroImageEditForm 
              image={editingHeroImage}
              onSave={handleUpdateHeroImage}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Hero Image Edit Form Component
function HeroImageEditForm({ 
  image, 
  onSave, 
  onCancel 
}: { 
  image: HeroImage;
  onSave: (updates: { title?: string; subtitle?: string; alt_text?: string }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(image.title || '')
  const [subtitle, setSubtitle] = useState(image.subtitle || '')
  const [altText, setAltText] = useState(image.alt_text || '')

  const handleSave = () => {
    onSave({
      title: title || undefined,
      subtitle: subtitle || undefined,
      alt_text: altText || undefined
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="edit-title">Title (Optional)</Label>
        <Input
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Hero image title"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="edit-subtitle">Subtitle (Optional)</Label>
        <Input
          id="edit-subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Hero image subtitle"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="edit-alt">Alt Text</Label>
        <Input
          id="edit-alt"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Describe the image for accessibility"
          className="mt-1"
          required
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} className="flex-1" disabled={!altText.trim()}>
          Save Changes
        </Button>
      </div>
    </div>
  )
}

// Hero Image Upload Dialog (keeping the existing one)
function HeroImageUploadDialog({ 
  onUpload, 
  onClose 
}: { 
  onUpload: (files: File[], title?: string, subtitle?: string, altText?: string) => void;
  onClose: () => void;
}) {
  const [files, setFiles] = useState<File[]>([])
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [altText, setAltText] = useState('')
  const [previews, setPreviews] = useState<string[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles)
      
      // Generate previews for all selected files
      const previewPromises = selectedFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
      })
      
      Promise.all(previewPromises).then(setPreviews)
    }
  }

  const handleUpload = () => {
    if (files.length > 0) {
      onUpload(files, title || undefined, subtitle || undefined, altText || 'Hero image')
    }
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Upload Hero Image</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div>
          <Label htmlFor="hero-file">Select Images</Label>
          <Input
            id="hero-file"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="mt-1"
          />
          {files.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {files.length} image(s) selected
            </p>
          )}
        </div>

        {previews.length > 0 && (
          <div className="space-y-2">
            <Label>Image Previews</Label>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {previews.map((preview, index) => (
                <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="hero-title">Title (Optional)</Label>
          <Input
            id="hero-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Hero image title"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="hero-subtitle">Subtitle (Optional)</Label>
          <Input
            id="hero-subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Hero image subtitle"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="hero-alt">Alt Text</Label>
          <Input
            id="hero-alt"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Describe the image for accessibility"
            className="mt-1"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="glass-button flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={files.length === 0}
            className="glass-button-primary flex-1"
          >
            Upload {files.length > 1 ? `${files.length} Images` : 'Image'}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

// Inquiries Management Component (keeping the existing one)
function InquiriesManagement({ 
  inquiries, 
  onMarkResponded, 
  formatDate 
}: {
  inquiries: ContactInquiry[];
  onMarkResponded: (id: string) => void;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">Customer Inquiries</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Manage customer inquiries and messages</p>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {inquiries.map((inquiry) => (
          <Card key={inquiry.id} className="breeder-card">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg truncate">{inquiry.name}</CardTitle>
                  <CardDescription className="text-sm truncate">
                    {inquiry.email} {inquiry.phone && `• ${inquiry.phone}`}
                  </CardDescription>
                </div>
                <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 sm:gap-1 flex-shrink-0">
                  <Badge variant={inquiry.responded ? "secondary" : "destructive"} className="text-xs">
                    {inquiry.responded ? "Responded" : "Pending"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(inquiry.submitted_at)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {inquiry.puppy_name && (
                <p className="text-sm text-primary mb-2">
                  <strong>Interested in:</strong> {inquiry.puppy_name}
                  {inquiry.litter_name && ` (${inquiry.litter_name})`}
                </p>
              )}
              <div className="bg-secondary/30 p-3 rounded-lg mb-4">
                <p className="text-sm">{inquiry.message}</p>
              </div>
              {!inquiry.responded && (
                <Button 
                  onClick={() => onMarkResponded(inquiry.id)}
                  className="glass-button-primary gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Mark as Responded
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        {inquiries.length === 0 && (
          <Card className="breeder-card">
            <CardContent className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No inquiries yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Edit Litter Flow Component
function EditLitterFlow({ litter, onSuccess, onCancel }: {
  litter: Litter;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(1)
  const [litterData, setLitterData] = useState({
    name: litter.name,
    breed: litter.breed,
    generation: litter.generation,
    birth_date: litter.birth_date || '',
    expected_date: litter.expected_date || '',
    description: litter.description || '',
    mother: {
      name: litter.mother.name,
      breed: litter.mother.breed,
      color: litter.mother.color,
      health_clearances: litter.mother.health_clearances || [],
      image_url: litter.mother.image_url
    },
    father: {
      name: litter.father.name,
      breed: litter.father.breed,
      color: litter.father.color,
      health_clearances: litter.father.health_clearances || [],
      image_url: litter.father.image_url
    },
    is_current: litter.is_current
  })
  const [puppies, setPuppies] = useState<Array<{
    id?: string;
    name: string;
    gender: string;
    color: string;
    birth_date: string;
    estimated_adult_weight?: number;
    status: 'available' | 'reserved' | 'sold';
    microchip_id?: string;
    notes?: string;
    images?: File[];
    existing_images?: string[];
  }>>(litter.puppies.map(puppy => ({
    id: puppy.id,
    name: puppy.name,
    gender: puppy.gender,
    color: puppy.color,
    birth_date: puppy.birth_date,
    estimated_adult_weight: puppy.estimated_adult_weight,
    status: puppy.status,
    microchip_id: puppy.microchip_id,
    notes: puppy.notes,
    existing_images: Array.isArray(puppy.images) ? puppy.images : []
  })))
  const [loading, setLoading] = useState(false)

  // Modal state for handling active litter conflicts
  const [showActiveLitterModal, setShowActiveLitterModal] = useState(false)
  const [existingActiveLitter, setExistingActiveLitter] = useState<{ id: string; name: string } | null>(null)

  const steps = [
    { number: 1, title: 'Litter Information', description: 'Basic litter details' },
    { number: 2, title: 'Parent Information', description: 'Mother and father details' },
    { number: 3, title: 'Puppy Management', description: 'Edit puppies in the litter' },
    { number: 4, title: 'Review & Update', description: 'Confirm and update litter' }
  ]

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Helper function to sanitize puppy data before sending to backend (Edit mode)
  const sanitizePuppyDataForEdit = (puppy: any) => {
    return {
      name: puppy.name.trim(),
      gender: puppy.gender,
      color: puppy.color.trim(),
      birth_date: puppy.birth_date.trim(), // Required field - must be provided
      estimated_adult_weight: puppy.estimated_adult_weight && String(puppy.estimated_adult_weight).trim() !== '' 
        ? (typeof puppy.estimated_adult_weight === 'string' 
           ? parseFloat(puppy.estimated_adult_weight) 
           : puppy.estimated_adult_weight)
        : undefined,
      status: puppy.status,
      microchip_id: puppy.microchip_id && puppy.microchip_id.trim() ? puppy.microchip_id.trim() : undefined,
      notes: puppy.notes && puppy.notes.trim() ? puppy.notes.trim() : undefined
    }
  }

  const handleUpdateLitter = async (forceActive: boolean = false) => {
    if (!litter.id) return
    
    setLoading(true)
    try {
      // Update the litter first
      await api.updateLitter(litter.id, {
        name: litterData.name,
        breed: litterData.breed as any,
        generation: litterData.generation as any,
        birth_date: litterData.birth_date || undefined,
        expected_date: litterData.expected_date || undefined,
        description: litterData.description || undefined,
        mother: litterData.mother,
        father: litterData.father,
        is_current: litterData.is_current
      }, forceActive)

      // Handle puppy updates/additions
      for (const puppy of puppies) {
        const sanitizedPuppyData = sanitizePuppyDataForEdit(puppy)
        
        if (puppy.id) {
          // Update existing puppy
          await api.updatePuppy(litter.id, puppy.id, sanitizedPuppyData)
        } else {
          // Add new puppy
          await api.addPuppyToLitter(litter.id, sanitizedPuppyData)
        }
      }

      // Close modal if it was open
      setShowActiveLitterModal(false)
      setExistingActiveLitter(null)
      onSuccess()
    } catch (error: any) {
      console.error("Failed to update litter:", error)
      
      // Check if this is an active litter conflict (status 409)
      if (error.status === 409 && !forceActive && litterData.is_current) {
        // Check if we have the error data with existing litter info
        if (error.data?.detail?.existing_litter) {
          setExistingActiveLitter(error.data.detail.existing_litter);
          setShowActiveLitterModal(true);
          setLoading(false);
          return;
        } else {
          // Fallback: try to check for active litter
          try {
            const activeCheck = await api.checkActiveLitter();
            if (activeCheck.has_active_litter && activeCheck.active_litter && activeCheck.active_litter.id !== litter.id) {
              setExistingActiveLitter(activeCheck.active_litter);
              setShowActiveLitterModal(true);
              setLoading(false);
              return;
            }
          } catch (checkError) {
            console.error("Failed to check active litter:", checkError);
          }
        }
      }
      
      toast.error(
        "Failed to update litter",
        {
          description: error instanceof Error ? error.message : "Please try again"
        }
      )
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmMakeActive = () => {
    handleUpdateLitter(true);
  }

  const handleCancelActiveLitter = () => {
    setShowActiveLitterModal(false);
    setExistingActiveLitter(null);
    // Set the litter to not be current
    setLitterData(prev => ({ ...prev, is_current: false }));
  }

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1">Edit Litter: {litter.name}</h2>
          <p className="text-sm text-muted-foreground">Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}</p>
        </div>
        <Button variant="outline" onClick={onCancel} className="glass-button self-start sm:self-auto">
          Cancel
        </Button>
      </div>

      {/* Progress Steps */}
      <Card className="breeder-card">
        <CardContent className="pt-4 sm:pt-6">
          {/* Mobile: Vertical Progress */}
          <div className="block sm:hidden space-y-3">
            {steps.map((step) => (
              <div key={step.number} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                  step.number <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step.number < currentStep ? <Check className="h-4 w-4" /> : step.number}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${
                    step.number <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Horizontal Progress */}
          <div className="hidden sm:flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.number <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step.number < currentStep ? <Check className="h-4 w-4" /> : step.number}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium whitespace-nowrap ${
                    step.number <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-px w-8 lg:w-12 mx-4 ${
                    step.number < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="breeder-card">
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <LitterInfoStep 
              data={litterData}
              onChange={setLitterData}
            />
          )}

          {currentStep === 2 && (
            <ParentInfoStep 
              data={litterData}
              onChange={setLitterData}
              isEdit={true}
              litterId={litter.id}
            />
          )}

          {currentStep === 3 && (
            <PuppyManagementStep 
              puppies={puppies}
              onChange={setPuppies}
              litterBirthDate={litterData.birth_date}
              litterId={litter.id!}
              isEdit={true}
            />
          )}

          {currentStep === 4 && (
            <ReviewStep 
              litterData={litterData}
              puppies={puppies}
              isEdit={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="glass-button gap-2 w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        {currentStep < steps.length ? (
          <Button onClick={handleNext} className="glass-button-primary gap-2 w-full sm:w-auto">
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={() => handleUpdateLitter()} 
            disabled={loading}
            className="glass-button-primary gap-2 w-full sm:w-auto"
          >
            {loading ? "Updating..." : "Update Litter"}
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active Litter Conflict Modal */}
      <Dialog open={showActiveLitterModal} onOpenChange={setShowActiveLitterModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-orange-700">
              Active Litter Already Exists
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                There is already an active litter: <strong>"{existingActiveLitter?.name}"</strong>
              </p>
              <p>
                Only one litter can be active at a time. Would you like to make this litter active instead? 
                This will automatically set the existing litter to inactive.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleCancelActiveLitter}
                className="flex-1"
              >
                No, Keep Existing Active
              </Button>
              <Button
                onClick={handleConfirmMakeActive}
                disabled={loading}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {loading ? "Updating..." : "Yes, Make This Active"}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              You can change the active litter later from the litter management page.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Puppy Management Step Component
function PuppyManagementStep({ puppies, onChange, litterBirthDate, litterId, isEdit }: {
  puppies: Array<{
    id?: string;
    name: string;
    gender: string;
    color: string;
    birth_date: string;
    estimated_adult_weight?: number;
    status: 'available' | 'reserved' | 'sold';
    microchip_id?: string;
    notes?: string;
    images?: File[];
    existing_images?: string[];
  }>;
  onChange: (puppies: any[]) => void;
  litterBirthDate: string;
  litterId?: string;
  isEdit?: boolean;
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPuppyIndex, setEditingPuppyIndex] = useState<number | null>(null)
  const [newPuppy, setNewPuppy] = useState({
    name: '',
    gender: 'Male',
    color: '',
    birth_date: litterBirthDate || '',
    estimated_adult_weight: undefined as number | undefined,
    status: 'available' as 'available' | 'reserved' | 'sold',
    microchip_id: '',
    notes: '',
    images: [] as File[]
  })

  const handleAddPuppy = async () => {
    if (newPuppy.name && newPuppy.color && litterId && isEdit) {
      try {
        // Add puppy to backend if we're in edit mode
        const addedPuppy = await api.addPuppyToLitter(litterId, {
          name: newPuppy.name,
          gender: newPuppy.gender,
          color: newPuppy.color,
          birth_date: newPuppy.birth_date,
          estimated_adult_weight: newPuppy.estimated_adult_weight,
          status: newPuppy.status,
          microchip_id: newPuppy.microchip_id,
          notes: newPuppy.notes
        })
        
        // Upload images if any
        let uploadedImageUrls: string[] = []
        if (newPuppy.images && newPuppy.images.length > 0 && addedPuppy.id) {
          const uploadPromises = newPuppy.images.map((file: File) => 
            api.uploadPuppyImage(addedPuppy.id!, file)
          )
          const results = await Promise.all(uploadPromises)
          uploadedImageUrls = results.map(result => result.image_url)
        }

        onChange([...puppies, {
          ...addedPuppy,
          existing_images: uploadedImageUrls
        }])
        
        toast.success(`Added ${newPuppy.name} successfully!`)
      } catch (error) {
        console.error('Failed to add puppy:', error)
        toast.error(
          'Failed to add puppy',
          {
            description: error instanceof Error ? error.message : 'Please try again'
          }
        )
        return
      }
    } else if (newPuppy.name && newPuppy.color) {
      // Just add to local state if not in edit mode
      onChange([...puppies, { ...newPuppy }])
    }
    
    setNewPuppy({
      name: '',
      gender: 'Male',
      color: '',
      birth_date: litterBirthDate || '',
      estimated_adult_weight: undefined,
      status: 'available',
      microchip_id: '',
      notes: '',
      images: []
    })
    setShowAddForm(false)
  }

  const handleEditPuppy = (index: number) => {
    setEditingPuppyIndex(index)
  }

  const handleSaveEdit = async (index: number, updatedPuppy: any) => {
    if (updatedPuppy.id && litterId && isEdit) {
      try {
        // Update puppy in backend
        await api.updatePuppy(litterId, updatedPuppy.id, {
          name: updatedPuppy.name,
          gender: updatedPuppy.gender,
          color: updatedPuppy.color,
          birth_date: updatedPuppy.birth_date,
          estimated_adult_weight: updatedPuppy.estimated_adult_weight,
          status: updatedPuppy.status,
          microchip_id: updatedPuppy.microchip_id,
          notes: updatedPuppy.notes
        })
          toast.success(`Updated ${updatedPuppy.name} successfully!`)
      } catch (error) {
        console.error('Failed to update puppy:', error)
        toast.error(
          'Failed to update puppy',
          {
            description: error instanceof Error ? error.message : 'Please try again'
          }
        )
        return
      }
    }
    
    const newPuppies = [...puppies]
    newPuppies[index] = updatedPuppy
    onChange(newPuppies)
    setEditingPuppyIndex(null)
  }

  const handleRemovePuppy = async (index: number) => {
    const puppy = puppies[index]
    
    if (puppy.id && litterId && isEdit) {
      // Delete from backend if it's an existing puppy
      try {
        const toastId = toast.loading(`Deleting ${puppy.name}...`)
        await api.deletePuppy(litterId, puppy.id)
        onChange(puppies.filter((_, i) => i !== index))
        
        toast.dismiss(toastId)
        toast.success(`${puppy.name} deleted successfully`)
      } catch (error) {
        console.error('Failed to delete puppy:', error)
        toast.error(
          `Failed to delete ${puppy.name}`,
          {
            description: error instanceof Error ? error.message : 'Please try again'
          }
        )
      }
    } else {
      // Just remove from local state if it's a new puppy
      onChange(puppies.filter((_, i) => i !== index))
      toast.success(`Removed ${puppy.name} from list`)
    }
  }

  // Image management is now handled in the PuppyForm component

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'reserved':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'sold':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">{isEdit ? 'Manage Puppies' : 'Puppy Information'}</h3>
          <p className="text-sm text-muted-foreground">
            {isEdit ? 'Edit, add, or remove puppies in this litter' : 'Add individual puppies to this litter'} ({puppies.length} puppies)
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Puppy
        </Button>
      </div>

      {/* Add Puppy Form */}
      {showAddForm && (
        <Card className="breeder-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Add New Puppy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PuppyForm
              puppy={newPuppy}
              onChange={setNewPuppy}
              onSave={handleAddPuppy}
              onCancel={() => setShowAddForm(false)}
              isNew={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Existing Puppies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {puppies.map((puppy, index) => (
          <Card key={puppy.id || index} className="breeder-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{puppy.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-xs ${getStatusColor(puppy.status)}`}>
                      {puppy.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{puppy.gender}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPuppy(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemovePuppy(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingPuppyIndex === index ? (
                <PuppyForm
                  puppy={puppy}
                  onChange={(updatedPuppy) => handleSaveEdit(index, updatedPuppy)}
                  onSave={() => setEditingPuppyIndex(null)}
                  onCancel={() => setEditingPuppyIndex(null)}
                  isEdit={true}
                />
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Color:</span>
                      <p className="font-medium">{puppy.color}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Birth Date:</span>
                      <p className="font-medium">{puppy.birth_date || 'TBD'}</p>
                    </div>
                    {puppy.estimated_adult_weight && (
                      <div>
                        <span className="text-muted-foreground">Est. Weight:</span>
                        <p className="font-medium">{puppy.estimated_adult_weight} lbs</p>
                      </div>
                    )}
                    {puppy.microchip_id && (
                      <div>
                        <span className="text-muted-foreground">Microchip:</span>
                        <p className="font-medium text-xs">{puppy.microchip_id}</p>
                      </div>
                    )}
                  </div>
                  
                  {puppy.notes && (
                    <div>
                      <span className="text-muted-foreground text-sm">Notes:</span>
                      <p className="text-sm mt-1">{puppy.notes}</p>
                    </div>
                  )}

                  {/* Images Display */}
                  {puppy.existing_images && puppy.existing_images.length > 0 && (
                    <div>
                      <span className="text-muted-foreground text-sm">Images ({puppy.existing_images.length}):</span>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {puppy.existing_images.slice(0, 3).map((imageUrl, imageIndex) => (
                          <div key={imageIndex} className="relative">
                            <img 
                              src={imageUrl} 
                              alt={`${puppy.name} ${imageIndex + 1}`}
                              className="w-full h-16 object-cover rounded border"
                            />
                            {puppy.existing_images && puppy.existing_images.length > 3 && imageIndex === 2 && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                                <span className="text-white text-xs font-medium">
                                  +{puppy.existing_images.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(!puppy.existing_images || puppy.existing_images.length === 0) && (
                    <div className="text-center py-4 border-2 border-dashed border-muted rounded">
                      <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No images uploaded</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {puppies.length === 0 && (
        <div className="text-center py-8">
          <Dog className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No puppies added yet</p>
          <p className="text-sm text-muted-foreground mt-1">Click "Add Puppy" to get started</p>
        </div>
      )}
    </div>
  )
}

// Puppy Form Component
function PuppyForm({ puppy, onChange, onSave, onCancel, isNew, isEdit }: {
  puppy: any;
  onChange: (puppy: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isNew?: boolean;
  isEdit?: boolean;
}) {
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const handleFieldChange = (field: string, value: any) => {
    onChange({ ...puppy, [field]: value })
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    console.log('Files selected:', files)
    
    if (files && files.length > 0) {
      const fileArray = Array.from(files)
      console.log('File array:', fileArray)
      handleFieldChange('images', fileArray)
      
      // Create previews
      const previews: string[] = []
      let loadedCount = 0
      
      fileArray.forEach((file, index) => {
        console.log(`Reading file ${index + 1}:`, file.name)
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          previews[index] = result
          loadedCount++
          
          if (loadedCount === fileArray.length) {
            console.log('All previews loaded:', previews)
            setNewImagePreviews(previews)
          }
        }
        reader.onerror = (e) => {
          console.error('Error reading file:', file.name, e)
        }
        reader.readAsDataURL(file)
      })
    } else {
      console.log('No files selected')
      handleFieldChange('images', [])
      setNewImagePreviews([])
    }
  }

  const handleRemoveNewImage = (index: number) => {
    const currentImages = puppy.images || []
    const newImages = currentImages.filter((_: any, i: number) => i !== index)
    handleFieldChange('images', newImages)
    
    const newPreviews = newImagePreviews.filter((_, i) => i !== index)
    setNewImagePreviews(newPreviews)
  }

  const handleRemoveExistingImage = async (index: number) => {
    if (!puppy.id || !puppy.existing_images) {
      toast.error('Cannot delete image: missing puppy ID or images')
      return
    }
    
    const imageUrl = puppy.existing_images[index]
    const imageName = imageUrl.split('/').pop() || 'image'
    
    try {
      setUploading(true)
      const toastId = toast.loading(`Deleting ${imageName}...`)
      
      console.log('Deleting image at index:', index, 'for puppy:', puppy.id)
      await api.deletePuppyImage(puppy.id, index)
      
      const newExistingImages = puppy.existing_images.filter((_: string, i: number) => i !== index)
      console.log('Images after deletion:', newExistingImages)
      handleFieldChange('existing_images', newExistingImages)
      
      toast.dismiss(toastId)
      toast.success('Image deleted successfully!')
    } catch (error) {
      console.error('Failed to delete image:', error)
      toast.error(
        'Failed to delete image',
        {
          description: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      )
    } finally {
      setUploading(false)
    }
  }

  const handleUploadImages = async () => {
    if (!puppy.id || !puppy.images || puppy.images.length === 0) {
      toast.error('No images selected to upload')
      return
    }
    
    setUploading(true)
    const toastId = toast.loading(`Uploading ${puppy.images.length} image(s)...`)
    
    const successfulUploads: string[] = []
    const failedUploads: { file: File; error: string }[] = []
    
    // Upload each image individually to handle partial failures
    for (let i = 0; i < puppy.images.length; i++) {
      const file = puppy.images[i]
      try {
        console.log(`Uploading file ${i + 1}/${puppy.images.length}:`, file.name)
        const result = await api.uploadPuppyImage(puppy.id, file)
        successfulUploads.push(result.image_url)
        
        // Update toast with progress
        toast.loading(`Uploading image ${i + 1}/${puppy.images.length}...`, { id: toastId })
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        failedUploads.push({ 
          file, 
          error: error instanceof Error ? error.message : 'Upload failed' 
        })
      }
    }
    
    // Update UI with successful uploads
    if (successfulUploads.length > 0) {
      const currentExisting = puppy.existing_images || []
      const updatedImages = [...currentExisting, ...successfulUploads]
      handleFieldChange('existing_images', updatedImages)
    }
    
    // Remove successful uploads from preview and keep failed ones
    const remainingFiles = puppy.images.filter((file: File) => {
      return failedUploads.some(failed => failed.file === file)
    })
    
    const remainingPreviews = newImagePreviews.filter((_, index) => {
      const file = puppy.images[index]
      return failedUploads.some(failed => failed.file === file)
    })
    
    handleFieldChange('images', remainingFiles)
    setNewImagePreviews(remainingPreviews)
    
    // Clear file input if all uploads succeeded
    if (failedUploads.length === 0) {
      const fileInput = document.getElementById('puppy-images') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    }
    
    // Show results
    setUploading(false)
    toast.dismiss(toastId)
    
    if (successfulUploads.length > 0 && failedUploads.length === 0) {
      toast.success(`Successfully uploaded ${successfulUploads.length} image(s)!`)
    } else if (successfulUploads.length > 0 && failedUploads.length > 0) {
      toast.warning(
        `Uploaded ${successfulUploads.length} image(s). ${failedUploads.length} failed.`,
        {
          description: `Failed: ${failedUploads.map(f => f.file.name).join(', ')}`
        }
      )
    } else {
      toast.error(
        `Failed to upload ${failedUploads.length} image(s)`,
        {
          description: failedUploads.length === 1 
            ? failedUploads[0].error 
            : 'Multiple upload errors occurred'
        }
      )
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="puppy-name">Name *</Label>
          <Input
            id="puppy-name"
            value={puppy.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder="Puppy's name"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="puppy-gender">Gender</Label>
          <select
            id="puppy-gender"
            value={puppy.gender}
            onChange={(e) => handleFieldChange('gender', e.target.value)}
            className="w-full p-2 border rounded-md mt-1"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="puppy-color">Color *</Label>
          <Input
            id="puppy-color"
            value={puppy.color}
            onChange={(e) => handleFieldChange('color', e.target.value)}
            placeholder="e.g., Golden, Cream, Red"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="puppy-birth-date">Birth Date</Label>
          <Input
            id="puppy-birth-date"
            type="date"
            value={puppy.birth_date}
            onChange={(e) => handleFieldChange('birth_date', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="puppy-weight">Estimated Adult Weight (lbs)</Label>
          <Input
            id="puppy-weight"
            type="number"
            value={puppy.estimated_adult_weight || ''}
            onChange={(e) => handleFieldChange('estimated_adult_weight', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="25"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="puppy-status">Status</Label>
          <select
            id="puppy-status"
            value={puppy.status}
            onChange={(e) => handleFieldChange('status', e.target.value)}
            className="w-full p-2 border rounded-md mt-1"
          >
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="puppy-microchip">Microchip ID</Label>
        <Input
          id="puppy-microchip"
          value={puppy.microchip_id || ''}
          onChange={(e) => handleFieldChange('microchip_id', e.target.value)}
          placeholder="Optional microchip number"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="puppy-notes">Notes</Label>
        <Textarea
          id="puppy-notes"
          value={puppy.notes || ''}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          placeholder="Any special notes about this puppy"
          className="mt-1"
          rows={2}
        />
      </div>

      {/* Image Management */}
      <div className="space-y-4">
        <div>
          <Label>Images</Label>
          
          {/* Existing Images */}
          {puppy.existing_images && puppy.existing_images.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-2">Current Images:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {puppy.existing_images.map((imageUrl: string, index: number) => (
                  <div key={index} className="relative group">
                    <img 
                      src={imageUrl} 
                      alt={`${puppy.name} ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveExistingImage(index)}
                      disabled={uploading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Image Previews */}
          {newImagePreviews.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-2">New Images to Upload:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {newImagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveNewImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              {puppy.id && (
                <Button
                  type="button"
                  onClick={handleUploadImages}
                  disabled={uploading}
                  className="mt-2 gap-2"
                  size="sm"
                >
                  {uploading ? 'Uploading...' : 'Upload Images'}
                  <Upload className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* File Input */}
          <div className="mt-2">
            <Input
              id="puppy-images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {puppy.id ? 'Select images and click "Upload Images" to save them.' : 'Images will be uploaded after the puppy is saved.'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} className="flex-1" disabled={uploading}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={!puppy.name || !puppy.color || uploading} className="flex-1">
          {uploading ? 'Processing...' : (isNew ? 'Add Puppy' : 'Save Changes')}
        </Button>
      </div>
    </div>
  )
}

// Puppy Edit Form for Litter Detail View
function PuppyEditForm({ puppy, onSave, onCancel, onUpdate }: {
  puppy: any;
  onSave: (puppy: any) => void;
  onCancel: () => void;
  onUpdate?: () => void;
}) {
  const [formData, setFormData] = useState({
    name: puppy.name,
    gender: puppy.gender,
    color: puppy.color,
    birth_date: puppy.birth_date,
    estimated_adult_weight: puppy.estimated_adult_weight || '',
    status: puppy.status,
    microchip_id: puppy.microchip_id || '',
    notes: puppy.notes || ''
  })
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      setSelectedImages(fileArray)
      
      // Create previews
      const previews: string[] = []
      fileArray.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          previews.push(e.target?.result as string)
          if (previews.length === fileArray.length) {
            setImagePreviews(previews)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleUploadImages = async () => {
    if (!puppy.id || selectedImages.length === 0) return
    
    try {
      setUploading(true)
      const uploadPromises = selectedImages.map(file => 
        api.uploadPuppyImage(puppy.id, file)
      )
      
      const results = await Promise.all(uploadPromises)
      
      // Clear selections after successful upload
      setSelectedImages([])
      setImagePreviews([])
      
      // Clear file input
      const fileInput = document.getElementById(`edit-puppy-images-${puppy.id}`) as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
      toast.success(`Successfully uploaded ${results.length} image(s)!`)
    } catch (error) {
      console.error('Failed to upload images:', error)
      toast.error(
        'Failed to upload images',
        {
          description: error instanceof Error ? error.message : 'Please try again'
        }
      )
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async (imageIndex: number) => {
    if (!puppy.id || !puppy.existing_images) return
    
    try {
      setUploading(true)
      await api.deletePuppyImage(puppy.id, imageIndex)
      
      toast.success('Image deleted successfully!')
      
      // Trigger parent component refresh to update the UI
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error('Failed to delete image:', error)
      toast.error(
        'Failed to delete image',
        {
          description: error instanceof Error ? error.message : 'Please try again'
        }
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-lg">Edit {puppy.name}</h4>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => onSave(formData)} disabled={uploading}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-name">Name</Label>
          <Input
            id="edit-name"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="edit-gender">Gender</Label>
          <select
            id="edit-gender"
            value={formData.gender}
            onChange={(e) => handleFieldChange('gender', e.target.value)}
            className="w-full p-2 border rounded-md mt-1"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-color">Color</Label>
          <Input
            id="edit-color"
            value={formData.color}
            onChange={(e) => handleFieldChange('color', e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="edit-birth-date">Birth Date</Label>
          <Input
            id="edit-birth-date"
            type="date"
            value={formData.birth_date}
            onChange={(e) => handleFieldChange('birth_date', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-weight">Estimated Adult Weight (lbs)</Label>
          <Input
            id="edit-weight"
            type="number"
            value={formData.estimated_adult_weight}
            onChange={(e) => handleFieldChange('estimated_adult_weight', e.target.value ? parseInt(e.target.value) : '')}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="edit-status">Status</Label>
          <select
            id="edit-status"
            value={formData.status}
            onChange={(e) => handleFieldChange('status', e.target.value)}
            className="w-full p-2 border rounded-md mt-1"
          >
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="edit-microchip">Microchip ID</Label>
        <Input
          id="edit-microchip"
          value={formData.microchip_id}
          onChange={(e) => handleFieldChange('microchip_id', e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="edit-notes">Notes</Label>
        <Textarea
          id="edit-notes"
          value={formData.notes}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          className="mt-1"
          rows={2}
        />
      </div>

      {/* Image Management */}
      <div className="space-y-4 border-t pt-4">
        <h5 className="font-medium">Image Management</h5>
        
        {/* Current Images */}
        {puppy.existing_images && puppy.existing_images.length > 0 && (
          <div>
            <Label className="text-sm">Current Images:</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {puppy.existing_images.map((imageUrl: string, index: number) => (
                <div key={index} className="relative group">
                  <img 
                    src={imageUrl} 
                    alt={`${puppy.name} ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteImage(index)}
                    disabled={uploading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Image Previews */}
        {imagePreviews.length > 0 && (
          <div>
            <Label className="text-sm">New Images to Upload:</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                </div>
              ))}
            </div>
            <Button
              type="button"
              onClick={handleUploadImages}
              disabled={uploading}
              className="mt-2 gap-2"
              size="sm"
            >
              {uploading ? 'Uploading...' : 'Upload Images'}
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* File Input */}
        <div>
          <Label htmlFor={`edit-puppy-images-${puppy.id}`} className="text-sm">Add New Images:</Label>
          <Input
            id={`edit-puppy-images-${puppy.id}`}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  )
}

export const AdminDashboard = withAuth(AdminDashboardComponent)