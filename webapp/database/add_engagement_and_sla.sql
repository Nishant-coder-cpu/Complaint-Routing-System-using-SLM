-- Additional schema changes for dynamic SLA and engagement

-- Add predicted SLA columns to complaints table
ALTER TABLE complaints 
ADD COLUMN predicted_resolution_days NUMERIC(5,2),
ADD COLUMN actual_resolution_days NUMERIC(5,2),
ADD COLUMN engagement_score NUMERIC DEFAULT 0,
ADD COLUMN visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private'));

-- Create complaint engagement table
CREATE TABLE IF NOT EXISTS complaint_engagement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL CHECK (action_type IN ('like', 'comment')),
    comment_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(complaint_id, user_id, action_type)  -- One like per user per complaint
);

-- Enable RLS on engagement table
ALTER TABLE complaint_engagement ENABLE ROW LEVEL SECURITY;

-- Users can view public complaint engagement
CREATE POLICY "Users can view public complaint engagement"
ON complaint_engagement FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM complaints
        WHERE complaints.id = complaint_engagement.complaint_id
        AND complaints.visibility = 'public'
    )
);

-- Users can create their own engagement (likes/comments)
CREATE POLICY "Users can create engagements"
ON complaint_engagement FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes (for unlike)
CREATE POLICY "Users can delete their own likes"
ON complaint_engagement FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND action_type = 'like');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_engagement_complaint_id ON complaint_engagement(complaint_id);
CREATE INDEX IF NOT EXISTS idx_engagement_user_id ON complaint_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_action_type ON complaint_engagement(action_type);
CREATE INDEX IF NOT EXISTS idx_complaints_visibility ON complaints(visibility);
