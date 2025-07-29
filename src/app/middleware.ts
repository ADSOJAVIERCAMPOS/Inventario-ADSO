// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'; // Requiere @supabase/auth-helpers-nextjs

// Instala esta dependencia:
// npm install @supabase/auth-helpers-nextjs

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  // and will also ensure that Auth Helper updates the cookies
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const publicPaths = ['/login', '/register', '/']; // Rutas accesibles sin autenticación

  // Si el usuario no está autenticado y está intentando acceder a una ruta protegida
  if (!session && !publicPaths.includes(req.nextUrl.pathname)) {
    // Redirige al login
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Si el usuario está autenticado y está en la página de login/registro, redirige al dashboard
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/dashboard/elementos';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any public assets (e.g. /public/*)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

