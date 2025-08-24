import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { BookOpen, Users, Star, Heart, MessageCircle, Share, Settings, UserPlus, Calendar, ExternalLink } from 'lucide-react'

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user: currentUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('activity')
  
  // Mock user data - in a real app, you'd fetch this based on the username param
  const profileUser = {
    id: username === currentUser?.username ? currentUser.id : 'user-2',
    username: username || 'unknown',
    fullName: username === currentUser?.username ? currentUser?.fullName : 'Jane Smith',
    email: username === currentUser?.username ? currentUser?.email : 'jane@example.com',
    bio: username === currentUser?.username ? (currentUser?.bio || 'Book lover and aspiring writer. Always looking for the next great read! 📚✨') : 'Passionate reader of literary fiction and fantasy. Coffee enthusiast.',
    profileImageUrl: username === currentUser?.username ? currentUser?.profileImageUrl : undefined,
    websiteUrl: username === currentUser?.username ? currentUser?.websiteUrl : 'https://janereads.blog',
    twitterHandle: username === currentUser?.username ? currentUser?.twitterHandle : 'janereads',
    instagramHandle: username === currentUser?.username ? currentUser?.instagramHandle : 'jane.reads.books',
    isVerified: username === currentUser?.username ? (currentUser?.isVerified || false) : true,
    interests: username === currentUser?.username ? (currentUser?.interests || ['Fiction', 'Fantasy', 'Biography']) : ['Literary Fiction', 'Poetry', 'Philosophy'],
    createdAt: username === currentUser?.username ? (currentUser?.createdAt || '2023-01-15') : '2022-08-12',
    stats: {
      booksRead: username === currentUser?.username ? 42 : 67,
      reviews: username === currentUser?.username ? 28 : 45,
      followers: username === currentUser?.username ? 156 : 234,
      following: username === currentUser?.username ? 89 : 123,
      averageRating: username === currentUser?.username ? 4.2 : 4.1
    }
  }

  const isOwnProfile = username === currentUser?.username
  const [isFollowing, setIsFollowing] = useState(false)

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing)
  }

  const recentActivity = [
    {
      id: 1,
      type: 'review',
      book: {
        title: 'The Seven Husbands of Evelyn Hugo',
        author: 'Taylor Jenkins Reid',
        cover: 'https://images-na.ssl-images-amazon.com/images/I/71FTb9X6wsL.jpg'
      },
      rating: 5,
      content: 'Absolutely captivating! This book had me hooked from the first page.',
      timestamp: '2 days ago',
      likes: 12,
      comments: 3
    },
    {
      id: 2,
      type: 'reading',
      book: {
        title: 'Klara and the Sun',
        author: 'Kazuo Ishiguro',
        cover: 'https://images-na.ssl-images-amazon.com/images/I/71cN0qJMbXL.jpg'
      },
      content: 'Just started this Nobel Prize winner\'s latest work.',
      timestamp: '5 days ago',
      likes: 8,
      comments: 2
    },
    {
      id: 3,
      type: 'finished',
      book: {
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        cover: 'https://images-na.ssl-images-amazon.com/images/I/91vS0F7DXFL.jpg'
      },
      rating: 4,
      content: 'What a wild ride! Andy Weir delivers another science-heavy thriller.',
      timestamp: '1 week ago',
      likes: 15,
      comments: 7
    }
  ]

  const readingLists = [
    {
      id: 1,
      name: 'Must Read Fiction 2024',
      bookCount: 12,
      isPublic: true,
      coverBooks: [
        'https://images-na.ssl-images-amazon.com/images/I/71FTb9X6wsL.jpg',
        'https://images-na.ssl-images-amazon.com/images/I/71cN0qJMbXL.jpg',
        'https://images-na.ssl-images-amazon.com/images/I/91vS0F7DXFL.jpg'
      ]
    },
    {
      id: 2,
      name: 'Fantasy Favorites',
      bookCount: 8,
      isPublic: true,
      coverBooks: [
        'https://images-na.ssl-images-amazon.com/images/I/81NJbF4Tm9L.jpg',
        'https://images-na.ssl-images-amazon.com/images/I/91K0cXJg-tL.jpg',
        'https://images-na.ssl-images-amazon.com/images/I/71BYWWjVFmL.jpg'
      ]
    }
  ]

  const tabs = [
    { id: 'activity', label: 'Activity', count: recentActivity.length },
    { id: 'reviews', label: 'Reviews', count: profileUser.stats.reviews },
    { id: 'lists', label: 'Reading Lists', count: readingLists.length },
    { id: 'stats', label: 'Reading Stats' }
  ]

  const getTabContent = () => {
    switch (activeTab) {
      case 'activity':
        return (
          <div className="space-y-6">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={activity.book.cover}
                      alt={activity.book.title}
                      className="w-16 h-24 object-cover rounded-lg shadow-sm"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      <h3 className="font-medium text-gray-900">{activity.book.title}</h3>
                      <p className="text-sm text-gray-600">by {activity.book.author}</p>
                    </div>

                    {activity.rating && (
                      <div className="flex items-center space-x-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < activity.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">{activity.rating}/5</span>
                      </div>
                    )}

                    <div className="mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.type === 'review' 
                          ? 'bg-blue-100 text-blue-800' 
                          : activity.type === 'reading'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {activity.type === 'review' 
                          ? '📝 Reviewed' 
                          : activity.type === 'reading'
                          ? '📖 Currently Reading'
                          : '✅ Finished Reading'
                        }
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">{activity.content}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-red-600">
                          <Heart className="h-4 w-4" />
                          <span>{activity.likes}</span>
                        </button>
                        
                        <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-600">
                          <MessageCircle className="h-4 w-4" />
                          <span>{activity.comments}</span>
                        </button>
                        
                        <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-green-600">
                          <Share className="h-4 w-4" />
                          <span>Share</span>
                        </button>
                      </div>
                      <span className="text-sm text-gray-500">{activity.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      case 'lists':
        return (
          <div className="grid md:grid-cols-2 gap-6">
            {readingLists.map((list) => (
              <div key={list.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">{list.name}</h3>
                    <p className="text-sm text-gray-600">{list.bookCount} books</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    list.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {list.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  {list.coverBooks.slice(0, 3).map((cover, i) => (
                    <img
                      key={i}
                      src={cover}
                      alt=""
                      className="w-12 h-16 object-cover rounded shadow-sm"
                    />
                  ))}
                  {list.bookCount > 3 && (
                    <div className="w-12 h-16 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-500">+{list.bookCount - 3}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      case 'stats':
        return (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <BookOpen className="h-8 w-8 text-primary-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">{profileUser.stats.booksRead}</div>
              <div className="text-sm text-gray-600">Books Read</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">{profileUser.stats.averageRating}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <MessageCircle className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">{profileUser.stats.reviews}</div>
              <div className="text-sm text-gray-600">Reviews Written</div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">{profileUser.stats.followers}</div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <Users className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">{profileUser.stats.following}</div>
              <div className="text-sm text-gray-600">Following</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <Calendar className="h-8 w-8 text-indigo-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-gray-900">
                {new Date(profileUser.createdAt).getFullYear()}
              </div>
              <div className="text-sm text-gray-600">Member Since</div>
            </div>
          </div>
        )
      default:
        return <div>Reviews content coming soon...</div>
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8 transition-colors duration-200">
        <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
          {/* Avatar and Basic Info */}
          <div className="flex-shrink-0 text-center lg:text-left mb-6 lg:mb-0">
            {profileUser.profileImageUrl ? (
              <img 
                src={profileUser.profileImageUrl} 
                alt={profileUser.username}
                className="h-32 w-32 rounded-full object-cover mx-auto lg:mx-0 mb-4"
              />
            ) : (
              <div className="h-32 w-32 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-4">
                <span className="text-white font-bold text-4xl">
                  {profileUser.fullName?.charAt(0) || profileUser.username?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
            
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center lg:justify-start">
                {profileUser.fullName || profileUser.username}
                {profileUser.isVerified && (
                  <span className="ml-2 text-blue-500">✓</span>
                )}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">@{profileUser.username}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 justify-center lg:justify-start">
              {isOwnProfile ? (
                <button className="btn-secondary flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleFollowClick}
                    className={`btn-primary flex items-center space-x-2 ${
                      isFollowing ? 'bg-gray-600 hover:bg-gray-700' : ''
                    }`}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>{isFollowing ? 'Following' : 'Follow'}</span>
                  </button>
                  <button className="btn-secondary">Message</button>
                </>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="flex-1">
            {profileUser.bio && (
              <p className="text-gray-700 mb-6 leading-relaxed">
                {profileUser.bio}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center lg:text-left">
                <div className="text-xl font-bold text-gray-900">{profileUser.stats.booksRead}</div>
                <div className="text-sm text-gray-600">Books Read</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl font-bold text-gray-900">{profileUser.stats.reviews}</div>
                <div className="text-sm text-gray-600">Reviews</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl font-bold text-gray-900">{profileUser.stats.followers}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl font-bold text-gray-900">{profileUser.stats.following}</div>
                <div className="text-sm text-gray-600">Following</div>
              </div>
            </div>

            {/* Interests */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profileUser.interests.map((interest, i) => (
                  <span key={i} className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Social Links */}
            {(profileUser.websiteUrl || profileUser.twitterHandle || profileUser.instagramHandle) && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Links</h3>
                <div className="flex flex-wrap gap-4">
                  {profileUser.websiteUrl && (
                    <a 
                      href={profileUser.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Website</span>
                    </a>
                  )}
                  {profileUser.twitterHandle && (
                    <a 
                      href={`https://twitter.com/${profileUser.twitterHandle}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
                    >
                      <span>🐦</span>
                      <span>@{profileUser.twitterHandle}</span>
                    </a>
                  )}
                  {profileUser.instagramHandle && (
                    <a 
                      href={`https://instagram.com/${profileUser.instagramHandle}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
                    >
                      <span>📷</span>
                      <span>@{profileUser.instagramHandle}</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {getTabContent()}
      </div>
    </div>
  )
}