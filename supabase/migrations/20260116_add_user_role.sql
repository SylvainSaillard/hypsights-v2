-- Migration: Add user_role to users_metadata
-- Run this in Supabase SQL Editor

-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

-- Add role column to users_metadata
ALTER TABLE public.users_metadata 
ADD COLUMN role public.user_role NOT NULL DEFAULT 'user';

-- Create index for role lookups
CREATE INDEX idx_users_metadata_role ON public.users_metadata USING btree (role);

-- Add comment
COMMENT ON COLUMN public.users_metadata.role IS 'User role: user (default) or admin';

-- To make a user admin, run:
-- UPDATE public.users_metadata SET role = 'admin' WHERE user_id = 'USER_UUID_HERE';
