// App.tsx
import { Routes, Route, Navigate } from "react-router-dom"
import { useEffect } from "react"
import { useAuthStore } from "./store/authStore"
import { useThemeStore } from "./store/themeStore"

import Layout from "./components/Layout"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ProfilePage from "./pages/ProfilePage"
import BookPage from "./pages/BookPage"
import ReviewPage from "./pages/ReviewPage"
import FeedPage from "./pages/FeedPage"
import LandingPage from "./pages/LandingPage"

function App() {
  const { isAuthenticated, user, hydrated, setHydrated } = useAuthStore()
  const { setHydrated: setThemeHydrated } = useThemeStore()

  useEffect(() => {
    console.log("🌊 App mounted, hydrating auth state...")
    setHydrated()
    setThemeHydrated()
  }, [setHydrated, setThemeHydrated])

  console.log(
    "🔄 App render - isAuthenticated:",
    isAuthenticated,
    "user:",
    user?.username,
    "hydrated:",
    hydrated
  )

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
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<HomePage />} />

      {/* Login & Register SHOULD ALWAYS be accessible */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* PROTECTED ROUTES (wrapped in Layout) */}
      <Route element={<Layout />}>
        <Route
          path="/feed"
          element={isAuthenticated ? <FeedPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/profile/:username"
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
        />

        <Route
          path="/books/:id"
          element={isAuthenticated ? <BookPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/reviews/:id"
          element={isAuthenticated ? <ReviewPage /> : <Navigate to="/login" />}
        />
      </Route>

      {/* CATCH ALL ROUTE */}
      <Route
        path="*"
        element={
          isAuthenticated ? <Navigate to="/feed" /> : <Navigate to="/home" />
        }
      />
    </Routes>
  )
}

export default App
