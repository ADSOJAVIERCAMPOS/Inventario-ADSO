// app/layout.tsx
import './globals.css'; // Asegúrate de que este archivo exista en la misma carpeta 'app'
import { GeistSans } from 'geist/font/sans'; // Si no tienes Geist, puedes usar otra fuente o eliminar esta línea
import { createClient } from '@/lib/supabase'; // Asegúrate de que la ruta a tu cliente supabase sea correcta
import Header from '@/components/Header'; // Asegúrate de que esta ruta sea correcta y que Header exista

export const metadata = {
  title: 'Inventario ADSO',
  description: 'Gestión de inventario de elementos',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient(); // Asume que createClient es un Server Component compatible
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="es" className={GeistSans.className}>
      <body className="bg-background text-foreground min-h-screen flex flex-col">
        <Header user={user} />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          {children}
        </main>
      </body>
    </html>
  );
}