import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  hydrated: boolean
  setHydrated: () => void
}

const STORAGE_KEY = 'novella-theme'

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  hydrated: false,
  
  setHydrated: () => {
    // Load from localStorage when hydrating
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        const theme = (stored as Theme) || 'light'
        
        // Apply theme to document
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
        
        console.log('🌓 Hydrating theme state:', theme)
        set({
          theme,
          hydrated: true
        })
        return
      } catch (error) {
        console.error('Error loading theme from localStorage:', error)
      }
    }
    set({ hydrated: true })
  },
  
  setTheme: (theme: Theme) => {
    console.log('🌓 Theme store setTheme called:', theme)
    set({ theme })
    
    // Apply theme to document
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(theme)
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, theme)
        console.log('💾 Theme saved to localStorage:', theme)
      } catch (error) {
        console.error('Error saving theme to localStorage:', error)
      }
    }
  },
  
  toggleTheme: () => {
    const currentTheme = get().theme
    const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light'
    get().setTheme(newTheme)
  },
}))