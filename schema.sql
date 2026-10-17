-- ==============================================================================
-- Let's Cook Community — Registration & Role-Based Access Control (RBAC) Schema
-- PostgreSQL DDL with ACID Guarantees, Row-Level Security (RLS) & Audit Trails
-- ==============================================================================

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('member', 'admin');
CREATE TYPE user_status AS ENUM ('pending_review', 'approved', 'rejected', 'suspended');
CREATE TYPE squad_division AS ENUM ('ironman', 'captain', 'thor', 'core');

-- 2. Create Profiles Table (Core user registry)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    college TEXT NOT NULL,
    branch TEXT NOT NULL,
    year_of_study TEXT NOT NULL,
    target_squad squad_division NOT NULL DEFAULT 'ironman',
    skills TEXT[] DEFAULT '{}',
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    
    -- RBAC & Hierarchy
    role user_role NOT NULL DEFAULT 'member',
    role_title TEXT NOT NULL DEFAULT 'Community Member', -- 'Founder', 'President', 'Vice President', 'Secretary', 'Tech Core Head', 'PR Core Head', 'Events Core Head', 'Community Member'
    status user_status NOT NULL DEFAULT 'pending_review',
    
    -- Telemetry & Auditing
    application_notes TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indexes for fast lookup & unique enforcement
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_squad ON public.profiles(target_squad);

-- 4. Immutable Audit Logs Table
CREATE TABLE IF NOT EXISTS public.portal_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_email TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL, -- 'member_approved', 'member_rejected', 'squad_reassigned', 'admin_promoted', 'roster_exported'
    target_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.portal_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.portal_audit_logs(created_at DESC);

-- 5. Row-Level Security (RLS) Configuration
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_audit_logs ENABLE ROW LEVEL SECURITY;

-- Member Isolation Policy: A member can only read their own profile
CREATE POLICY "Members can view own profile"
    ON public.profiles
    FOR SELECT
    USING (
        auth.uid() = id 
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Member Isolation Policy: A member can update their own profile, but CANNOT alter their role or status
CREATE POLICY "Members can update own profile non-restricted fields"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
        AND status = (SELECT status FROM public.profiles WHERE id = auth.uid())
    );

-- Admin Policy: Core Heads can read all profiles and audit logs
CREATE POLICY "Admins full management access"
    ON public.profiles
    FOR ALL
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "Admins can view audit logs"
    ON public.portal_audit_logs
    FOR SELECT
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- 6. Pre-Approved Core Whitelist Seed Table (Optional database-backed whitelist)
CREATE TABLE IF NOT EXISTS public.core_head_whitelist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role_title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Core Leadership Hierarchy
INSERT INTO public.core_head_whitelist (email, role_title)
VALUES 
    ('parvmishra.connect@gmail.com', 'Founder'),
    ('founder@letscook.co.in', 'Founder'),
    ('president@letscook.co.in', 'President'),
    ('vp@letscook.co.in', 'Vice President'),
    ('sec@letscook.co.in', 'Secretary'),
    ('techhead@letscook.co.in', 'Tech Core Head'),
    ('prhead@letscook.co.in', 'PR Core Head'),
    ('eventshead@letscook.co.in', 'Events Core Head')
ON CONFLICT (email) DO NOTHING;
