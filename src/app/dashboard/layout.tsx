// app/dashboard/layout.tsx
// Este archivo define el layout para todas las rutas dentro de /dashboard

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
// Ajusta la ruta de importación según la ubicación real del componente LogoutButton
// Ajusta la ruta de importación según la ubicación real del componente LogoutButton
// import LogoutButton from '@/components/LogoutButton'; // Importa el componente del botón de logout
// Asegúrate de que la ruta sea correcta; por ejemplo, si LogoutButton está en 'src/components/LogoutButton.tsx':
import LogoutButton from '../../components/LogoutButton'; // Ajusta la ruta según tu estructura de carpetas

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Si no hay sesión, redirige al usuario a la página de login
  if (!session) {
    redirect('/login');
  }

  // Opcional: Obtener el rol del usuario desde nuestra tabla `users_custom_data`
  // Esto es útil para mostrar elementos de la UI o proteger rutas según el rol
  const { data: userData } = await supabase
    .from('users_custom_data')
    .select('rol')
    .eq('id', session.user.id)
    .single();

  const userRole = userData?.rol || 'usuario'; // Asigna 'usuario' si no se encuentra un rol

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Barra lateral de navegación */}
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-6">Inventario App</h2>
        <nav className="flex-grow">
          <ul>
            <li className="mb-2">
              <Link href="/dashboard/elementos" className="block py-2 px-4 rounded hover:bg-gray-700">
                Elementos
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/dashboard/elementos/nuevo" className="block py-2 px-4 rounded hover:bg-gray-700">
                Añadir Elemento
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/dashboard/reportes" className="block py-2 px-4 rounded hover:bg-gray-700">
                Reportes
              </Link>
            </li>
            {/* Ejemplo: Mostrar enlaces solo para el rol de 'admin' */}
            {userRole === 'admin' && (
              <li className="mb-2">
                <Link href="/dashboard/admin" className="block py-2 px-4 rounded hover:bg-gray-700">
                  Panel Administrador
                </Link>
              </li>
            )}
          </ul>
        </nav>
        {/* Información del usuario y botón de logout al final de la barra lateral */}
        <div className="mt-auto pt-6 border-t border-gray-700">
            <p className="text-sm">Usuario: {session.user.email}</p>
            <p className="text-sm">Rol: {userRole}</p>
            <LogoutButton /> {/* Usa el componente de cliente para el logout */}
        </div>
      </aside>
      {/* Contenido principal del dashboard */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children} {/* Aquí se renderizará el contenido de cada página dentro de /dashboard */}
      </main>
    </div>
  );
}