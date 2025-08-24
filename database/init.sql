-- Novella Platform Database Schema
-- PostgreSQL Schema for Social Book Review Platform

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    bio TEXT,
    profile_image_url VARCHAR(500),
    interests TEXT[], -- Array of interests
    website_url VARCHAR(255),
    twitter_handle VARCHAR(50),
    instagram_handle VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Books table (we'll integrate with Open Library API but cache popular books)
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    open_library_id VARCHAR(50) UNIQUE,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20),
    publication_year INTEGER,
    cover_image_url VARCHAR(500),
    description TEXT,
    genre VARCHAR(100),
    page_count INTEGER,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    content TEXT,
    is_spoiler BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_id) -- One review per user per book
);

-- Followers table (social following)
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);

-- Review likes table
CREATE TABLE review_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, review_id)
);

-- Review comments table
CREATE TABLE review_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reading lists/shelves
CREATE TABLE reading_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Books in reading lists
CREATE TABLE reading_list_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reading_list_id UUID NOT NULL REFERENCES reading_lists(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'to-read' CHECK (status IN ('to-read', 'reading', 'read')),
    date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_started TIMESTAMP WITH TIME ZONE,
    date_finished TIMESTAMP WITH TIME ZONE,
    UNIQUE(reading_list_id, book_id)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'follow', 'like', 'comment', 'review'
    title VARCHAR(200) NOT NULL,
    message TEXT,
    related_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    related_review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table (for Redis backup)
CREATE TABLE sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    data TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_books_title ON books USING GIN (title gin_trgm_ops);
CREATE INDEX idx_books_author ON books USING GIN (author gin_trgm_ops);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_book_id ON reviews(book_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_review_likes_review_id ON review_likes(review_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_lists_updated_at BEFORE UPDATE ON reading_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_comments_updated_at BEFORE UPDATE ON review_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create default reading lists for each user
CREATE OR REPLACE FUNCTION create_default_reading_lists()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO reading_lists (user_id, name, description, is_public) VALUES 
    (NEW.id, 'Want to Read', 'Books I want to read', TRUE),
    (NEW.id, 'Currently Reading', 'Books I am currently reading', TRUE),
    (NEW.id, 'Read', 'Books I have finished reading', TRUE);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_user_reading_lists 
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_default_reading_lists();

-- Sample data for development
INSERT INTO users (username, email, password_hash, full_name, bio) VALUES 
('bookworm_alice', 'alice@example.com', '$2b$10$dummy_hash_for_development', 'Alice Johnson', 'Lover of fantasy novels and mystery thrillers'),
('lit_enthusiast', 'bob@example.com', '$2b$10$dummy_hash_for_development', 'Bob Smith', 'English literature professor and avid reader');

INSERT INTO books (title, author, publication_year, description, genre) VALUES 
('The Hobbit', 'J.R.R. Tolkien', 1937, 'A classic fantasy novel about Bilbo Baggins adventure', 'Fantasy'),
('Pride and Prejudice', 'Jane Austen', 1813, 'A romantic novel about Elizabeth Bennet and Mr. Darcy', 'Romance'),
('1984', 'George Orwell', 1949, 'A dystopian novel about totalitarianism', 'Science Fiction');

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO novella_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO novella_user;