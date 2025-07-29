// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente para uso en el servidor (ej. Server Components, API Routes)
// Si necesitas autenticación de servicio o bypass RLS (con extrema precaución)
// export const supabaseServiceRole = createClient(
//   supabaseUrl,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );