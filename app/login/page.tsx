"use client"

import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FcGoogle } from "react-icons/fc"
import { toast } from "react-hot-toast"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { data: session, status } = useSession()
  
  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      console.log("User is authenticated, redirecting to dashboard...")
      toast.success("Welcome back! Redirecting to your dashboard...")
      // Use replace instead of push to prevent back button issues
      router.replace("/dashboard")
    }
  }, [session, status, router])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Sign in failed. Please try again.")
    }
    setIsLoading(false)
  }

  // Check URL params for errors
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const error = searchParams.get('error')
    
    if (error === 'OAuthAccountNotLinked') {
      toast.error("This email is already registered with a different sign-in method. Please use your original sign-in method.")
    } else if (error === 'OAuthCreateAccount') {
      toast.error("There was a problem creating your account. Please try again.")
    } else if (error) {
      toast.error(`Authentication error: ${error}`)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-blue-50 p-4 font-inter">
      <div className="w-full max-w-md space-y-8 rounded-none border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="text-center">
          <h1 className="font-satoshi text-4xl font-bold tracking-tighter text-black">Welcome back</h1>
          <p className="mt-2 text-gray-600">
            {status === 'loading' ? 'Checking login status...' : 'Sign in to your account to continue'}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading || status === 'loading'}
            className="flex w-full items-center justify-center gap-3 rounded-none border-2 border-black bg-white px-4 py-3 text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
          >
            <FcGoogle className="h-5 w-5" />
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href="/"
              className="font-semibold text-blue-600 underline hover:text-blue-800"
            >
              Back to homepage
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 