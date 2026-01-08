import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import Login from './components/Login'
import MainPage from './components/MainPage'
import { setupInitialData } from './utils/initializeAdmin'
import { auth } from '@/config/firebase'
import { getCurrentUserProfile, signOutUser, type UserProfile } from '@/services/authService'

import './galaxy.css'

function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [canRenderApp, setCanRenderApp] = useState(false)

  // Initialize admin account on app load
  useEffect(() => {
    const initialize = async () => {
      try {
        await setupInitialData()
      } catch (error) {
        console.error('Error during initialization:', error)
      } finally {
        setIsInitializing(false)
      }
    }

    initialize()
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setProfile(null)
          return
        }

        const nextProfile = await getCurrentUserProfile(user.uid)
        setProfile(nextProfile)
      } catch (error) {
        console.error('Error loading user profile:', error)
        setProfile(null)
      } finally {
        setIsAuthReady(true)
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const isLoading = isInitializing || !isAuthReady

    // Start loading from 0% every time we enter the loading state
    if (isLoading) {
      setCanRenderApp(false)
      setLoadingProgress(0)
    }
  }, [isInitializing, isAuthReady])

  useEffect(() => {
    const isLoading = isInitializing || !isAuthReady

    let target = 95
    if (!isLoading) target = 100

    const interval = setInterval(() => {
      setLoadingProgress((p) => {
        if (p >= target) return p
        const step = target === 100 ? 8 : 4
        return Math.min(target, p + step)
      })
    }, 120)

    return () => clearInterval(interval)
  }, [isInitializing, isAuthReady])

  useEffect(() => {
    const isLoading = isInitializing || !isAuthReady
    if (!isLoading && loadingProgress >= 100) {
      setCanRenderApp(true)
    }
  }, [isInitializing, isAuthReady, loadingProgress])

  const handleLogin = (nextProfile: UserProfile) => {
    setProfile(nextProfile)
  }

  const handleLogout = async () => {
    await signOutUser()
    setProfile(null)
  }

  if (!canRenderApp) {
    return (
      <div className="min-h-screen loading-rgb-bg flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 h-28 w-28">
            <svg
              viewBox="0 0 841.9 595.3"
              className="h-28 w-28 animate-spin"
              aria-label="Loading"
            >
              <g fill="none" stroke="white" strokeWidth="28">
                <ellipse cx="420.9" cy="296.5" rx="165" ry="64" />
                <ellipse cx="420.9" cy="296.5" rx="165" ry="64" transform="rotate(60 420.9 296.5)" />
                <ellipse cx="420.9" cy="296.5" rx="165" ry="64" transform="rotate(120 420.9 296.5)" />
              </g>
              <circle cx="420.9" cy="296.5" r="44" fill="white" />
            </svg>
          </div>
          <div className="mx-auto w-56 max-w-[70vw]">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-200 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return profile ? (
    <MainPage username={profile.username} onLogout={handleLogout} />
  ) : (
    <Login onLoginSuccess={handleLogin} />
  )
}

export default App
