-- Migration: v25_payment_history_hardening
-- Description: Hardens the payments table to support recurring billing history and invoice tracking.

-- 1. Add stripe_invoice_id for tracking individual renewal events
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT;

-- 2. Modify unique constraints to support history
-- We want to allow multiple records for the same subscription (renewals), 
-- but ensure each invoice or session is only processed once.
DROP INDEX IF EXISTS payments_stripe_subscription_id_idx;
CREATE INDEX IF NOT EXISTS payments_stripe_subscription_id_idx ON public.payments (stripe_subscription_id);

CREATE UNIQUE INDEX IF NOT EXISTS payments_stripe_invoice_id_idx ON public.payments (stripe_invoice_id);

-- 3. Verification Comments
COMMENT ON COLUMN public.payments.stripe_invoice_id IS 'Unique identifier for the Stripe invoice (used for renewals)';
COMMENT ON TABLE public.payments IS 'History of all payments and subscription events handled via Stripe.';
