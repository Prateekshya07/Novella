import { useParams } from 'react-router-dom'
import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import {
  BookOpen,
  Star,
  MessageCircle,
  Settings,
  UserPlus,
  MoreHorizontal,
  X,
} from 'lucide-react'

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user: currentUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('activity')

  // ✅ Type definitions
  interface UserStats {
    booksRead: number
    reviews: number
    followers: number
    following: number
    averageRating: number
  }

  interface ProfileUser {
    id: string
    username: string
    fullName: string
    email: string
    bio: string
    location?: string
    profileImageUrl?: string
    websiteUrl?: string
    twitterHandle?: string
    instagramHandle?: string
    isVerified: boolean
    interests: string[]
    createdAt: string
    stats: UserStats
  }

  type Review = { text: string; date: string }

  // ✅ Review state
  const [reviewText, setReviewText] = useState('')
  const [reviews, setReviews] = useState<Review[]>([])

  // ✅ Edit & Delete modal state
  const [showOptions, setShowOptions] = useState<number | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  if (!currentUser) return <div>Loading...</div>

  const [profileUser, setProfileUser] = useState<ProfileUser>({
    id: username === currentUser.username ? currentUser.id : 'user-2',
    username: username || 'unknown',
    fullName:
      username === currentUser.username ? currentUser.fullName || '' : 'Jane Smith',
    email:
      username === currentUser.username ? currentUser.email || '' : 'jane@example.com',
    bio:
      username === currentUser.username
        ? currentUser.bio || 'Book lover and aspiring writer. Always looking for the next great read! 📚✨'
        : 'Passionate reader of literary fiction and fantasy. Coffee enthusiast.',
    location: username === currentUser.username ? (currentUser as any).location || '' : 'Unknown',
    isVerified: username === currentUser.username ? currentUser.isVerified || false : true,
    interests: username === currentUser.username ? currentUser.interests || [] : [],
    createdAt:
      username === currentUser.username
        ? currentUser.createdAt || new Date().toISOString()
        : '2022-08-12',
    stats: {
      booksRead: username === currentUser.username ? currentUser.stats?.booksRead || 0 : 0,
      reviews: username === currentUser.username ? currentUser.stats?.reviews || 0 : 0,
      followers: username === currentUser.username ? currentUser.stats?.followers || 0 : 0,
      following: username === currentUser.username ? currentUser.stats?.following || 0 : 0,
      averageRating:
        username === currentUser.username ? currentUser.stats?.averageRating || 0 : 0,
    },
  })

  const isOwnProfile = username === currentUser.username
  const [isFollowing, setIsFollowing] = useState(false)

  // --- New: Edit Profile modal state & form values ---
  const [showEditModal, setShowEditModal] = useState(false)
  const [formUsername, setFormUsername] = useState(profileUser.username)
  const [formFullName, setFormFullName] = useState(profileUser.fullName)
  const [formBio, setFormBio] = useState(profileUser.bio)
  const [formLocation, setFormLocation] = useState(profileUser.location || '')
  const [formImagePreview, setFormImagePreview] = useState<string | undefined>(profileUser.profileImageUrl)
  const [formImageFile, setFormImageFile] = useState<File | null>(null)

  // Keep form values in sync when profileUser changes (for example initial load)
  const openEditModal = () => {
    setFormUsername(profileUser.username)
    setFormFullName(profileUser.fullName)
    setFormBio(profileUser.bio)
    setFormLocation(profileUser.location || '')
    setFormImagePreview(profileUser.profileImageUrl)
    setFormImageFile(null)
    setShowEditModal(true)
  }

  const handleImageChange = (file?: File) => {
    if (!file) return setFormImagePreview(undefined)
    setFormImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setFormImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const onImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageChange(file)
  }

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault()
    // Basic validation
    if (!formUsername.trim()) return alert('Username cannot be empty')

    // Update profile locally. In a real app you'd call an API and update global store.
    setProfileUser((prev) => ({
      ...prev,
      username: formUsername.trim(),
      fullName: formFullName.trim(),
      bio: formBio,
      location: formLocation.trim(),
      profileImageUrl: formImagePreview,
    }))

    setShowEditModal(false)
  }

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing)
    setProfileUser((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        followers: isFollowing ? prev.stats.followers - 1 : prev.stats.followers + 1,
      },
    }))
  }

  // ✅ Post Review + Update Stats
  const handlePostReview = () => {
    if (reviewText.trim()) {
      const newReview = { text: reviewText, date: new Date().toLocaleString() }
      setReviews([newReview, ...reviews])
      setReviewText('')
      setProfileUser((prev) => ({
        ...prev,
        stats: { ...prev.stats, reviews: prev.stats.reviews + 1 },
      }))
    }
  }

  // ✅ Edit Review
  const handleEditReview = (index: number) => {
    setEditingIndex(index)
    setEditText(reviews[index].text)
    setShowOptions(null)
  }

  const saveEditedReview = () => {
    if (editingIndex !== null) {
      const updated = [...reviews]
      updated[editingIndex].text = editText
      setReviews(updated)
      setEditingIndex(null)
    }
  }

  // ✅ Delete Review
  const confirmDeleteReview = () => {
    if (deleteIndex !== null) {
      const updated = reviews.filter((_, i) => i !== deleteIndex)
      setReviews(updated)
      setDeleteIndex(null)
      setProfileUser((prev) => ({
        ...prev,
        stats: { ...prev.stats, reviews: prev.stats.reviews - 1 },
      }))
    }
  }

  const tabs = [
    { id: 'activity', label: 'Activity', count: 0 },
    { id: 'reviews', label: 'Reviews', count: reviews.length },
    { id: 'lists', label: 'Reading Lists', count: 0 },
    { id: 'stats', label: 'Reading Stats' },
  ]

  const getTabContent = () => {
    switch (activeTab) {
      case 'reviews':
        return (
          <div className="space-y-6">
            {/* Write Review */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Write a Review</h3>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about a book..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                rows={4}
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handlePostReview}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  Post Review
                </button>
              </div>
            </div>

            {/* Posted Reviews */}
            {reviews.length === 0 ? (
              <p className="text-gray-600">No reviews yet. Be the first to share!</p>
            ) : (
              reviews.map((r, index) => (
                <div
                  key={index}
                  className="relative bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <p className="text-gray-800 whitespace-pre-line mb-2">{r.text}</p>
                  <span className="text-xs text-gray-500">{r.date}</span>

                  <button
                    onClick={() => setShowOptions(showOptions === index ? null : index)}
                    className="absolute top-2 right-2 p-2 hover:bg-gray-200 rounded-full"
                  >
                    <MoreHorizontal className="w-5 h-5 text-gray-600" />
                  </button>

                  {showOptions === index && (
                    <div className="absolute top-8 right-2 bg-white border rounded-md shadow-md z-10">
                      <button
                        onClick={() => handleEditReview(index)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteIndex(index)}
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* ✅ Edit Modal */}
            <AnimatePresence>
              {editingIndex !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
                >
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    className="bg-white rounded-xl p-6 w-11/12 md:w-1/2"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Edit Review</h3>
                      <button onClick={() => setEditingIndex(null)}>
                        <X className="h-5 w-5 text-gray-500" />
                      </button>
                    </div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 resize-none"
                      rows={4}
                    />
                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEditedReview}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Save
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ✅ Delete Bottom Sheet */}
            <AnimatePresence>
              {deleteIndex !== null && (
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="fixed inset-0 bg-black bg-opacity-40 flex items-end justify-center z-50"
                >
                  <motion.div className="bg-white rounded-t-2xl p-6 w-full md:w-1/2 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Delete Review?
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Are you sure you want to delete this review? This action cannot be undone.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => setDeleteIndex(null)}
                        className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                      >
                        No
                      </button>
                      <button
                        onClick={confirmDeleteReview}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Yes, Delete
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )

      case 'stats':
        return (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <BookOpen className="h-8 w-8 mx-auto text-primary-600 mb-2" />
              <p className="text-2xl font-bold">{profileUser.stats.booksRead}</p>
              <p className="text-gray-500 text-sm">Books Read</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <Star className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-bold">{profileUser.stats.averageRating}</p>
              <p className="text-gray-500 text-sm">Average Rating</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <MessageCircle className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{reviews.length}</p>
              <p className="text-gray-500 text-sm">Reviews Written</p>
            </div>
          </div>
        )

      default:
        return <p>No recent activity yet.</p>
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
          {/* Avatar + Info */}
          <div className="flex-shrink-0 text-center lg:text-left mb-6 lg:mb-0">
            <div className="h-32 w-32 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-4 overflow-hidden">
              {profileUser.profileImageUrl ? (
                <img src={profileUser.profileImageUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-white font-bold text-4xl">
                  {profileUser.fullName?.charAt(0) || profileUser.username?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              {profileUser.fullName || profileUser.username}
            </h1>
            <p className="text-gray-600">@{profileUser.username}</p>
            {profileUser.location && <p className="text-sm text-gray-500">{profileUser.location}</p>}

            {/* Buttons */}
            <div className="flex space-x-3 justify-center lg:justify-start mt-4">
              {isOwnProfile ? (
                <>
                  <button onClick={openEditModal} className="btn-secondary flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleFollowClick}
                    className={`btn-primary flex items-center space-x-2 ${isFollowing ? 'bg-gray-600 hover:bg-gray-700' : ''}`}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>{isFollowing ? 'Following' : 'Follow'}</span>
                  </button>
                  <button className="btn-secondary">Message</button>
                </>
              )}
            </div>
          </div>

          {/* Bio + Stats */}
          <div className="flex-1">
            <p className="text-gray-700 mb-6 leading-relaxed">{profileUser.bio}</p>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold text-gray-900">{profileUser.stats.booksRead}</p>
                <p className="text-sm text-gray-500">Books Read</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{profileUser.stats.reviews}</p>
                <p className="text-sm text-gray-500">Reviews</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{profileUser.stats.followers}</p>
                <p className="text-sm text-gray-500">Followers</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{profileUser.stats.following}</p>
                <p className="text-sm text-gray-500">Following</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{profileUser.stats.averageRating}</p>
                <p className="text-sm text-gray-500">Avg. Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-3 -mb-px border-b-2 font-medium text-sm ${activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.label}
              {tab.count !== undefined && ` (${tab.count})`}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {getTabContent()}

      {/* ----------------- Edit Profile Modal ----------------- */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          >
            <motion.form
              onSubmit={handleSaveProfile}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 w-11/12 md:w-1/2 max-h-[90vh] overflow-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
                <button type="button" onClick={() => setShowEditModal(false)}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Profile image preview + upload */}
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                    {formImagePreview ? (
                      // preview
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={formImagePreview} alt="preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-gray-600 font-bold text-2xl">{formFullName?.charAt(0) || formUsername?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                    <input type="file" accept="image/*" onChange={onImageInputChange} className="mt-2" />
                    <div className="mt-2 text-xs text-gray-500">PNG, JPG or GIF — max 5MB</div>
                    {formImagePreview && (
                      <button type="button" onClick={() => { setFormImagePreview(undefined); setFormImageFile(null) }} className="mt-2 text-sm text-red-600 hover:underline">Remove</button>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500"
                    placeholder="your-username"
                  />
                  <p className="text-xs text-gray-500 mt-1">Usernames cannot contain spaces.</p>
                </div>

                {/* Full name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full name</label>
                  <input
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500"
                    placeholder="Your full name"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="A little bit about you..."
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500"
                    placeholder="City, Country (optional)"
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-2">
                  <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save</button>
                </div>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
