-- Function to increment story likes
CREATE OR REPLACE FUNCTION increment_story_likes(story_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE stories 
  SET likes_count = COALESCE(likes_count, 0) + 1 
  WHERE id = story_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement story likes
CREATE OR REPLACE FUNCTION decrement_story_likes(story_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE stories 
  SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) 
  WHERE id = story_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment tip likes
CREATE OR REPLACE FUNCTION increment_tip_likes(tip_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE tips 
  SET likes_count = COALESCE(likes_count, 0) + 1 
  WHERE id = tip_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement tip likes
CREATE OR REPLACE FUNCTION decrement_tip_likes(tip_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE tips 
  SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) 
  WHERE id = tip_id;
END;
$$ LANGUAGE plpgsql;

-- Create story_likes table
CREATE TABLE IF NOT EXISTS story_likes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_story_likes_user_id ON story_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_story_likes_story_id ON story_likes(story_id);
CREATE INDEX IF NOT EXISTS idx_tip_likes_user_id ON tip_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_tip_likes_tip_id ON tip_likes(tip_id);
