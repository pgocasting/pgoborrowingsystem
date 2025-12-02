import { useState, useEffect } from 'react'
import Login from './components/Login'
import MainPage from './components/MainPage'
import { setupInitialData } from './utils/initializeAdmin'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = sessionStorage.getItem('isLoggedIn')
    return saved === 'true'
  })
  const [username, setUsername] = useState(() => {
    return sessionStorage.getItem('username') || ''
  })
  const [isInitializing, setIsInitializing] = useState(true)

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

  const handleLogin = (user: string) => {
    setUsername(user)
    setIsLoggedIn(true)
    // Persist login state
    sessionStorage.setItem('username', user)
    sessionStorage.setItem('isLoggedIn', 'true')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername('')
    // Clear login state
    sessionStorage.removeItem('username')
    sessionStorage.removeItem('isLoggedIn')
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold">Initializing...</p>
        </div>
      </div>
    )
  }

  return isLoggedIn ? (
    <MainPage username={username} onLogout={handleLogout} />
  ) : (
    <Login onLoginSuccess={handleLogin} />
  )
}

export default App
