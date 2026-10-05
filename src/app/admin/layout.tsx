'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { useAuth } from '@/context/AuthContext';
import s from './layout.module.css';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, role } = useAuth();
  const router = useRouter();

  // La ruta /admin requiere una sesión autenticada con rol Admin.
  // Esto evita que un usuario normal pueda entrar escribiendo /admin.
  const allowed = isAuthenticated && role?.trim().toLowerCase() === 'admin';

  useEffect(() => {
    if (!loading && !allowed) {
      router.replace('/');
    }
  }, [loading, allowed, router]);

  // Mientras AuthContext verifica la sesión, no mostramos el dashboard.
  if (loading) {
    return (
      <div className={`rn-view ${s.loadingContainer}`}>
        <span className="rn-spinner" />
      </div>
    );
  }

  // Equivale a <Redirect href="/" />: no renderiza nada mientras redirige.
  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
