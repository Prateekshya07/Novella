import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Home, Users, Bell, Search, User, LogOut, Settings, ChevronDown, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const demoBooks = [
    {
      id: 1,
      title: 'The Seven Husbands of Evelyn Hugo',
      author: 'Taylor Jenkins Reid',
      cover: 'https://images-na.ssl-images-amazon.com/images/I/71FTb9X6wsL.jpg',
      rating: 4.5,
      year: 2017
    },
    {
      id: 2,
      title: 'Klara and the Sun',
      author: 'Kazuo Ishiguro',
      cover: 'https://images-na.ssl-images-amazon.com/images/I/71cN0qJMbXL.jpg',
      rating: 4.2,
      year: 2021
    },
    {
      id: 3,
      title: 'Project Hail Mary',
      author: 'Andy Weir',
      cover: 'https://images-na.ssl-images-amazon.com/images/I/91vS0F7DXFL.jpg',
      rating: 4.8,
      year: 2021
    },
    {
      id: 4,
      title: 'The Midnight Library',
      author: 'Matt Haig',
      cover: 'https://images-na.ssl-images-amazon.com/images/I/71BYWWjVFmL.jpg',
      rating: 4.3,
      year: 2020
    },
    {
      id: 5,
      title: 'Circe',
      author: 'Madeline Miller',
      cover: 'https://images-na.ssl-images-amazon.com/images/I/81NJbF4Tm9L.jpg',
      rating: 4.4,
      year: 2018
    },
    {
      id: 6,
      title: 'The Song of Achilles',
      author: 'Madeline Miller',
      cover: 'https://images-na.ssl-images-amazon.com/images/I/91K0cXJg-tL.jpg',
      rating: 4.6,
      year: 2011
    },
    {
      id: 7,
      title: 'Where the Crawdads Sing',
      author: 'Delia Owens',
      cover: 'https://images-na.ssl-images-amazon.com/images/I/81O0mWcksrL.jpg',
      rating: 4.2,
      year: 2018
    },
    {
      id: 8,
      title: 'The Silent Patient',
      author: 'Alex Michaelides',
      cover: 'https://images-na.ssl-images-amazon.com/images/I/81A0cCp4dWL.jpg',
      rating: 4.1,
      year: 2019
    }
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsDropdownOpen(false)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim().length > 0) {
      const filtered = demoBooks.filter(book => 
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
      setSearchResults(filtered)
      setIsSearchOpen(true)
    } else {
      setSearchResults([])
      setIsSearchOpen(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setIsSearchOpen(false)
  }

  const handleBookSelect = (bookId: number) => {
    navigate(`/books/${bookId}`)
    clearSearch()
  }

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
              <div className="flex-1 max-w-md mx-8" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search books, authors, or users..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                  {/* Search Results Dropdown */}
                  {isSearchOpen && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
                      <div className="py-2">
                        {searchResults.map((book) => (
                          <button
                            key={book.id}
                            onClick={() => handleBookSelect(book.id)}
                            className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 text-left transition-colors duration-200"
                          >
                            <img
                              src={book.cover}
                              alt={book.title}
                              className="w-10 h-14 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                {book.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                by {book.author}
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="flex items-center">
                                  <div className="flex text-yellow-400">
                                    {'★'.repeat(Math.floor(book.rating))}
                                  </div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                    {book.rating}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {book.year}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      {searchQuery && searchResults.length === 0 && (
                        <div className="px-4 py-6 text-center">
                          <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <div className="text-sm text-gray-500">
                            No books found for "{searchQuery}"
                          </div>
                        </div>
                      )}
                      
                      <div className="border-t border-gray-100 px-4 py-2">
                        <div className="text-xs text-gray-500 text-center">
                          Press Enter to search all books
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
                  {/* Notification badge */}
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
                      <div className="text-sm font-medium text-gray-700">
                        {user?.fullName || user?.username}
                      </div>
                      <div className="text-xs text-gray-500">
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