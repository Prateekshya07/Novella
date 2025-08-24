import { useAuthStore } from '../store/authStore'
import { BookOpen, Users, Star, Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react'

export default function FeedPage() {
  const { user } = useAuthStore()

  const samplePosts = [
    {
      id: 1,
      user: { name: 'Alice Johnson', username: 'bookworm_alice', avatar: 'AJ' },
      type: 'review',
      book: {
        title: 'The Seven Husbands of Evelyn Hugo',
        author: 'Taylor Jenkins Reid',
        cover: 'https://images-na.ssl-images-amazon.com/images/I/71FTb9X6wsL.jpg'
      },
      rating: 5,
      content: 'Absolutely captivating! This book had me hooked from the first page. The storytelling is phenomenal and Evelyn Hugo is such a complex, fascinating character. Taylor Jenkins Reid has outdone herself with this masterpiece.',
      timestamp: '2 hours ago',
      likes: 12,
      comments: 3,
      isLiked: false
    },
    {
      id: 2,
      user: { name: 'Bob Smith', username: 'lit_enthusiast', avatar: 'BS' },
      type: 'reading',
      book: {
        title: 'Klara and the Sun',
        author: 'Kazuo Ishiguro',
        cover: 'https://images-na.ssl-images-amazon.com/images/I/71cN0qJMbXL.jpg'
      },
      content: 'Just started this Nobel Prize winner\'s latest work. The perspective of an artificial friend is already proving to be incredibly moving and thought-provoking.',
      timestamp: '4 hours ago',
      likes: 8,
      comments: 2,
      isLiked: true
    },
    {
      id: 3,
      user: { name: 'Sarah Wilson', username: 'page_turner', avatar: 'SW' },
      type: 'review',
      book: {
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        cover: 'https://images-na.ssl-images-amazon.com/images/I/91vS0F7DXFL.jpg'
      },
      rating: 4,
      content: 'What a wild ride! Andy Weir delivers another science-heavy thriller that somehow makes complex physics accessible and entertaining. Grace is such a lovable protagonist.',
      timestamp: '1 day ago',
      likes: 15,
      comments: 7,
      isLiked: false
    }
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.fullName || user?.username}! 🎉
        </h1>
        <p className="text-gray-600">Here's your personalized reading feed</p>
      </div>

      {/* Welcome message for new users */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Get Started with Novella</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Search Books</h3>
            <p className="text-sm text-gray-600">Find your favorite books and start reviewing</p>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Write Reviews</h3>
            <p className="text-sm text-gray-600">Share your thoughts with fellow readers</p>
          </div>
          <div className="text-center">
            <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Follow Friends</h3>
            <p className="text-sm text-gray-600">Connect with other book lovers</p>
          </div>
        </div>
      </div>

      {/* Feed Posts */}
      <div className="space-y-6">
        {samplePosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
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

            {/* Post Content */}
            <div className="flex space-x-4">
              {/* Book Cover */}
              <div className="flex-shrink-0">
                <img
                  src={post.book.cover}
                  alt={post.book.title}
                  className="w-16 h-24 object-cover rounded-lg shadow-sm"
                />
              </div>

              {/* Post Details */}
              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <h3 className="font-medium text-gray-900">{post.book.title}</h3>
                  <p className="text-sm text-gray-600">by {post.book.author}</p>
                </div>

                {/* Rating (for reviews) */}
                {post.type === 'review' && post.rating && (
                  <div className="flex items-center space-x-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < post.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">{post.rating}/5</span>
                  </div>
                )}

                {/* Post Type Badge */}
                <div className="mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    post.type === 'review' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {post.type === 'review' ? '📝 Review' : '📖 Currently Reading'}
                  </span>
                </div>

                {/* Post Content */}
                <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

                {/* Post Actions */}
                <div className="flex items-center space-x-6">
                  <button className={`flex items-center space-x-2 text-sm ${post.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}>
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
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center mt-8">
        <button className="btn-secondary">
          Load More Posts
        </button>
      </div>
    </div>
  )
}