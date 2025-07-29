// app/dashboard/elementos/page.tsx
// Este archivo es una página de cliente que muestra la lista de elementos y maneja las operaciones

"use client"; // Marca este archivo como un Client Component

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // Importa la instancia de Supabase
import Link from 'next/link'; // Para la navegación entre rutas de Next.js

interface Elemento {
  id: string;
  regional: string;
  placa: string;
  stock_fisico: number;
  estado: string; // 'activo' o 'desactivado'
  deleted_at: string | null; // Será null si el elemento no está "soft-deleted"
  // ... otras propiedades del elemento si las necesitas en la interfaz
}

export default function ElementosPage() {
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Función para obtener los elementos de la base de datos
  const fetchElementos = async () => {
    setLoading(true);
    setError(null);
    try {
      // Supabase por defecto ignora los registros con `deleted_at` no nulo
      // Para listar solo los activos (según tu columna `estado` y `deleted_at`):
      const { data, error: dbError } = await supabase
        .from('elementos')
        .select('*') // Selecciona todas las columnas
        .eq('estado', 'activo') // Filtra para mostrar solo los que tienen estado 'activo'
        .is('deleted_at', null) // Asegúrate de que no estén soft-deleted
        .ilike('placa', `%${searchTerm}%`); // Aplica el filtro de búsqueda por placa (insensible a mayúsculas/minúsculas)

      if (dbError) throw dbError; // Si hay un error de la base de datos, lánzalo
      setElementos(data as Elemento[]); // Actualiza el estado con los datos obtenidos
    } catch (err: any) {
      setError(err.message || 'Error al cargar los elementos.'); // Captura y muestra errores
      console.error('Error al cargar elementos:', err);
    } finally {
      setLoading(false); // Finaliza el estado de carga
    }
  };

  // useEffect para cargar los elementos cuando el componente se monta o cuando cambia el término de búsqueda
  useEffect(() => {
    fetchElementos();
  }, [searchTerm]); // La dependencia `searchTerm` hace que la búsqueda se ejecute al cambiar el texto

  // Función para manejar la desactivación/activación de un elemento
  const handleDeactivateActivate = async (id: string, currentStatus: string) => {
    setLoading(true);
    setError(null);
    try {
      let newState = '';
      let movimientoTipo = '';
      let observaciones = '';
      let newDeletedAt: string | null = null;

      if (currentStatus === 'activo') {
        newState = 'desactivado';
        movimientoTipo = 'desactivacion';
        observaciones = 'Elemento desactivado por el usuario.';
        newDeletedAt = new Date().toISOString(); // Establece la fecha actual para `deleted_at`
      } else {
        newState = 'activo';
        movimientoTipo = 'activacion';
        observaciones = 'Elemento activado por el usuario.';
        newDeletedAt = null; // Elimina la marca de soft delete
      }

      // 1. Actualiza el estado del elemento en la tabla `elementos`
      const { error: updateError } = await supabase
        .from('elementos')
        .update({ estado: newState, deleted_at: newDeletedAt })
        .eq('id', id);

      if (updateError) throw updateError;

      // 2. Registra el movimiento en la tabla `movimientos_inventario`
      // Primero, obtenemos el `stock_fisico` actual del elemento para el registro del movimiento
      const { data: elementoData, error: elementoError } = await supabase
        .from('elementos')
        .select('stock_fisico')
        .eq('id', id)
        .single(); // `.single()` para obtener un solo resultado

      if (elementoError) throw elementoError;
      const stockFisico = elementoData?.stock_fisico || 0; // Usa 0 si no se encuentra el stock

      // Obtiene el ID del usuario autenticado para registrar quién hizo el movimiento
      const { data: userSessionData } = await supabase.auth.getSession();
      const userId = userSessionData.session?.user.id; // ID del usuario autenticado

      if (!userId) {
        throw new Error('Usuario no autenticado. No se puede registrar el movimiento.');
      }

      const { error: movimientoError } = await supabase.from('movimientos_inventario').insert({
        elemento_id: id,
        tipo_movimiento: movimientoTipo,
        cantidad: stockFisico, // Se registra el stock físico del elemento al momento del movimiento
        usuario_id: userId,
        observaciones: observaciones,
      });

      if (movimientoError) throw movimientoError;

      fetchElementos(); // Refresca la lista de elementos para reflejar los cambios
    } catch (err: any) {
      setError(err.message || 'Error al cambiar el estado del elemento.');
      console.error('Error al desactivar/activar:', err);
    } finally {
      setLoading(false);
    }
  };

  // Muestra un estado de carga mientras se obtienen los datos
  if (loading) return <p>Cargando elementos...</p>;
  // Muestra un mensaje de error si algo sale mal
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Gestión de Elementos</h1>

      {/* Campo de búsqueda por placa */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por número de placa..."
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Botón para añadir un nuevo elemento */}
      <Link href="/dashboard/elementos/nuevo" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block">
        Añadir Nuevo Elemento
      </Link>

      {/* Tabla para mostrar los elementos */}
      {elementos.length === 0 ? (
        <p>No hay elementos activos para mostrar con los criterios actuales.</p>
      ) : (
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 text-left">Placa</th>
              <th className="py-2 px-4 text-left">Regional</th>
              <th className="py-2 px-4 text-left">Stock Físico</th>
              <th className="py-2 px-4 text-left">Estado</th>
              <th className="py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {elementos.map((elemento) => (
              <tr key={elemento.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-2 px-4">{elemento.placa}</td>
                <td className="py-2 px-4">{elemento.regional}</td>
                <td className="py-2 px-4">{elemento.stock_fisico}</td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    elemento.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {elemento.estado}
                  </span>
                </td>
                <td className="py-2 px-4 flex space-x-2">
                  {/* Enlace para editar el elemento */}
                  <Link href={`/dashboard/elementos/${elemento.id}`} className="bg-blue-500 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded">
                    Editar
                  </Link>
                  {/* Botón para desactivar/activar el elemento */}
                  <button
                    onClick={() => handleDeactivateActivate(elemento.id, elemento.estado)}
                    className={`text-white text-sm py-1 px-3 rounded ${
                      elemento.estado === 'activo' ? 'bg-orange-500 hover:bg-orange-700' : 'bg-purple-500 hover:bg-purple-700'
                    }`}
                  >
                    {elemento.estado === 'activo' ? 'Desactivar' : 'Activar'}
                  </button>
                  {/* Enlace para ver el historial de movimientos del elemento */}
                  <Link href={`/dashboard/elementos/${elemento.id}/historial`} className="bg-gray-500 hover:bg-gray-700 text-white text-sm py-1 px-3 rounded">
                    Historial
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}