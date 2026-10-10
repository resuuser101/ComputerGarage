-- ==============================================================================
-- COMPUTER GARAGE: Comprehensive Row-Level Security (RLS) & Access Control Fix
-- Target: Fixes Broken Access Control (BAC) and unauthorized catalog tampering
-- Run this script in the Supabase Dashboard SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Helper function to check if the current user has the 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;


-- ==============================================================================
-- 2. PRODUCTS TABLE: Enforce Strict Read/Write Access Controls
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop all existing overly-permissive policies on products
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.products;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.products;
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Allow public read access on products" ON public.products;
DROP POLICY IF EXISTS "Allow admin insert on products" ON public.products;
DROP POLICY IF EXISTS "Allow admin update on products" ON public.products;
DROP POLICY IF EXISTS "Allow admin delete on products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

-- Allow EVERYONE (public, anon, authenticated) to view products
CREATE POLICY "Allow public read access on products"
ON public.products
FOR SELECT
USING (true);

-- Allow ONLY verified admins to INSERT new products
CREATE POLICY "Allow admin insert on products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Allow ONLY verified admins to UPDATE products
CREATE POLICY "Allow admin update on products"
ON public.products
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Allow ONLY verified admins to DELETE products
CREATE POLICY "Allow admin delete on products"
ON public.products
FOR DELETE
TO authenticated
USING (public.is_admin());


-- ==============================================================================
-- 3. USER_OTPS TABLE: Completely Isolate 2FA OTP Codes
-- Prevent any client-side read/write/tampering via the Supabase REST API
-- ==============================================================================
ALTER TABLE public.user_otps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.user_otps;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.user_otps;
DROP POLICY IF EXISTS "Allow authenticated read" ON public.user_otps;
DROP POLICY IF EXISTS "Deny all client access on user_otps" ON public.user_otps;

-- Deny all client access. Only the backend Service Role Key can manage OTPs.
CREATE POLICY "Deny all client access on user_otps"
ON public.user_otps
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);


-- ==============================================================================
-- 4. ORDERS & ORDER_ITEMS TABLES: Prevent IDOR & Unauthorized Access
-- ==============================================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to view own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow users to insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admin to manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Allow users to view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow users to insert own order items" ON public.order_items;

-- Customers can only view their own orders; Admins can view all orders
CREATE POLICY "Allow users to view own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- Customers can only insert orders for their own account
CREATE POLICY "Allow users to insert own orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admins can update order status (e.g. shipping/fulfillment)
CREATE POLICY "Allow admin to manage all orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Order Items: Viewable if the parent order belongs to the user or if user is admin
CREATE POLICY "Allow users to view own order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR public.is_admin())
  )
);

-- Order Items: Insertable during checkout for user's own orders
CREATE POLICY "Allow users to insert own order items"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);


-- ==============================================================================
-- 5. PROFILES TABLE: Prevent Privilege Escalation
-- Prevent users from updating their own role column to 'admin'
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;

-- Allow authenticated users to view profiles (needed for seller listing and current user info)
CREATE POLICY "Allow users to view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Users can only update their own profile
CREATE POLICY "Allow users to update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  -- Non-admins cannot alter their role to 'admin'
  AND (
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    OR public.is_admin()
  )
);

-- ==============================================================================
-- 6. SECURITY_LOGS: Lock Down Logs
-- ==============================================================================
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admin read security logs" ON public.security_logs;
DROP POLICY IF EXISTS "Deny client insert on security logs" ON public.security_logs;

-- Only admins can read security logs; inserts are performed server-side via service role
CREATE POLICY "Allow admin read security logs"
ON public.security_logs
FOR SELECT
TO authenticated
USING (public.is_admin());
