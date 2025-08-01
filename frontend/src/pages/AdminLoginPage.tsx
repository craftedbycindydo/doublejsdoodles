import * as React from "react"
import { useState } from "react"
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
import { useAuth } from "../contexts/AuthContext"
import { api } from "../lib/api"

export function AdminLoginPage() {
  const [mode, setMode] = useState<'login' | 'create'>('login')
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    confirmPassword: '',
    adminPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
    adminPassword: false
  })
  
  const { login, isAuthenticated } = useAuth()

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword' | 'adminPassword') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/admin'
    }
  }, [isAuthenticated])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error and success when user starts typing
    if (error) setError('')
    if (success) setSuccess('')
  }

  const handleModeToggle = () => {
    setMode(mode === 'login' ? 'create' : 'login')
    setFormData({
      username: '',
      password: '',
      email: '',
      confirmPassword: '',
      adminPassword: ''
    })
    setError('')
    setSuccess('')
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const success = await login(formData.username, formData.password)
      
      if (success) {
        window.location.href = '/admin'
      } else {
        setError('Invalid username or password. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Login failed. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    if (!formData.adminPassword) {
      setError('Admin password is required')
      setIsLoading(false)
      return
    }

    try {
      await api.createAdminAccount(
        formData.username,
        formData.email,
        formData.password,
        formData.confirmPassword,
        formData.adminPassword
      )
      
      setSuccess('Admin account created successfully! You can now log in.')
      setFormData({
        username: '',
        password: '',
        email: '',
        confirmPassword: '',
        adminPassword: ''
      })
      // Switch to login mode after successful creation
      setTimeout(() => {
        setMode('login')
        setSuccess('')
      }, 2000)
      
    } catch (error: any) {
      console.error('Account creation error:', error)
      if (error.message.includes('401')) {
        setError('Invalid admin password. Please contact an existing administrator.')
      } else if (error.message.includes('400')) {
        setError('Invalid input. Please check all fields and try again.')
      } else if (error.message.includes('Username already exists')) {
        setError('An account with this email already exists.')
      } else {
        setError('Account creation failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-breeder-gradient flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {mode === 'login' ? 'Admin Login' : 'Create Admin Account'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'login' 
                                ? 'Sign in to access the Double Js Doodles admin dashboard'
                  : 'Create a new admin account for Double Js Doodles'
            }
          </p>
        </div>

        {/* Login/Create Card */}
        <Card className="breeder-card shadow-glass-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-foreground">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {mode === 'login'
                ? 'Enter your credentials to manage litters and view inquiries'
                : 'Fill in the details below to create a new admin account'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="username" className="text-foreground">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    className="mt-1 input-glass"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      name="password"
                      type={showPasswords.password ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="pr-10 input-glass"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center glass-button rounded-r-lg"
                      onClick={() => togglePasswordVisibility('password')}
                    >
                      {showPasswords.password ? (
                        <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="glass-card border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm shadow-glass">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full glass-button-primary shadow-glass-lg"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="username" className="text-foreground">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Choose your admin username"
                    className="mt-1 input-glass"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="admin@doublejsdoodles.com"
                    className="mt-1 input-glass"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      name="password"
                      type={showPasswords.password ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password (min 8 characters)"
                      className="pr-10 input-glass"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center glass-button rounded-r-lg"
                      onClick={() => togglePasswordVisibility('password')}
                    >
                      {showPasswords.password ? (
                        <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPasswords.confirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="pr-10 input-glass"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center glass-button rounded-r-lg"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                    >
                      {showPasswords.confirmPassword ? (
                        <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="adminPassword" className="text-foreground">Admin Creation Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="adminPassword"
                      name="adminPassword"
                      type={showPasswords.adminPassword ? "text" : "password"}
                      required
                      value={formData.adminPassword}
                      onChange={handleInputChange}
                      placeholder="Enter admin creation password"
                      className="pr-10 input-glass"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center glass-button rounded-r-lg"
                      onClick={() => togglePasswordVisibility('adminPassword')}
                    >
                      {showPasswords.adminPassword ? (
                        <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Contact an existing administrator for this password</p>
                </div>

                {error && (
                  <div className="glass-card border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm shadow-glass">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="glass-card border border-primary/20 text-primary px-4 py-3 rounded-md text-sm shadow-glass">
                    {success}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full glass-button-primary shadow-glass-lg"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    'Create Admin Account'
                  )}
                </Button>
              </form>
            )}

            {/* Mode Toggle */}
            <div className="mt-6 text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleModeToggle}
                disabled={isLoading}
                className="glass-button text-sm text-muted-foreground hover:text-foreground"
              >
                {mode === 'login' 
                  ? 'Need to create an admin account?' 
                  : 'Already have an account? Sign in'
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}