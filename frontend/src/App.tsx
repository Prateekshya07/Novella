import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import BookPage from './pages/BookPage'
import ReviewPage from './pages/ReviewPage'
import FeedPage from './pages/FeedPage'

function App() {
  const { isAuthenticated, user, hydrated, setHydrated } = useAuthStore()
  const { setHydrated: setThemeHydrated } = useThemeStore()
  
  useEffect(() => {
    console.log('🌊 App mounted, hydrating auth state...')
    setHydrated()
    setThemeHydrated()
  }, [setHydrated, setThemeHydrated])
  
  console.log('🔄 App render - isAuthenticated:', isAuthenticated, 'user:', user?.username, 'hydrated:', hydrated)
  
  // Don't render routes until we've hydrated the auth state
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/feed" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/feed" />} />
      
      {/* Protected routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={isAuthenticated ? <Navigate to="/feed" /> : <HomePage />} />
        <Route path="/feed" element={isAuthenticated ? <FeedPage /> : <Navigate to="/" />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/books/:id" element={<BookPage />} />
        <Route path="/reviews/:id" element={<ReviewPage />} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/feed" : "/"} />} />
      </Route>
    </Routes>
  )
}

export default App