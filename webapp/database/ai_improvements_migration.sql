-- Unified Migration Script for All AI Improvements
-- Run this via Supabase SQL Editor or Node.js script

-- ==========================================
-- PHASE 1: Confidence Tracking & Review
-- ==========================================

-- Add confidence tracking columns
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS ai_confidence JSONB,
ADD COLUMN IF NOT EXISTS requires_review BOOLEAN DEFAULT false;

-- Create AI feedback table
CREATE TABLE IF NOT EXISTS ai_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    original_text TEXT NOT NULL,
    ai_prediction JSONB NOT NULL,
    human_correction JSONB,
    corrected_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on ai_feedback
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view AI feedback" ON ai_feedback;
DROP POLICY IF EXISTS "Admins and authorities can insert AI feedback" ON ai_feedback;

-- Admins can view all feedback
CREATE POLICY "Admins can view AI feedback"
ON ai_feedback FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'admin'
    )
);

-- Admins and authorities can insert feedback
CREATE POLICY "Admins and authorities can insert AI feedback"
ON ai_feedback FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role IN ('admin', 'authority')
    )
);

-- ==========================================
-- PHASE 2: Dynamic SLA & Engagement
-- ==========================================

-- Add SLA prediction and engagement columns
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS predicted_resolution_days NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS actual_resolution_days NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS engagement_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private'));

-- Create engagement table
CREATE TABLE IF NOT EXISTS complaint_engagement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL CHECK (action_type IN ('like', 'comment')),
    comment_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(complaint_id, user_id, action_type)  -- One like per user per complaint (but unique constraint will allow updating)
);

-- Enable RLS on engagement
ALTER TABLE complaint_engagement ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view public complaint engagement" ON complaint_engagement;
DROP POLICY IF EXISTS "Users can create engagements" ON complaint_engagement;
DROP POLICY IF EXISTS "Users can delete their own likes" ON complaint_engagement;

-- Users can view engagement on public complaints
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

-- Users can create engagements
CREATE POLICY "Users can create engagements"
ON complaint_engagement FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete their own likes"
ON complaint_engagement FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND action_type = 'like');

-- ==========================================
-- INDEXES for Performance
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_ai_feedback_complaint_id ON ai_feedback(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaints_requires_review ON complaints(requires_review) WHERE requires_review = true;
CREATE INDEX IF NOT EXISTS idx_engagement_complaint_id ON complaint_engagement(complaint_id);
CREATE INDEX IF NOT EXISTS idx_engagement_user_id ON complaint_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_action_type ON complaint_engagement(action_type);
CREATE INDEX IF NOT EXISTS idx_complaints_visibility ON complaints(visibility);
