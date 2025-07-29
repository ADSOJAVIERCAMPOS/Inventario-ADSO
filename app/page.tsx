// app/page.tsx
import { createClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export default async function IndexPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Si no hay usuario logueado, redirige a la página de login
    redirect('/login');
  }

  // Si hay usuario logueado, muestra un mensaje de bienvenida o redirige al dashboard
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">¡Bienvenido a tu Inventario, {user.email}!</h1>
      <p className="text-lg">Accede a tus herramientas de gestión desde el menú.</p>
      {/* Aquí podrías añadir un enlace o un botón para ir al dashboard */}
    </div>
  );
}