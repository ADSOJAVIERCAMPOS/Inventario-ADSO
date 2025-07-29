// components/Header.tsx
"use client"; // Es un componente de cliente porque tiene interacción

import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function Header({ user }: { user: any | null }) {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login'); // Redirige al login después de cerrar sesión
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <Link href="/">
        <div className="text-2xl font-bold cursor-pointer">Inventario ADSO</div>
      </Link>
      <nav>
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Bienvenido, {user.email}</span>
            <Link href="/dashboard">
              <div className="hover:text-gray-400 cursor-pointer">Dashboard</div>
            </Link>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Cerrar Sesión
            </button>
          </div>
        ) : (
          <Link href="/login">
            <div className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
              Iniciar Sesión
            </div>
          </Link>
        )}
      </nav>
    </header>
  );
}