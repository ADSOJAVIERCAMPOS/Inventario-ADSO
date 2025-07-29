// components/LogoutButton.tsx
// Este es un componente de cliente para manejar el cierre de sesión

"use client"; // Marca este archivo como un Client Component

import { supabase } from '@/lib/supabase'; // Importa la instancia de Supabase
import { useRouter } from 'next/navigation'; // Hook para la navegación
import { useState } from 'react'; // Para manejar el estado de carga

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut(); // Llama al método de Supabase para cerrar sesión
    if (error) {
      console.error('Error al cerrar sesión:', error.message);
      setLoading(false);
    } else {
      // Si el cierre de sesión es exitoso, redirige al usuario a la página de login
      router.push('/login');
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading} // Deshabilita el botón mientras se procesa el logout
      className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
    >
      {loading ? 'Cerrando...' : 'Cerrar Sesión'}
    </button>
  );
}