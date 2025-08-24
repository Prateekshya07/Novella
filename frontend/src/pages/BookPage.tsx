import { useParams } from 'react-router-dom'
import { Star, Heart, BookmarkPlus, Share, MessageCircle, Users } from 'lucide-react'
import { useState } from 'react'

export default function BookPage() {
  const { id } = useParams<{ id: string }>()
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const demoBooks = [
    {
      id: 1,
      title: 'The Seven Husbands of Evelyn Hugo',
      author: 'Taylor Jenkins Reid',
      cover: 'https://images-na.ssl-images-amazon.com/images/I/71FTb9X6wsL.jpg',
      rating: 4.5,
      year: 2017,
      pages: 400,
      genre: 'Historical Fiction',
      description: 'Reclusive Hollywood icon Evelyn Hugo is finally ready to tell the truth about her glamorous and scandalous life. But when she chooses unknown magazine reporter Monique Grant for the job, no one is more astounded than Monique herself.',
      reviews: 2847
    },
    {
      id: 2,
      title: 'Klara and the Sun',
      author: 'Kazuo Ishiguro',
      cover: 'https://images-na.ssl-images-amazon.com/images/I/71cN0qJMbXL.jpg',
      rating: 4.2,
      year: 2021,
      pages: 320,
      genre: 'Science Fiction',
      description: 'From the Nobel Prize-winning author comes a luminous meditation on love, loss, and what it means to be human, told from the perspective of an artificial friend.',
      reviews: 1823
    },
    {
      id: 3,
      title: 'Project Hail Mary',
      author: 'Andy Weir',
      cover: 'https://images-na.ssl-images-amazon.com/images/I/91vS0F7DXFL.jpg',
      rating: 4.8,
      year: 2021,
      pages: 496,
      genre: 'Science Fiction',
      description: 'Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish. Except that right now, he doesn\'t know that.',
      reviews: 3654
    }
  ]

  const book = demoBooks.find(b => b.id === parseInt(id || '1')) || demoBooks[0]

  const sampleReviews = [
    {
      id: 1,
      user: { name: 'Alice Johnson', username: 'bookworm_alice', avatar: 'AJ' },
      rating: 5,
      content: 'Absolutely mesmerizing! This book completely blew me away with its intricate storytelling and complex characters.',
      timestamp: '2 days ago',
      likes: 23
    },
    {
      id: 2,
      user: { name: 'Bob Smith', username: 'lit_enthusiast', avatar: 'BS' },
      rating: 4,
      content: 'A beautiful and thought-provoking read. The author\'s writing style is simply captivating.',
      timestamp: '1 week ago',
      likes: 15
    },
    {
      id: 3,
      user: { name: 'Sarah Wilson', username: 'page_turner', avatar: 'SW' },
      rating: 5,
      content: 'One of the best books I\'ve read this year! Couldn\'t put it down once I started.',
      timestamp: '2 weeks ago',
      likes: 31
    }
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Book Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Book Cover */}
              <div className="flex-shrink-0">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-48 h-72 object-cover rounded-lg shadow-md mx-auto sm:mx-0"
                />
              </div>

              {/* Book Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                <p className="text-lg text-gray-600 mb-4">by {book.author}</p>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(book.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-medium text-gray-900">{book.rating}</span>
                  <span className="text-gray-500">({book.reviews.toLocaleString()} reviews)</span>
                </div>

                {/* Book Details */}
                <div className="space-y-2 mb-6">
                  <div className="flex text-sm">
                    <span className="font-medium text-gray-900 w-20">Year:</span>
                    <span className="text-gray-600">{book.year}</span>
                  </div>
                  <div className="flex text-sm">
                    <span className="font-medium text-gray-900 w-20">Pages:</span>
                    <span className="text-gray-600">{book.pages}</span>
                  </div>
                  <div className="flex text-sm">
                    <span className="font-medium text-gray-900 w-20">Genre:</span>
                    <span className="text-gray-600">{book.genre}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      isLiked 
                        ? 'bg-red-50 border-red-200 text-red-700' 
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>Like</span>
                  </button>

                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      isBookmarked
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <BookmarkPlus className="h-4 w-4" />
                    <span>Save</span>
                  </button>

                  <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
                    <Share className="h-4 w-4" />
                    <span>Share</span>
                  </button>

                  <button className="btn-primary">
                    Write Review
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">About this book</h3>
              <p className="text-gray-700 leading-relaxed">{book.description}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reading Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Reading Status</h3>
            <div className="space-y-3">
              <button className="w-full btn-primary">
                Mark as Read
              </button>
              <button className="w-full btn-secondary">
                Want to Read
              </button>
              <button className="w-full btn-ghost">
                Currently Reading
              </button>
            </div>
          </div>

          {/* Popular Reviews */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Popular Reviews</h3>
            <div className="space-y-4">
              {sampleReviews.slice(0, 2).map((review) => (
                <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-6 w-6 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-xs">{review.user.avatar}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{review.user.name}</span>
                    <div className="flex items-center">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">{review.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{review.timestamp}</span>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Heart className="h-3 w-3" />
                      <span>{review.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All Reviews
            </button>
          </div>

          {/* Similar Books */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Readers Also Enjoyed</h3>
            <div className="space-y-3">
              {demoBooks.filter(b => b.id !== book.id).slice(0, 3).map((similarBook) => (
                <div key={similarBook.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <img
                    src={similarBook.cover}
                    alt={similarBook.title}
                    className="w-8 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {similarBook.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      by {similarBook.author}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Community Reviews</h3>
          <button className="btn-primary">
            Write a Review
          </button>
        </div>

        <div className="space-y-6">
          {sampleReviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{review.user.avatar}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{review.user.name}</span>
                    <span className="text-gray-500">@{review.user.username}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{review.timestamp}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-3">{review.content}</p>
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-red-600">
                  <Heart className="h-4 w-4" />
                  <span>{review.likes}</span>
                </button>
                <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-600">
                  <MessageCircle className="h-4 w-4" />
                  <span>Reply</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}