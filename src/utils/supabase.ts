import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

/**
 * Supabase Client (Direct Connection)
 * Used for high-performance data fetching and real-time operational updates.
 * Optimized for Gravity PWA architecture.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Type-safe Database Wrapper
 * Use these for direct Server Actions or Fetch implementations.
 */
export const db = {
  products: () => supabase.from('products'),
  sales: () => supabase.from('sales'),
  customers: () => supabase.from('customers'),
  settings: () => supabase.from('settings'),
};
