'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';

import {
  getProfile,
  logout as logoutService,
} from '../components/auth/authService';

type Profile = {
  email?: string;
  name?: string;
  userName?: string;
  rol?: string | string[];
  role?: string | string[];
  [key: string]: any;
};

type AuthContextType = {
  profile: Profile | null;
  isAuthenticated: boolean;
  loading: boolean;
  role: string | null;
  refreshProfile: () => Promise<Profile | null>;
  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

function extractRole(profile: Profile | null): string | null {
  if (!profile) {
    return null;
  }

  const roleValue =
    profile.rol ??
    profile.role ??
    (profile as any).Rol ??
    (profile as any).Role;

  if (Array.isArray(roleValue)) {
    return roleValue.length > 0
      ? String(roleValue[0])
      : null;
  }

  if (
    typeof roleValue === 'object' &&
    roleValue !== null
  ) {
    const values = Object.values(roleValue);

    if (values.length > 0) {
      return String(values[0]);
    }
  }

  if (typeof roleValue === 'string') {
    return roleValue;
  }

  return null;
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] =
    useState(true);

  // Evita que el chequeo inicial y el callback OAuth hagan dos
  // solicitudes simultáneas a /api/Profile.
  const refreshPromiseRef =
    useRef<Promise<Profile | null> | null>(null);

  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    if (refreshPromiseRef.current) {
      console.info('[Auth] Reutilizando comprobación de perfil en curso.');
      return refreshPromiseRef.current;
    }

    const request = (async (): Promise<Profile | null> => {
      setLoading(true);

      try {
        const response = await getProfile();

        if (response.status === 401) {
          console.info(
            '[Auth] No existe una sesión autenticada.'
          );
          setProfile(null);
          return null;
        }

        if (!response.ok) {
          console.error(
            '[Auth] Error obteniendo perfil:',
            response.status,
            response.statusText
          );
          setProfile(null);
          return null;
        }

        const data = await response.json() as Profile;

        console.info('[Auth] Perfil autenticado:', data);
        setProfile(data);
        return data;
      } catch (error) {
        console.error(
          '[Auth] Error actualizando perfil:',
          error
        );

        setProfile(null);
        return null;
      } finally {
        setLoading(false);
        refreshPromiseRef.current = null;
      }
    })();

    refreshPromiseRef.current = request;
    return request;
  }, []);

  const logout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error(
        '[Auth] Error al cerrar sesión:',
        error
      );
    } finally {
      setProfile(null);
      setLoading(false);

      console.info('[Auth] Sesión local cerrada.');
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const role = extractRole(profile);

  return (
    <AuthContext.Provider
      value={{
        profile,
        isAuthenticated: !!profile,
        loading,
        role,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth debe utilizarse dentro de un AuthProvider'
    );
  }

  return context;
}