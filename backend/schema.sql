-- ====================================================================
-- Multi-Tenant User Management Platform: Supabase Clients Table Schema
-- ====================================================================
-- Run this SQL in your Supabase SQL Editor to initialize the `clients` table.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT NOT NULL UNIQUE,
    client_secret_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- Indices for rapid tenant lookups
CREATE INDEX IF NOT EXISTS idx_clients_client_id ON public.clients (client_id);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON public.clients (is_active);

COMMENT ON TABLE public.clients IS 'Registered API clients/tenants with bcrypt-hashed credentials';
