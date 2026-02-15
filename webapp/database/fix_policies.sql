-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own complaints" ON complaints;
DROP POLICY IF EXISTS "Authority can update complaints in their department" ON complaints;

-- Recreate policies with cleaner logic
CREATE POLICY "Users can view their own complaints"
    ON complaints FOR SELECT
    USING (
        user_id = auth.uid()
    );

CREATE POLICY "Admins can view all complaints"
    ON complaints FOR SELECT
    USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Authorities can view department complaints"
    ON complaints FOR SELECT
    USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'authority' 
        AND 
        route_to = (SELECT department FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Authority can update complaints in their department"
    ON complaints FOR UPDATE
    USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin' OR
        ((SELECT role FROM users WHERE id = auth.uid()) = 'authority' AND route_to = (SELECT department FROM users WHERE id = auth.uid()))
    );
