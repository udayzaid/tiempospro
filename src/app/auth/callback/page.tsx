'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { exchangeCodeForTokens } from '@/components/auth/authService';
import { SiteFooter } from '@/components/live/SiteFooter';
import { useAuth } from '@/context/AuthContext';
import s from './page.module.css';

// Las imágenes viven en public/imagenes/ (se agregan después; el tamaño ya está reservado).
const BUILDING_LOGO = '/imagenes/logo%202.1.png';
const BRAND_LOGO = '/imagenes/logo%201%20(1).png';

function extractRole(profile: any): string {
  const directRole = profile?.rol ?? profile?.role ?? profile?.Rol ?? profile?.Role;

  if (typeof directRole === 'string') {
    return directRole.trim();
  }

  if (Array.isArray(directRole)) {
    const stringRole = directRole.find((value) => typeof value === 'string');

    if (typeof stringRole === 'string') {
      return stringRole.trim();
    }

    const roleObject = directRole.find((value) => value !== null && typeof value === 'object');

    if (roleObject) {
      const objectRole = roleObject.role ?? roleObject.Role ?? roleObject.name ?? roleObject.Name;

      if (typeof objectRole === 'string') {
        return objectRole.trim();
      }
    }
  }

  const roles = profile?.roles ?? profile?.Roles;

  if (typeof roles === 'string') {
    return roles.trim();
  }

  if (Array.isArray(roles)) {
    const stringRole = roles.find((value) => typeof value === 'string');

    if (typeof stringRole === 'string') {
      return stringRole.trim();
    }

    const roleObject = roles.find((value) => value !== null && typeof value === 'object');

    if (roleObject) {
      const objectRole = roleObject.role ?? roleObject.Role ?? roleObject.name ?? roleObject.Name;

      if (typeof objectRole === 'string') {
        return objectRole.trim();
      }
    }
  }

  return '';
}

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processCallback() {
      if (typeof window === 'undefined') {
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const errorParam = urlParams.get('error');

      if (errorParam) {
        setError(`Error de autenticación: ${errorParam}`);
        return;
      }

      if (!code || !state) {
        setError('Faltan parámetros de respuesta en la URL (code/state).');
        return;
      }

      const savedState = sessionStorage.getItem('oauth_state');

      if (!savedState || state !== savedState) {
        setError('Validación de seguridad fallida (State mismatch).');
        return;
      }

      const codeVerifier = sessionStorage.getItem('pkce_code_verifier');

      if (!codeVerifier) {
        setError('La sesión de inicio expiró. Intenta iniciar sesión nuevamente.');
        return;
      }

      const processingKey = 'oauth_processing_code';
      const processingCode = sessionStorage.getItem(processingKey);

      if (processingCode === code) {
        console.info('[OAuth] Callback duplicado ignorado para el mismo code.');
        return;
      }

      sessionStorage.setItem(processingKey, code);

      try {
        await exchangeCodeForTokens(code, codeVerifier);

        console.info('[OAuth] Exchange completado correctamente.');

        sessionStorage.removeItem('pkce_code_verifier');
        sessionStorage.removeItem('oauth_state');
        sessionStorage.removeItem(processingKey);

        const profile = await refreshProfile();

        if (!profile) {
          throw new Error('No se pudo verificar el perfil autenticado.');
        }

        const role = extractRole(profile);

        console.info('[OAuth] Rol detectado:', role);

        // Después de autenticarse, todos vuelven a la página pública.
        // El botón Administrar del header llevará al dashboard cuando corresponda.
        console.info('[OAuth] Autenticación completada → página principal');
        router.replace('/');
      } catch (err: any) {
        console.error('[OAuth] Error al completar autenticación:', err);
        setError(err?.message || 'Error al completar el inicio de sesión.');
      }
    }

    processCallback();
  }, [router, refreshProfile]);

  return (
    <div className={`rn-view ${s.screen}`}>
      {/* HEADER DE AUTENTICACIÓN */}
      <header className={`rn-view ${s.header}`}>
        <div className={`rn-view ${s.headerInner}`}>
          <div className={`rn-view ${s.buildingFrame}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BUILDING_LOGO} alt="" className={s.buildingLogo} />
          </div>

          <div className={`rn-view ${s.brandFrame}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BRAND_LOGO} alt="Los Tiempos" className={s.logo} />
          </div>
        </div>

        <div className={`rn-view ${s.goldBar}`}>
          <span className={`rn-text ${s.goldBarText}`}>LOS TIEMPOS · AUTENTICACIÓN</span>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className={`rn-view ${s.content}`}>
        <div className={`rn-view ${s.authCard}`}>
          <div className={`rn-view ${s.cardAccent}`} />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BRAND_LOGO} alt="" className={s.cardLogo} />

          {error ? (
            <>
              <div className={`rn-view ${s.statusIconError}`}>
                <span className={`rn-text ${s.statusIconText}`}>!</span>
              </div>

              <span className={`rn-text ${s.title}`}>No se pudo iniciar sesión</span>

              <span className={`rn-text ${s.description}`}>{error}</span>

              <button type="button" className={`rn-pressable ${s.retryButton}`} onClick={() => router.replace('/')}>
                <span className={`rn-text ${s.retryText}`}>Volver al inicio</span>
              </button>
            </>
          ) : (
            <>
              <div className={`rn-view ${s.statusIcon}`}>
                <span className="rn-spinner" />
              </div>

              <span className={`rn-text ${s.title}`}>Iniciar sesión</span>

              <span className={`rn-text ${s.description}`}>
                Estamos verificando tu sesión y preparando tu cuenta.
              </span>

              <span className={`rn-text ${s.subDescription}`}>Un momento, por favor...</span>
            </>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <SiteFooter />
    </div>
  );
}
