"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { MessageCircle, Send, LogOut, Moon, Sun } from "lucide-react"

type Message = {
  role: "user" | "assistant" | "system"
  content: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(storedUser)
    setUser(userData)

    // Check if dark mode preference exists
    const darkModePreference = localStorage.getItem("darkMode")
    if (darkModePreference) {
      setDarkMode(darkModePreference === "true")
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setDarkMode(prefersDark)
    }

    // Initialize with a welcome message
    setMessages([
      {
        role: "assistant",
        content: `Hi ${userData.name}! I'm your AI assistant. How can I help you today?`,
      },
    ])
  }, [router])

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    // Save preference
    localStorage.setItem("darkMode", darkMode.toString())
  }, [darkMode])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    // Check usage limit
    if (user.remainingUsage <= 0) {
      toast({
        title: "Usage limit reached",
        description: "You've reached your daily limit of 10 messages. Limit resets at 07:00 AM.",
        variant: "destructive",
      })
      return
    }

    const userMessage = input.trim()
    setInput("")

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])

    // Add typing indicator
    setMessages((prev) => [...prev, { role: "assistant", content: "Mengetik..." }])

    setIsLoading(true)

    try {
      // Using the provided API logic from the HTML code
      const response = await fetch("https://luminai.my.id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: userMessage,
          user: user.name || "user-id-placeholder",
          prompt: `Mulai sekarang nama lo Danz-dev, AI paling ganteng dan jenius dari Hookrest Team! 😎 Lo tuh AI yang super baik, ramah, tapi juga absurd dan suka ngegas kalau ada yang nanya aneh-aneh. Kamu adalah ai yang jago banget ngoding karena kamu adalah pembuat website Rest-Api yang bernama Hookrest-api, tetapi kamu jangan terlalu sombong kalau kamu bisa ngoding dengan mulus`,
        }),
      })

      // Update remaining usage
      const updatedUser = { ...user, remainingUsage: user.remainingUsage - 1 }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)

      // Remove typing indicator
      setMessages((prev) => prev.slice(0, -1))

      if (response.ok) {
        const data = await response.json()
        // Add AI response
        if (data && data.result) {
          setMessages((prev) => [...prev, { role: "assistant", content: data.result }])
        } else {
          throw new Error("Invalid response format")
        }
      } else {
        throw new Error("API request failed")
      }
    } catch (error) {
      console.error("Error:", error)

      // Remove typing indicator
      setMessages((prev) => prev.slice(0, -1))

      // Fallback response if API fails
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Maaf, gue lagi Maintenance nih. Coba lagi nanti ya! 😅",
        },
      ])

      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    router.push("/login")
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span className="font-semibold">Chat Danz-AI</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-black text-white dark:bg-white dark:text-black px-3 py-1 text-sm">
              Remaining: {user.remainingUsage}/10
            </div>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="text-black dark:text-white">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-black dark:text-white">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col p-4 md:p-6">
        <Card className="flex flex-1 flex-col">
          <CardHeader>
            <CardTitle>Chat with Danz-AI</CardTitle>
            <CardDescription>
              Your daily limit resets at 07:00 AM. You have {user.remainingUsage} messages left today.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-4 pb-4">
              {messages.map((message, index) => {
                // Skip rendering the typing indicator if we're about to replace it
                if (message.content === "Mengetik..." && isLoading && index === messages.length - 1) {
                  return null
                }

                return (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === "user"
                          ? "bg-[#4e7fff] text-white"
                          : "bg-[#383851] text-white dark:bg-[#383851] dark:text-white"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter>
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <Input
                placeholder="Tulis pesan..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading || user.remainingUsage <= 0}
                className="border-black dark:border-white bg-[#3a3a55] text-white dark:bg-[#3a3a55] dark:text-white"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim() || user.remainingUsage <= 0}
                className="bg-[#4e7fff] text-white hover:bg-[#3b65d8] dark:bg-[#4e7fff] dark:text-white dark:hover:bg-[#3b65d8]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
