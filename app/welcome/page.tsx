"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function WelcomePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    setUser(JSON.parse(storedUser))
  }, [router])

  const handleContinue = () => {
    router.push("/dashboard")
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black/10 dark:bg-white/10">
            <CheckCircle className="h-10 w-10 text-black dark:text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome, {user.name}!</CardTitle>
          <CardDescription>Your account has been successfully created</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Thank you for registering with our AI Chat Assistant by Danz-dev. You now have access to our powerful AI
            chat features.
          </p>
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4 text-left">
            <p className="font-medium">Your account details:</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Daily limit: 10 AI interactions</li>
              <li>• Limit resets at: 07:00 AM daily</li>
              <li>• Registration date: {new Date(user.registeredAt).toLocaleDateString()}</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleContinue}
            className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Continue to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
