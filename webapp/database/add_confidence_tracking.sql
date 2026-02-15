-- Add confidence tracking and review flags to complaints table
ALTER TABLE complaints 
ADD COLUMN ai_confidence JSONB,
ADD COLUMN requires_review BOOLEAN DEFAULT false;

-- Create feedback table for continuous learning
CREATE TABLE IF NOT EXISTS ai_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    original_text TEXT NOT NULL,
    ai_prediction JSONB NOT NULL,
    human_correction JSONB,
    corrected_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS policies for ai_feedback table
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;

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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_feedback_complaint_id ON ai_feedback(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaints_requires_review ON complaints(requires_review) WHERE requires_review = true;
