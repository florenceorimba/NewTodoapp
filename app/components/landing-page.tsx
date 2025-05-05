"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "../components/auth-provider"
import { ThemeToggle } from "../components/theme-toggle"
import { CheckCircle, ListTodo, AlertCircle, Eye, EyeOff } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

type LoginData = {
  email: string
  password: string
}

type SignupData = {
  name: string
  email: string
  password: string
}

export function LandingPage() {
  const { login, signup, isLoading, error, clearError } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [loginData, setLoginData] = useState<LoginData>({ email: "", password: "" })
  const [signupData, setSignupData] = useState<SignupData>({ name: "", email: "", password: "" })
  const [activeTab, setActiveTab] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false)
  const [hasAttemptedSignup, setHasAttemptedSignup] = useState(false)
  const [formTouched, setFormTouched] = useState(false)

  // Add a local error state to ensure it persists
  const [localError, setLocalError] = useState<string | null>(null)

  // Track if we're switching tabs
  const isTabSwitchingRef = useRef(false)

  // Sync the error from auth provider to local state
  useEffect(() => {
    if (error) {
      setLocalError(error)
    }
  }, [error])

  // Debug the error state
  useEffect(() => {
    console.log("Current error state in component:", error)
    console.log("Current local error state:", localError)
  }, [error, localError])

  // Only clear errors when switching tabs
  useEffect(() => {
    isTabSwitchingRef.current = true

    // Clear local error state
    setLocalError(null)

    // Reset form state
    setFormTouched(false)
    setHasAttemptedLogin(false)
    setHasAttemptedSignup(false)

    // Allow clearing error in auth provider
    clearError()

    // Reset the flag after a short delay
    setTimeout(() => {
      isTabSwitchingRef.current = false
    }, 100)
  }, [activeTab, clearError])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setHasAttemptedLogin(true)
    setFormTouched(false)

    // Clear local error before attempt
    setLocalError(null)

    console.log("Attempting login with:", loginData.email)
    const success = await login(loginData.email, loginData.password)

    console.log("Login success:", success)
    console.log("Error after login attempt:", error)

    // If login failed, ensure we capture the error locally
    if (!success && error) {
      setLocalError(error)
    }

    if (success) {
      toast({
        title: "Login successful",
        description: "Welcome back to TodoApp!",
        variant: "success",
      })
      router.push("/dashboard")
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setHasAttemptedSignup(true)
    setFormTouched(false)

    // Clear local error before attempt
    setLocalError(null)

    const success = await signup(signupData.name, signupData.email, signupData.password)

    // If signup failed, ensure we capture the error locally
    if (!success && error) {
      setLocalError(error)
    }

    if (success) {
      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
        variant: "success",
      })
      router.push("/dashboard")
    }
  }

  // Modify the handleInputChange function to never clear errors during typing
  const handleInputChange = <T extends Record<string, string>>(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<T>>,
    field: keyof T,
  ) => {
    setter((prev) => ({ ...prev, [field]: e.target.value }))

    // Only set formTouched to true, but NEVER clear errors
    // This ensures errors persist until successful login
    setFormTouched(true)
  }

  // Determine if fields should show error state
  const shouldShowLoginFieldError = (localError || error) && hasAttemptedLogin && !formTouched
  const shouldShowSignupFieldError = (localError || error) && hasAttemptedSignup && !formTouched

  // Use the local error state or the auth provider error
  const displayError = localError || error

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
            <ListTodo className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold gradient-text">TodoApp</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 container grid md:grid-cols-2 gap-8 py-12 items-center">
        <div className="space-y-6 slide-in-left">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight gradient-text">Manage your tasks efficiently</h1>
            <p className="text-xl text-muted-foreground">
              TodoApp helps you organize your life with powerful task management features.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 transition-all duration-300 hover:translate-x-1">
              <CheckCircle className="h-5 w-5 text-primary" />
              <p>Create and organize tasks with categories and priorities</p>
            </div>
            <div className="flex items-center gap-2 transition-all duration-300 hover:translate-x-1">
              <CheckCircle className="h-5 w-5 text-primary" />
              <p>Filter and sort tasks to focus on what matters</p>
            </div>
            <div className="flex items-center gap-2 transition-all duration-300 hover:translate-x-1">
              <CheckCircle className="h-5 w-5 text-primary" />
              <p>Track your progress with intuitive visualizations</p>
            </div>
            <div className="flex items-center gap-2 transition-all duration-300 hover:translate-x-1">
              <CheckCircle className="h-5 w-5 text-primary" />
              <p>Customize the app to match your preferences</p>
            </div>
          </div>
        </div>

        <div className="slide-in-right">
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md mx-auto">
            <TabsList className="grid w-full grid-cols-2 transition-all duration-200">
              <TabsTrigger
                value="login"
                className="transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="animate-in fade-in-50 duration-300">
              <Card className="border-t-4 border-t-primary shadow-lg hover:shadow-xl transition-all duration-300">
                <form onSubmit={handleLogin}>
                  <CardHeader>
                    <CardTitle className="gradient-text">Login</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Error Alert - Make it more prominent */}
                    {displayError && (
                      <Alert variant="destructive" className="mb-4 animate-pulse">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <AlertDescription className="font-medium">{displayError}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginData.email}
                        onChange={(e) => handleInputChange(e, setLoginData, "email")}
                        required
                        className={cn(
                          "transition-all duration-200 focus:ring-2 focus:ring-primary",
                          shouldShowLoginFieldError &&
                            "border-destructive focus-visible:ring-destructive animate-pulse",
                          formTouched && "border-muted-foreground/20",
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={loginData.password}
                          onChange={(e) => handleInputChange(e, setLoginData, "password")}
                          required
                          className={cn(
                            "transition-all duration-200 focus:ring-2 focus:ring-primary",
                            shouldShowLoginFieldError &&
                              "border-destructive focus-visible:ring-destructive animate-pulse",
                            formTouched && "border-muted-foreground/20",
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground transition-all duration-200 hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full transition-all duration-300 hover:shadow-lg active:scale-95"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                          Logging in...
                        </span>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="signup" className="animate-in fade-in-50 duration-300">
              <Card className="border-t-4 border-t-primary shadow-lg hover:shadow-xl transition-all duration-300">
                <form onSubmit={handleSignup}>
                  <CardHeader>
                    <CardTitle className="gradient-text">Create an account</CardTitle>
                    <CardDescription>Enter your information to create a new account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {displayError && (
                      <Alert variant="destructive" className="mb-4 animate-pulse">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <AlertDescription className="font-medium">{displayError}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Name</Label>
                      <Input
                        id="signup-name"
                        placeholder="John Doe"
                        value={signupData.name}
                        onChange={(e) => handleInputChange(e, setSignupData, "name")}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signupData.email}
                        onChange={(e) => handleInputChange(e, setSignupData, "email")}
                        required
                        className={cn(
                          "transition-all duration-200 focus:ring-2 focus:ring-primary",
                          shouldShowSignupFieldError &&
                            "border-destructive focus-visible:ring-destructive animate-pulse",
                          formTouched && "border-muted-foreground/20",
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showSignupPassword ? "text" : "password"}
                          value={signupData.password}
                          onChange={(e) => handleInputChange(e, setSignupData, "password")}
                          required
                          className={cn(
                            "transition-all duration-200 focus:ring-2 focus:ring-primary",
                            shouldShowSignupFieldError &&
                              "border-destructive focus-visible:ring-destructive animate-pulse",
                            formTouched && "border-muted-foreground/20",
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground transition-all duration-200 hover:text-foreground"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                        >
                          {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{showSignupPassword ? "Hide password" : "Show password"}</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full transition-all duration-300 hover:shadow-lg active:scale-95"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                          Creating account...
                        </span>
                      ) : (
                        "Sign Up"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} TodoApp. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="transition-all duration-200 hover:text-primary">
              Privacy Policy
            </Button>
            <Button variant="ghost" size="sm" className="transition-all duration-200 hover:text-primary">
              Terms of Service
            </Button>
            <Button variant="ghost" size="sm" className="transition-all duration-200 hover:text-primary">
              Contact
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
