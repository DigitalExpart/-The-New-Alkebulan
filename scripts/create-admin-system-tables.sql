-- Admin System Database Tables
-- This script creates all tables needed for comprehensive admin dashboard functionality

-- ============================================================================
-- ADMIN USER MANAGEMENT TABLES
-- ============================================================================

-- Admin actions log (track all admin actions)
CREATE TABLE IF NOT EXISTS public.admin_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'user_suspend', 'user_activate', 'role_change', etc.
    target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_resource_type VARCHAR(50), -- 'user', 'post', 'product', 'community', etc.
    target_resource_id UUID,
    action_details JSONB DEFAULT '{}', -- Store additional action data
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User moderation actions
CREATE TABLE IF NOT EXISTS public.user_moderation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    moderation_type VARCHAR(50) NOT NULL, -- 'warning', 'suspension', 'ban', 'restriction'
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'appealed')),
    reason TEXT NOT NULL,
    duration_days INTEGER, -- NULL for permanent, number for temporary
    moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- User reports (users reporting other users/content)
CREATE TABLE IF NOT EXISTS public.user_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_content_type VARCHAR(50), -- 'post', 'comment', 'message', 'profile'
    reported_content_id UUID,
    report_type VARCHAR(50) NOT NULL, -- 'spam', 'harassment', 'inappropriate', 'fake'
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- ADMIN COMMERCE MANAGEMENT TABLES  
-- ============================================================================

-- Product moderation queue
CREATE TABLE IF NOT EXISTS public.product_moderation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL, -- References products table
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    moderation_status VARCHAR(50) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
    rejection_reason TEXT,
    moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    flagged_reasons TEXT[], -- Array of reasons like ['inappropriate_content', 'pricing_issue']
    admin_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    auto_approved BOOLEAN DEFAULT false
);

-- Transaction monitoring
CREATE TABLE IF NOT EXISTS public.transaction_monitoring (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id VARCHAR(255) UNIQUE NOT NULL, -- External payment system ID
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id UUID,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'refund', 'payout', 'fee'
    status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'failed', 'disputed'
    payment_method VARCHAR(50), -- 'stripe', 'paypal', 'crypto', etc.
    flagged BOOLEAN DEFAULT false,
    flag_reason TEXT,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seller verification
CREATE TABLE IF NOT EXISTS public.seller_verification (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
    business_documents JSONB DEFAULT '{}', -- Store document URLs and metadata
    identity_verified BOOLEAN DEFAULT false,
    business_verified BOOLEAN DEFAULT false,
    tax_info_verified BOOLEAN DEFAULT false,
    verification_notes TEXT,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT
);

-- ============================================================================
-- ADMIN CONTENT MANAGEMENT TABLES
-- ============================================================================

-- Content moderation queue
CREATE TABLE IF NOT EXISTS public.content_moderation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL, -- 'post', 'comment', 'community', 'message'
    content_id UUID NOT NULL,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    moderation_status VARCHAR(50) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged', 'hidden')),
    flag_reasons TEXT[], -- Array of reasons
    content_preview TEXT, -- First 200 chars of content
    media_urls TEXT[], -- Associated media URLs
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    auto_flagged BOOLEAN DEFAULT false,
    auto_flag_confidence DECIMAL(3,2), -- 0.00 to 1.00 confidence score
    moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    moderation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Community moderation
CREATE TABLE IF NOT EXISTS public.community_moderation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID NOT NULL, -- References communities table
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    moderation_type VARCHAR(50) NOT NULL, -- 'approval', 'review', 'suspension'
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    reason TEXT,
    moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Content analytics for admins
CREATE TABLE IF NOT EXISTS public.content_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,
    content_id UUID NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- 'views', 'likes', 'shares', 'reports', 'engagement'
    metric_value INTEGER DEFAULT 0,
    date_recorded DATE DEFAULT CURRENT_DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(content_type, content_id, metric_type, date_recorded)
);

-- ============================================================================
-- ADMIN PLATFORM SETTINGS TABLES
-- ============================================================================

-- Platform settings and feature flags
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    setting_type VARCHAR(50) NOT NULL, -- 'boolean', 'string', 'number', 'object', 'array'
    category VARCHAR(50) NOT NULL, -- 'features', 'security', 'ui', 'commerce', 'content'
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- Whether setting is visible to non-admins
    requires_restart BOOLEAN DEFAULT false,
    last_modified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin notifications and alerts
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    notification_type VARCHAR(50) NOT NULL, -- 'user_report', 'content_flag', 'transaction_alert', 'system_error'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'dismissed', 'archived')),
    related_resource_type VARCHAR(50), -- 'user', 'post', 'product', 'transaction'
    related_resource_id UUID,
    assigned_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE
);

-- System audit logs
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL, -- 'user_login', 'admin_action', 'system_error', 'security_event'
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    event_data JSONB DEFAULT '{}',
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ADMIN-ONLY POLICIES (Only admins can access these tables)
-- ============================================================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND (
            is_admin = true OR 
            role = 'admin' OR 
            selected_roles @> '["admin"]'::jsonb
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin Actions Policies
CREATE POLICY "Admins can view all admin actions" ON public.admin_actions
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can create admin actions" ON public.admin_actions
    FOR INSERT WITH CHECK (public.is_admin() AND auth.uid() = admin_user_id);

-- User Moderation Policies
CREATE POLICY "Admins can manage user moderation" ON public.user_moderation
    FOR ALL USING (public.is_admin());

-- User Reports Policies
CREATE POLICY "Users can create reports" ON public.user_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage reports" ON public.user_reports
    FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view their own reports" ON public.user_reports
    FOR SELECT USING (auth.uid() = reporter_id OR public.is_admin());

-- Product Moderation Policies
CREATE POLICY "Admins can manage product moderation" ON public.product_moderation
    FOR ALL USING (public.is_admin());

CREATE POLICY "Sellers can view their product moderation status" ON public.product_moderation
    FOR SELECT USING (auth.uid() = seller_id OR public.is_admin());

-- Transaction Monitoring Policies
CREATE POLICY "Admins can view all transactions" ON public.transaction_monitoring
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can view their own transactions" ON public.transaction_monitoring
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Seller Verification Policies
CREATE POLICY "Admins can manage seller verification" ON public.seller_verification
    FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view their own verification status" ON public.seller_verification
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update their own verification" ON public.seller_verification
    FOR UPDATE USING (auth.uid() = user_id);

-- Content Moderation Policies
CREATE POLICY "Admins can manage content moderation" ON public.content_moderation
    FOR ALL USING (public.is_admin());

-- Community Moderation Policies
CREATE POLICY "Admins can manage community moderation" ON public.community_moderation
    FOR ALL USING (public.is_admin());

-- Content Analytics Policies
CREATE POLICY "Admins can view content analytics" ON public.content_analytics
    FOR SELECT USING (public.is_admin());

-- Platform Settings Policies
CREATE POLICY "Admins can manage platform settings" ON public.platform_settings
    FOR ALL USING (public.is_admin());

CREATE POLICY "Public settings are viewable by all" ON public.platform_settings
    FOR SELECT USING (is_public = true OR public.is_admin());

-- Admin Notifications Policies
CREATE POLICY "Admins can manage admin notifications" ON public.admin_notifications
    FOR ALL USING (public.is_admin());

-- System Audit Logs Policies
CREATE POLICY "Admins can view audit logs" ON public.system_audit_logs
    FOR SELECT USING (public.is_admin());

CREATE POLICY "System can insert audit logs" ON public.system_audit_logs
    FOR INSERT WITH CHECK (true); -- Allow system to log events

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Admin Actions Indexes
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_user_id ON public.admin_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user_id ON public.admin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON public.admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON public.admin_actions(action_type);

-- User Moderation Indexes
CREATE INDEX IF NOT EXISTS idx_user_moderation_user_id ON public.user_moderation(user_id);
CREATE INDEX IF NOT EXISTS idx_user_moderation_status ON public.user_moderation(status);
CREATE INDEX IF NOT EXISTS idx_user_moderation_expires_at ON public.user_moderation(expires_at);

-- User Reports Indexes
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter_id ON public.user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_user_id ON public.user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON public.user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_priority ON public.user_reports(priority);

-- Product Moderation Indexes
CREATE INDEX IF NOT EXISTS idx_product_moderation_product_id ON public.product_moderation(product_id);
CREATE INDEX IF NOT EXISTS idx_product_moderation_status ON public.product_moderation(moderation_status);
CREATE INDEX IF NOT EXISTS idx_product_moderation_seller_id ON public.product_moderation(seller_id);

-- Transaction Monitoring Indexes
CREATE INDEX IF NOT EXISTS idx_transaction_monitoring_user_id ON public.transaction_monitoring(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_monitoring_status ON public.transaction_monitoring(status);
CREATE INDEX IF NOT EXISTS idx_transaction_monitoring_flagged ON public.transaction_monitoring(flagged);
CREATE INDEX IF NOT EXISTS idx_transaction_monitoring_created_at ON public.transaction_monitoring(created_at DESC);

-- Content Moderation Indexes
CREATE INDEX IF NOT EXISTS idx_content_moderation_content_type_id ON public.content_moderation(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_moderation_status ON public.content_moderation(moderation_status);
CREATE INDEX IF NOT EXISTS idx_content_moderation_author_id ON public.content_moderation(author_id);

-- Platform Settings Indexes
CREATE INDEX IF NOT EXISTS idx_platform_settings_category ON public.platform_settings(category);
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON public.platform_settings(setting_key);

-- Admin Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_admin_notifications_status ON public.admin_notifications(status);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_priority ON public.admin_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON public.admin_notifications(created_at DESC);

-- System Audit Logs Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.system_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.system_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.system_audit_logs(created_at DESC);

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE OR REPLACE TRIGGER update_transaction_monitoring_updated_at
    BEFORE UPDATE ON public.transaction_monitoring
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_platform_settings_updated_at
    BEFORE UPDATE ON public.platform_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default platform settings
INSERT INTO public.platform_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
('site_name', '"The New Alkebulan"', 'string', 'ui', 'Platform name displayed in header', true),
('registration_enabled', 'true', 'boolean', 'features', 'Allow new user registrations', true),
('marketplace_enabled', 'true', 'boolean', 'features', 'Enable marketplace functionality', true),
('content_moderation_enabled', 'true', 'boolean', 'content', 'Enable automatic content moderation', false),
('require_seller_verification', 'false', 'boolean', 'commerce', 'Require seller verification before selling', false),
('max_products_per_seller', '100', 'number', 'commerce', 'Maximum products per seller', false),
('auto_approve_products', 'false', 'boolean', 'commerce', 'Automatically approve new products', false),
('maintenance_mode', 'false', 'boolean', 'features', 'Enable maintenance mode', true),
('max_file_upload_size', '10485760', 'number', 'features', 'Maximum file upload size in bytes (10MB)', false),
('supported_currencies', '["USD", "EUR", "GBP", "CAD"]', 'array', 'commerce', 'Supported payment currencies', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Success message
SELECT 'Admin system tables created successfully!' as result;
