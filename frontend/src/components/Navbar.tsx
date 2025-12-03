import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Home,
  Users,
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  ChevronDown,
  X,
  MessageCircle
} from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import ThemeToggle from './ThemeToggle'

/**
 * Fully dynamic Navbar
 * - NO demo/sample data
 * - real-time (debounced + cancellable) server search
 * - uses auth token when present
 * - emits `nav:search` events for other parts of the app
 * - accessible and keyboard friendly
 */

type BookResult = {
  id: number | string
  title: string
  author?: string
  cover?: string
  rating?: number
  year?: number
}

type UserResult = {
  id: string
  name: string
  username: string
  avatar?: string | null
  isFollowing?: boolean
}

export default function Navbar() {
  const { user, isAuthenticated, logout, token } = useAuthStore()
  const navigate = useNavigate()

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchBooks, setSearchBooks] = useState<BookResult[]>([])
  const [searchUsers, setSearchUsers] = useState<UserResult[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Build headers including auth when available
  const buildHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
  }, [token])

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsDropdownOpen(false)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchBooks([])
    setSearchUsers([])
    setIsSearchOpen(false)
    setSearchError(null)
    // dispatch empty query so other components can react
    window.dispatchEvent(new CustomEvent('nav:search', { detail: '' }))
  }

  // Debounced + cancellable server search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setSearchBooks([])
      setSearchUsers([])
      setIsSearchOpen(false)
      setSearchLoading(false)
      setSearchError(null)
      return
    }

    const controller = new AbortController()
    const signal = controller.signal
    let isCancelled = false
    setSearchLoading(true)
    setSearchError(null)

    const id = setTimeout(async () => {
      try {
        const q = encodeURIComponent(searchQuery.trim())
        const res = await fetch(`/api/search?q=${q}`, {
          method: 'GET',
          headers: buildHeaders(),
          signal
        })

        if (!res.ok) {
          // server returned error — show no results but keep UX consistent
          setSearchBooks([])
          setSearchUsers([])
          setIsSearchOpen(true)
          setSearchError(`Server returned ${res.status}`)
          return
        }

        const payload = await res.json()
        if (isCancelled) return

        // Expect server shape: { books: BookResult[], users: UserResult[] }
        const books: BookResult[] = (payload.books ?? []).slice(0, 8)
        const users: UserResult[] = (payload.users ?? []).slice(0, 8).map((u: any) => ({
          id: String(u.id),
          name: u.name,
          username: u.username,
          avatar: u.avatar ?? null,
          isFollowing: Boolean(u.isFollowing)
        }))

        setSearchBooks(books)
        setSearchUsers(users)
        setIsSearchOpen(true)

        // Broadcast the query to other components (FeedPage listens for this)
        window.dispatchEvent(new CustomEvent('nav:search', { detail: searchQuery.trim() }))
      } catch (err: any) {
        if (err.name === 'AbortError') return
        console.error('Navbar search failed', err)
        setSearchBooks([])
        setSearchUsers([])
        setIsSearchOpen(true)
        setSearchError('Failed to contact server')
      } finally {
        if (!isCancelled) setSearchLoading(false)
      }
    }, 300)

    return () => {
      isCancelled = true
      controller.abort()
      clearTimeout(id)
    }
  }, [searchQuery, buildHeaders])

  // Follow a user from the search dropdown (optimistic)
  const handleFollowUser = async (userId: string) => {
    setSearchUsers(prev => prev.map(u => u.id === userId ? { ...u, isFollowing: true } : u))
    try {
      const res = await fetch(`/api/users/${userId}/follow`, { method: 'POST', headers: buildHeaders() })
      if (!res.ok) {
        setSearchUsers(prev => prev.map(u => u.id === userId ? { ...u, isFollowing: false } : u))
        console.error('Follow call failed', res.status)
      }
    } catch (err) {
      setSearchUsers(prev => prev.map(u => u.id === userId ? { ...u, isFollowing: false } : u))
      console.error('Failed to follow user', err)
    }
  }

  // Message user: navigate to message composer
  const handleMessageUser = (userId: string, username?: string) => {
    navigate(`/messages/compose?to=${encodeURIComponent(userId)}&username=${encodeURIComponent(username ?? '')}`)
    setIsSearchOpen(false)
    setSearchQuery('')
    setSearchBooks([])
    setSearchUsers([])
  }

  // Selecting a book row -> navigate to book page
  const handleBookSelect = (bookId: number | string) => {
    navigate(`/books/${bookId}`)
    clearSearch()
  }

  // Selecting a user row -> navigate to profile
  const handleUserSelect = (username: string) => {
    navigate(`/users/${encodeURIComponent(username)}`)
    clearSearch()
  }

  // click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // keyboard: Enter on search -> navigate to /search?q=...
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim().length > 0) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      window.dispatchEvent(new CustomEvent('nav:search', { detail: searchQuery.trim() }))
      setIsSearchOpen(false)
    } else if (e.key === 'Escape') {
      clearSearch()
      inputRef.current?.blur()
    }
  }

  return (
    <nav className="fixed top-0 w-full bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gradient">Novella</span>
          </Link>

          {isAuthenticated ? (
            <>
              {/* Search */}
              <div className="flex-1 max-w-lg mx-8" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search books, authors, or users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    aria-label="Search books, authors, and users"
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      aria-label="Clear search"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                  {/* Search Results Dropdown */}
                  {isSearchOpen && (searchLoading || searchBooks.length > 0 || searchUsers.length > 0 || searchError) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
                      <div className="py-2">
                        {/* Users Section */}
                        {searchUsers.length > 0 && (
                          <div className="px-2 pb-2">
                            <div className="text-xs text-gray-500 px-3 pb-2">People</div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                              {searchUsers.map((u) => (
                                <div key={u.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors duration-150">
                                  <button
                                    onClick={() => handleUserSelect(u.username)}
                                    className="flex items-center gap-3 min-w-0 text-left flex-1"
                                  >
                                    <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                                      {u.avatar ? (
                                        <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="text-sm text-white">{u.name?.charAt(0)}</span>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{u.name}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">@{u.username}</div>
                                    </div>
                                  </button>

                                  <div className="flex items-center gap-2 ml-4">
                                    <button
                                      onClick={() => handleFollowUser(u.id)}
                                      disabled={u.isFollowing}
                                      className={`px-3 py-1 rounded text-sm ${u.isFollowing ? 'bg-gray-100 dark:bg-gray-700 text-gray-500' : 'bg-blue-600 text-white'}`}
                                      aria-pressed={Boolean(u.isFollowing)}
                                    >
                                      {u.isFollowing ? 'Following' : 'Follow'}
                                    </button>

                                    <button
                                      onClick={() => handleMessageUser(u.id, u.username)}
                                      className="px-3 py-1 rounded text-sm border border-gray-200 dark:border-gray-700 flex items-center gap-2"
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                      <span>Message</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Books Section */}
                        {searchBooks.length > 0 && (
                          <div className="px-2 pt-2">
                            <div className="text-xs text-gray-500 px-3 pb-2">Books</div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                              {searchBooks.map((book) => (
                                <button
                                  key={book.id}
                                  onClick={() => handleBookSelect(book.id)}
                                  className="w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 text-left transition-colors duration-150"
                                >
                                  <div className="w-10 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                    {book.cover ? <img src={book.cover} alt={book.title} className="w-full h-full object-cover" /> : null}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{book.title}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">by {book.author ?? 'Unknown'}</div>
                                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-400">
                                      <div>{book.rating ?? '—'}</div>
                                      <div>•</div>
                                      <div>{book.year ?? '—'}</div>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {searchLoading && (
                          <div className="px-4 py-4 text-sm text-gray-500">Searching…</div>
                        )}

                        {/* Error or No results */}
                        {!searchLoading && searchBooks.length === 0 && searchUsers.length === 0 && (
                          <div className="px-4 py-6 text-center">
                            <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <div className="text-sm text-gray-500">{searchError ? searchError : `No results for “${searchQuery}”`}</div>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2">
                        <div className="text-xs text-gray-500 text-center">
                          Press Enter to see all search results
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex items-center space-x-1">
                <Link to="/feed" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
                  <Home className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </Link>
                <Link to="/discover" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
                  <Users className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </Link>
                <Link to="/notifications" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative transition-colors duration-200">
                  <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  {/* Notification badge - replace with dynamic value */}
                  <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                </Link>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* User Menu */}
                <div className="ml-4 relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                  >
                    {user?.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={user.username}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user?.fullName?.charAt(0) || user?.username?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-100">
                        {user?.fullName || user?.username}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        @{user?.username}
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {user?.fullName || user?.username}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </div>
                      </div>

                      <Link
                        to={`/profile/${user?.username}`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        Your Profile
                      </Link>

                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Link>

                      <hr className="my-1" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Public navigation */
            <div className="flex items-center space-x-4">
              <Link to="/login" className="btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
