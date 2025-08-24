export interface User {
  id: string
  username: string
  email: string
  fullName?: string
  bio?: string
  profileImageUrl?: string
  interests: string[]
  websiteUrl?: string
  twitterHandle?: string
  instagramHandle?: string
  isVerified: boolean
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
  fullName?: string
}