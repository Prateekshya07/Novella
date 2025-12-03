import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useAuthStore } from '../store/authStore'
import { BookOpen, Users, Star, Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react'

// FeedPage (search handled by Navbar)
// - Search results now show People with Follow + Message actions

interface User {
  name: string
  username: string
  avatar: string
}

interface Book {
  id?: string | number
  title: string
  author: string
  cover?: string
}

type PostType = 'review' | 'reading'

interface Post {
  id: number
  user: User
  type: PostType
  book?: Book
  rating?: number
  content: string
  timestamp: string
  likes: number
  comments: number
  isLiked?: boolean
}

interface Suggestion {
  id: string
  name: string
  username: string
  avatar: string
}

interface SearchResultBook {
  id: string | number
  title: string
  author: string
  cover?: string
}

interface SearchResultUser {
  id: string
  name: string
  username: string
  avatar?: string
  // Added client-side helper to track follow state in results
  isFollowing?: boolean
}

// Props: navQuery is optional. If not passed, FeedPage will also listen for a global event.
export default function FeedPage({ navQuery }: { navQuery?: string }): JSX.Element {
  const auth = useAuthStore?.()
  const user = auth?.user
  const token = (auth as any)?.token

  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  // Search state (controlled by navbar via prop or event)
  const [query, setQuery] = useState<string>(navQuery ?? '')
  const [searchLoading, setSearchLoading] = useState<boolean>(false)
  const [searchBooks, setSearchBooks] = useState<SearchResultBook[]>([])
  const [searchUsers, setSearchUsers] = useState<SearchResultUser[]>([])

  useEffect(() => {
    if (typeof navQuery === 'string') setQuery(navQuery)
  }, [navQuery])

  // listen to a global CustomEvent 'nav:search' so Navbar can dispatch
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        // event detail should be the query string
        const q = (e as CustomEvent).detail as string
        setQuery(q ?? '')
      } catch (err) {
        // ignore
      }
    }
    window.addEventListener('nav:search', handler as EventListener)
    return () => window.removeEventListener('nav:search', handler as EventListener)
  }, [])

  // Helper to build headers (attach auth token if available)
  const buildHeaders = useCallback(() => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
  }, [token])

  // --- Feed fetching ---
  const fetchFeed = useCallback(async (pageToLoad = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/feed?page=${pageToLoad}`, {
        method: 'GET',
        headers: buildHeaders()
      })
      if (!res.ok) {
        console.warn('Feed fetch returned', res.status)
        setLoading(false)
        return
      }
      const payload = await res.json()
      const newPosts: Post[] = payload.posts ?? []
      if (pageToLoad === 1) setPosts(newPosts)
      else setPosts((p) => [...p, ...newPosts])
      setHasMore(Boolean(payload.nextPageExists))
    } catch (err) {
      console.error('Failed to fetch feed', err)
    } finally {
      setLoading(false)
    }
  }, [buildHeaders])

  const fetchSuggestions = useCallback(async () => {
    try {
      const res = await fetch(`/api/suggestions`, { headers: buildHeaders() })
      if (!res.ok) return
      const payload = await res.json()
      setSuggestions(payload.suggestions ?? [])
    } catch (err) {
      console.error('Failed to fetch suggestions', err)
    }
  }, [buildHeaders])

  // --- Search effect (debounced) ---
  useEffect(() => {
    if (!query || query.trim().length < 1) {
      setSearchBooks([])
      setSearchUsers([])
      setSearchLoading(false)
      return
    }

    let cancelled = false
    setSearchLoading(true)
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { headers: buildHeaders() })
        if (!res.ok) {
          setSearchBooks([])
          setSearchUsers([])
          setSearchLoading(false)
          return
        }
        const payload = await res.json()
        if (cancelled) return
        // Ensure user results have isFollowing flag (server may provide it)
        const users: SearchResultUser[] = (payload.users ?? []).map((u: any) => ({ ...u, isFollowing: Boolean(u.isFollowing) }))
        setSearchBooks(payload.books ?? [])
        setSearchUsers(users)
      } catch (err) {
        if (!cancelled) console.error('Search failed', err)
      } finally {
        if (!cancelled) setSearchLoading(false)
      }
    }, 350)

    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [query, buildHeaders])

  useEffect(() => {
    fetchFeed(1)
    fetchSuggestions()
  }, [fetchFeed, fetchSuggestions])

  // Actions
  const handleLike = async (postId: number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p
        const isLiked = !p.isLiked
        return { ...p, isLiked, likes: isLiked ? p.likes + 1 : Math.max(0, p.likes - 1) }
      })
    )

    try {
      await fetch(`/api/posts/${postId}/like`, { method: 'POST', headers: buildHeaders() })
    } catch (err) {
      console.error('Failed to like post', err)
      fetchFeed(1)
    }
  }

  const handleLoadMore = async () => {
    if (loading || !hasMore) return
    const next = page + 1
    await fetchFeed(next)
    setPage(next)
  }

  const handleFollow = async (suggestionId: string) => {
    setSuggestions((s) => s.filter((x) => x.id !== suggestionId))
    try {
      await fetch(`/api/users/${suggestionId}/follow`, { method: 'POST', headers: buildHeaders() })
      fetchFeed(1)
    } catch (err) {
      console.error('Failed to follow', err)
    }
  }

  // --- New: follow from search results (optimistic) ---
  const handleFollowUserFromSearch = async (userId: string) => {
    // Optimistically update UI
    setSearchUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isFollowing: true } : u)))

    try {
      const res = await fetch(`/api/users/${userId}/follow`, { method: 'POST', headers: buildHeaders() })
      if (!res.ok) {
        // revert on failure
        setSearchUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isFollowing: false } : u)))
        console.error('Follow failed', res.status)
      } else {
        // optionally refresh suggestions/feed
        fetchSuggestions()
        fetchFeed(1)
      }
    } catch (err) {
      // revert and log
      setSearchUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isFollowing: false } : u)))
      console.error('Failed to follow user', err)
    }
  }

  // --- New: message user (navigate to messages or open composer) ---
  const handleMessageUser = (userId: string, username?: string) => {
    // If your app has a router, replace with navigate(`/messages/compose?to=${userId}`)
    // For now we'll redirect to a messaging route
    window.location.href = `/messages/compose?to=${encodeURIComponent(userId)}&username=${encodeURIComponent(username ?? '')}`
  }

  const handleSearchSelectBook = (book: SearchResultBook) => {
    console.log('Selected book', book)
  }

  const handleSearchSelectUser = (u: SearchResultUser) => {
    // If you want a row-click to view profile, navigate here
    window.location.href = `/users/${encodeURIComponent(u.username)}`
  }

  const totalSearchResults = useMemo(() => searchBooks.length + searchUsers.length, [searchBooks, searchUsers])

  const EmptyState = (): JSX.Element => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
      <h3 className="text-lg font-semibold mb-2">Your feed is empty</h3>
      <p className="text-sm text-gray-600 mb-4">Follow people or choose interests to see posts here.</p>
      <div className="flex items-center justify-center space-x-3">
        <button className="px-4 py-2 rounded bg-blue-600 text-white">Discover Books</button>
        <button className="px-4 py-2 rounded border border-gray-300">Find People</button>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back, {user?.fullName || user?.username || 'reader'}! 🎉</h1>
          <p className="text-gray-600">Here's your personalized reading feed</p>
        </div>

        {/* NOTE: Search is intentionally removed from here — the Navbar should host the single search input. */}
      </div>

      {/* If a query exists (provided by navbar via prop or event), render a compact search results panel under the header */}
      {query ? (
        <div className="mb-6">
          <div className="bg-white border rounded-md p-3">
            <div className="text-sm text-gray-600 mb-2">Search results for "{query}" — {totalSearchResults} results</div>

            {searchBooks.length > 0 && (
              <div className="mb-3">
                <div className="text-sm font-medium text-gray-700 mb-1">Books</div>
                <div className="grid grid-cols-1 gap-2">
                  {searchBooks.map((b) => (
                    <button key={`book-${b.id}`} onClick={() => handleSearchSelectBook(b)} className="w-full text-left hover:bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          {b.cover ? <img src={b.cover} alt={b.title} className="w-full h-full object-cover" /> : null}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{b.title}</div>
                          <div className="text-xs text-gray-500 truncate">{b.author}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {searchUsers.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">People</div>
                <div className="grid grid-cols-1 gap-2">
                  {searchUsers.map((su) => (
                    <div key={`user-${su.id}`} className="w-full hover:bg-gray-50 p-2 rounded flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0" onClick={() => handleSearchSelectUser(su)}>
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                          {su.avatar ? <img src={su.avatar} alt={su.name} className="w-full h-full object-cover" /> : <span className="text-sm">{su.name?.[0]}</span>}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{su.name}</div>
                          <div className="text-xs text-gray-500 truncate">@{su.username}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleFollowUserFromSearch(su.id)}
                          disabled={Boolean(su.isFollowing)}
                          className={`px-3 py-1 rounded text-sm ${su.isFollowing ? 'bg-gray-100 text-gray-600 border' : 'bg-blue-600 text-white'}`}
                        >
                          {su.isFollowing ? 'Following' : 'Follow'}
                        </button>

                        <button
                          onClick={() => handleMessageUser(su.id, su.username)}
                          className="px-3 py-1 rounded text-sm border border-gray-200 flex items-center gap-2"
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

            {totalSearchResults === 0 && <div className="text-sm text-gray-500">No results</div>}
          </div>
        </div>
      ) : null}

      {/* Onboarding / Get started block */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Get Started with Novella</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Search Books</h3>
            <p className="text-sm text-gray-600">Find your favorite books and start reviewing</p>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Write Reviews</h3>
            <p className="text-sm text-gray-600">Share your thoughts with fellow readers</p>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Follow Friends</h3>
            <p className="text-sm text-gray-600">Connect with other book lovers</p>
          </div>
        </div>
      </div>

      {/* Suggested accounts */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Suggested for you</h3>
            <span className="text-sm text-gray-500">Based on your interests</span>
          </div>
          <div className="flex space-x-3 overflow-x-auto">
            {suggestions.map((s) => (
              <div key={s.id} className="w-40 flex-shrink-0 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-400 text-white">
                    <span className="text-white font-medium text-sm">{s.avatar}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">{s.name}</div>
                    <div className="text-xs text-gray-500 truncate">@{s.username}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <button className="px-3 py-1 rounded bg-blue-600 text-white w-full" onClick={() => handleFollow(s.id)}>
                    Follow
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feed Posts */}
      <div className="space-y-6">
        {loading && posts.length === 0 ? (
          <div className="text-center py-12">Loading your feed…</div>
        ) : posts.length === 0 ? (
          <EmptyState />
        ) : (
          posts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-400 to-green-400 text-white">
                    <span className="text-white font-medium text-sm">{post.user.avatar}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{post.user.name}</div>
                    <div className="text-sm text-gray-500">@{post.user.username} • {post.timestamp}</div>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              <div className="flex space-x-4">
                <div className="flex-shrink-0">
                  {post.book?.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.book.cover} alt={post.book.title} className="w-16 h-24 object-cover rounded-lg shadow-sm" />
                  ) : (
                    <div className="w-16 h-24 bg-gray-200 rounded-lg" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <h3 className="font-medium text-gray-900">{post.book?.title}</h3>
                    <p className="text-sm text-gray-600">by {post.book?.author}</p>
                  </div>

                  {post.type === 'review' && post.rating != null && (() => {
                    const rating = post.rating as number
                    return (
                      <div className="flex items-center space-x-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">{rating}/5</span>
                      </div>
                    )
                  })()}

                  <div className="mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.type === 'review' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                      {post.type === 'review' ? '📝 Review' : '📖 Currently Reading'}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

                  <div className="flex items-center space-x-6">
                    <button className={`flex items-center space-x-2 text-sm ${post.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`} onClick={() => handleLike(post.id)}>
                      <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span>{post.likes}</span>
                    </button>

                    <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-600">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </button>

                    <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-green-600">
                      <Share className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Load More Button */}
      <div className="text-center mt-8">
        {hasMore ? (
          <button className="px-4 py-2 rounded border" onClick={handleLoadMore} disabled={loading}>
            {loading ? 'Loading…' : 'Load More Posts'}
          </button>
        ) : (
          posts.length > 0 && <div className="text-sm text-gray-500">You’ve reached the end of the feed.</div>
        )}
      </div>
    </div>
  )
}
