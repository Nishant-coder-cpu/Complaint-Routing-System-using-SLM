-- Supabase Database Schema for Grievance Redressal System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('complainant', 'authority', 'admin');
CREATE TYPE complaint_status AS ENUM ('pending', 'in_progress', 'resolved');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    role user_role NOT NULL DEFAULT 'complainant',
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Complaints table
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_text TEXT NOT NULL,
    categories TEXT[] NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('Critical', 'High', 'Normal')),
    anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    anonymous_recommended BOOLEAN NOT NULL DEFAULT FALSE,
    escalation_required BOOLEAN NOT NULL DEFAULT FALSE,
    route_to TEXT NOT NULL,
    status complaint_status NOT NULL DEFAULT 'pending',
    sla_hours INTEGER NOT NULL,
    sla_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Actions log table
CREATE TABLE actions_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_route_to ON complaints(route_to);
CREATE INDEX idx_complaints_severity ON complaints(severity);
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX idx_actions_log_complaint_id ON actions_log(complaint_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions_log ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data"
    ON users FOR SELECT
    USING (auth.uid() = id);

-- Complaints policies
CREATE POLICY "Anyone can create complaints"
    ON complaints FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view their own complaints"
    ON complaints FOR SELECT
    USING (
        user_id = auth.uid() OR
        anonymous = true OR
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin' OR
        (SELECT role FROM users WHERE id = auth.uid()) = 'authority' AND route_to = (SELECT department FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Authority can update complaints in their department"
    ON complaints FOR UPDATE
    USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin' OR
        ((SELECT role FROM users WHERE id = auth.uid()) = 'authority' AND route_to = (SELECT department FROM users WHERE id = auth.uid()))
    );

-- Actions log policies
CREATE POLICY "Users can view actions for their complaints"
    ON actions_log FOR SELECT
    USING (
        complaint_id IN (SELECT id FROM complaints WHERE user_id = auth.uid()) OR
        (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'authority')
    );

CREATE POLICY "Authority and admin can create action logs"
    ON actions_log FOR INSERT
    WITH CHECK (
        (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'authority')
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for complaints updated_at
CREATE TRIGGER update_complaints_updated_at
    BEFORE UPDATE ON complaints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
