import { create } from 'zustand'
import { User } from '../types/auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  hydrated: boolean
  setHydrated: () => void
}

const STORAGE_KEY = 'novella-auth'

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hydrated: false,
  
  setHydrated: () => {
    // Load from localStorage when hydrating
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          console.log('💧 Hydrating auth state from localStorage:', parsed.user?.username)
          set({
            user: parsed.user,
            token: parsed.token,
            isAuthenticated: !!parsed.token,
            hydrated: true
          })
          return
        }
      } catch (error) {
        console.error('Error loading auth from localStorage:', error)
      }
    }
    set({ hydrated: true })
  },
  
  login: (user: User, token: string) => {
    console.log('🔐 Auth store login called for:', user.username)
    const newState = { user, token, isAuthenticated: true }
    set(newState)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }))
        console.log('💾 Auth state saved to localStorage')
      } catch (error) {
        console.error('Error saving auth to localStorage:', error)
      }
    }
    console.log('✅ Auth store updated - isAuthenticated:', true)
  },
  
  logout: () => {
    console.log('🚪 Logging out')
    set({ user: null, token: null, isAuthenticated: false })
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY)
        console.log('🗑️ Auth state cleared from localStorage')
      } catch (error) {
        console.error('Error clearing auth from localStorage:', error)
      }
    }
  },
  
  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user
    const currentToken = get().token
    
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData }
      set({ user: updatedUser })
      
      // Update localStorage
      if (typeof window !== 'undefined' && currentToken) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: updatedUser, token: currentToken }))
        } catch (error) {
          console.error('Error updating auth in localStorage:', error)
        }
      }
    }
  },
}))