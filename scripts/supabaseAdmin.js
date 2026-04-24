import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables del .env.local
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('ERROR: Faltan variables VITE_SUPABASE_URL o SUPABASE_SECRET_KEY en .env.local');
  process.exit(1);
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});