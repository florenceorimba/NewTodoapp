"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "../components/auth-provider"
import { useTodoContext } from "../components/todo-provider"
import { useTheme } from "next-themes"
import { AlertTriangle, Download, LogOut, Moon, Sun, Upload } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

// Error logging utility
const logError = (context: string, error: unknown, additionalInfo?: Record<string, unknown>) => {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  // Create structured error object
  const logData = {
    timestamp: new Date().toISOString(),
    context,
    message: errorMessage,
    stack: errorStack,
    ...additionalInfo,
  }

  // Log to console in development
  console.error("Error in TodoApp:", logData)

  // In a real app, you might send this to a logging service
  // Example: sendToErrorTrackingService(logData)

  return errorMessage
}

export function SettingsManager() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const { logout, isLoading } = useAuth()
  const { exportTasks, importTasks } = useTodoContext()
  const router = useRouter()

  const [exportData, setExportData] = useState("")
  const [importData, setImportData] = useState("")
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [showErrorDetails, setShowErrorDetails] = useState(false)

  const handleExport = () => {
    try {
      const data = exportTasks()
      setExportData(data)

      toast({
        title: "Data exported",
        description: "Your data has been exported. Copy it to save it.",
        variant: "success",
      })
    } catch (error) {
      // Log the error but don't capture the return value since we're not using it
      logError("Data Export", error, { action: "exportTasks" })

      toast({
        title: "Export failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleImport = () => {
    setImportError(null)
    setImportSuccess(false)
    setErrorDetails(null)
    setShowErrorDetails(false)

    try {
      if (!importData.trim()) {
        setImportError("Please enter data to import")
        return
      }

      // Validate JSON format before importing
      try {
        JSON.parse(importData)
      } catch (parseError) {
        const errorMessage = logError("Data Import - JSON Parse", parseError, {
          dataLength: importData.length,
          dataSample: importData.substring(0, 100), // Log just a sample for privacy
        })

        setImportError("Invalid JSON format. Please check your import data.")
        setErrorDetails(`Error parsing JSON: ${errorMessage}`)
        return
      }

      // Attempt to import the data
      try {
        importTasks(importData)
        setImportData("")
        setImportSuccess(true)

        toast({
          title: "Import successful",
          description: "Your data has been imported successfully.",
          variant: "success",
        })

        // Clear success message after 3 seconds
        setTimeout(() => {
          setImportSuccess(false)
        }, 3000)
      } catch (importError) {
        const errorMessage = logError("Data Import - Processing", importError, {
          action: "importTasks",
        })

        setImportError("Failed to process the import data. The format may be incorrect.")
        setErrorDetails(`Error processing import: ${errorMessage}`)

        toast({
          title: "Import failed",
          description: "There was an error importing your data. Please check the format.",
          variant: "destructive",
        })
      }
    } catch (error) {
      // Catch any other unexpected errors
      const errorMessage = logError("Data Import - Unexpected", error)

      setImportError("An unexpected error occurred during import.")
      setErrorDetails(`Unexpected error: ${errorMessage}`)

      toast({
        title: "Import failed",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()

      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
        variant: "success",
      })

      // Navigate to home page after successful logout
      router.push("/")
    } catch (error) {
      // Log the error without assigning to an unused variable
      logError("Logout", error, {
        isLoggingOut,
        isLoading,
      })

      toast({
        title: "Logout failed",
        description: "There was an issue logging out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how TodoApp looks on your device</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
              <Moon className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export or import your tasks and categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Export Data</Label>
            <div className="flex items-center gap-2">
              <Button onClick={handleExport} variant="outline" className="transition-all duration-200">
                <Download className="mr-2 h-4 w-4" />
                Generate Export Data
              </Button>
            </div>
            {exportData && (
              <div className="animate-in fade-in-50 duration-300">
                <Textarea
                  value={exportData}
                  readOnly
                  className="h-32 font-mono text-xs"
                  onClick={(e) => {
                    const textarea = e.target as HTMLTextAreaElement
                    textarea.select()
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">Click in the box to select all text for copying</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Import Data</Label>
            <Textarea
              placeholder="Paste your exported data here"
              className={cn(
                "h-32 font-mono text-xs transition-all duration-200",
                importError && "border-destructive focus-visible:ring-destructive",
              )}
              value={importData}
              onChange={(e) => {
                setImportData(e.target.value)
                if (importError) setImportError(null)
                if (errorDetails) setErrorDetails(null)
              }}
            />

            {importError && (
              <Alert variant="destructive" className="animate-in fade-in-50 duration-300 mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Import Error</AlertTitle>
                <AlertDescription className="flex flex-col gap-2">
                  <p>{importError}</p>
                  {errorDetails && (
                    <div className="text-xs">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowErrorDetails(!showErrorDetails)}
                        className="text-xs h-6 px-2 py-0 mt-1"
                      >
                        {showErrorDetails ? "Hide Details" : "Show Details"}
                      </Button>

                      {showErrorDetails && (
                        <pre className="mt-2 p-2 bg-destructive/10 rounded overflow-x-auto">{errorDetails}</pre>
                      )}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {importSuccess && (
              <div className="bg-green-50 text-green-800 border border-green-200 rounded-md p-3 animate-in fade-in-50 duration-300 mt-2 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800">
                <p className="text-sm">Data imported successfully!</p>
              </div>
            )}

            <Button onClick={handleImport} disabled={!importData.trim()} className="transition-all duration-200">
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="transition-all duration-200">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will be logged out of your account and redirected to the login page.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  disabled={isLoggingOut || isLoading}
                  className="transition-all duration-200"
                >
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
