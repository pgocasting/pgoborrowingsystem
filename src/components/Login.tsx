import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { signInUser, getUserByUsername, type UserProfile } from '@/services/authService'

interface LoginProps {
  onLoginSuccess: (profile: UserProfile) => void
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!username || !password) {
        setError('Please enter both username and password')
        setIsLoading(false)
        return
      }

      // Get user by username to find their email
      const user = await getUserByUsername(username)
      if (!user) {
        setError('Invalid username or password')
        setIsLoading(false)
        return
      }

      // Sign in with email and password
      const profile = await signInUser(user.email, password)
      onLoginSuccess(profile)
      setUsername('')
      setPassword('')
    } catch (err) {
      console.error('Login error:', err)
      setError('Invalid username or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen loading-rgb-bg flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="flex justify-center mb-8">
          <img
            src="/images/bataan-logo.png"
            alt="Bataan Logo"
            className="h-14 w-14 object-contain"
          />
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Sign in to your account
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
            <input type="checkbox" className="rounded" />
            Remember me
          </label>
          <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">
            Forgot password?
          </a>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-gray-600 mt-6 text-sm">
          Don't have an account?{' '}
          <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
