import { Loader2 } from "lucide-react"

export default function LoginLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-gray-600">Loading...</p>
      </div>
    </div>
  )
} 