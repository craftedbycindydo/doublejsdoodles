import * as React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu"
import { cn } from "../lib/utils"
import { useAuth } from "../contexts/AuthContext"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="glass-navbar rounded-2xl mx-4 mt-2">
      <div className="container mx-auto px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/logo.svg" 
                alt="Double Js Doodles Logo" 
                className="h-10 w-10"
              />
              <span className="text-xl font-bold text-foreground hidden sm:block">
                Double Js Doodles
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md glass-button px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                    asChild
                  >
                    <Link to="/">Home</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="glass-button">Available Puppies</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] glass-card rounded-lg">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md glass-card p-6 no-underline outline-none focus:shadow-md"
                            to="/litters"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium text-foreground">
                              Current Litters
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Browse our available puppies from current and upcoming litters.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <ListItem to="/litters" title="All Litters">
                        View information about our current and past litters.
                      </ListItem>
                      <ListItem to="/about" title="Parent Dogs">
                        Meet the amazing moms and dads of our puppies.
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md glass-button px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                    asChild
                  >
                    <Link to="/about">About Us</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    className="group inline-flex h-10 w-max items-center justify-center rounded-md glass-button px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                    asChild
                  >
                    <Link to="/contact">Contact</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Auth Button + Mobile Menu Toggle */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/admin')} className="glass-button">
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={logout} className="glass-button">
                  Logout
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden md:inline-flex glass-button"
                onClick={() => navigate('/admin/login')}
              >
                Admin Login
              </Button>
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden glass-button"
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border/20">
              <Link
                to="/"
                className="block px-3 py-2 text-base font-medium rounded-md glass-button hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/litters"
                className="block px-3 py-2 text-base font-medium rounded-md glass-button hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsOpen(false)}
              >
                Available Puppies
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 text-base font-medium rounded-md glass-button hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsOpen(false)}
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 text-base font-medium rounded-md glass-button hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              
              {/* Mobile Auth */}
              <div className="pt-2 border-t border-border/20">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/admin"
                      className="block px-3 py-2 text-base font-medium rounded-md glass-button hover:bg-accent hover:text-accent-foreground"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setIsOpen(false)
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium rounded-md glass-button hover:bg-accent hover:text-accent-foreground"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/admin/login"
                    className="block px-3 py-2 text-base font-medium rounded-md glass-button hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<typeof Link>,
  React.ComponentPropsWithoutRef<typeof Link> & { title: string }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"