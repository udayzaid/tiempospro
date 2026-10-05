'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoClose,
  IoKeyOutline,
  IoLogOutOutline,
  IoMenu,
  IoPersonAddOutline,
  IoPersonCircleOutline,
  IoPersonOutline,
  IoSaveOutline,
  IoSettingsOutline,
} from 'react-icons/io5';
import { LiveTheme } from '@/constants/live-theme';
import { useAuth } from '@/context/AuthContext';
import { useLiveHub } from '@/context/LiveHubContext';
import { Overlay } from '@/components/ui/Overlay';
import { api } from '@/services/api';
import s from './LiveHeader.module.css';

type Props = {
  headline: string;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onGoInicio?: () => void;
  onGoNoticias?: () => void;
  onGoVideos?: () => void;
  onGoEnlaces?: () => void;
};

// Las imágenes viven en public/imagenes/. Se agregan después; el tamaño (350x115) ya está reservado en CSS.
const BUILDING_LOGO = '/imagenes/logo%202.1.png';
const BRAND_LOGO = '/imagenes/logo%201%20(1).png';

const clamp1 = { '--lines': 1 } as CSSProperties;

export function LiveHeader({
  headline,
  onOpenLogin,
  onOpenRegister,
  onGoInicio,
  onGoNoticias,
  onGoVideos,
  onGoEnlaces,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { liveInfo } = useLiveHub();
  const { isAuthenticated, profile, role, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [profileVisible, setProfileVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  const isLive = Boolean(liveInfo?.isLive);

  useEffect(() => {
    const updateDate = () => setCurrentDate(new Date());
    updateDate();
    const intervalId = setInterval(updateDate, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const formattedDate = new Intl.DateTimeFormat('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(currentDate);
  const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const isAdmin = role?.trim().toLowerCase() === 'admin';
  const userName = profile?.name || profile?.userName || profile?.email || 'Usuario';
  const profileEmail = String(profile?.email ?? profile?.Email ?? '');
  const profileUserName = String(
    profile?.userName ?? profile?.username ?? profile?.NombreUsuario ?? profile?.nombreUsuario ?? profile?.name ?? '',
  );

  const closeProfile = () => {
    setProfileVisible(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordFeedback(null);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordFeedback({ kind: 'error', message: 'Completa los tres campos.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ kind: 'error', message: 'La nueva contraseña y su confirmación no coinciden.' });
      return;
    }

    setPasswordLoading(true);
    setPasswordFeedback(null);
    try {
      const result = await api.changeProfilePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordFeedback({ kind: 'success', message: result?.message || 'La contraseña se actualizó correctamente.' });
    } catch (error) {
      setPasswordFeedback({
        kind: 'error',
        message: error instanceof Error ? error.message : 'No se pudo cambiar la contraseña.',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAdminPress = () => {
    if (pathname.startsWith('/admin')) {
      router.replace('/');
      return;
    }
    router.push('/admin');
  };

  const navigationItems = [
    { label: 'INICIO', action: onGoInicio },
    { label: 'NOTICIAS', action: onGoNoticias },
    { label: 'COCHABAMBA', action: onGoNoticias },
    { label: 'BOLIVIA', action: onGoNoticias },
    { label: 'DEPORTES', action: onGoNoticias },
    { label: 'MUNDO', action: onGoNoticias },
    { label: 'VIDEOS CORTOS', action: onGoVideos },
    { label: 'ENLACES', action: onGoEnlaces },
    { label: 'OPINIÓN', action: onGoNoticias },
    { label: 'ECONOMÍA', action: onGoNoticias },
    { label: 'CULTURA', action: onGoNoticias },
    { label: 'SOCIEDAD', action: onGoNoticias },
    { label: 'MULTIMEDIA', action: onGoVideos },
  ];

  return (
    <header className={`rn-view ${s.wrapper}`}>
      {/* FILA SUPERIOR: [izquierda] [centro] [derecha] sin posiciones absolutas */}
      <div className={`rn-view ${s.topRow}`}>
        {/* Columna izquierda: logo del edificio (solo pantallas grandes) */}
        <div className={`rn-view ${s.sideColumn}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BUILDING_LOGO} alt="" className={s.buildingLogo} />
        </div>

        {/* Columna central: conserva su tamaño y luego desaparece */}
        <div className={`rn-view ${s.brandFrame}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BRAND_LOGO} alt="Los Tiempos" className={s.brandLogo} />
        </div>

        {/* Columna derecha: botones a tamaño normal */}
        <div className={`rn-view ${s.authButtonsContainer}`}>
          {!isAuthenticated ? (
            <>
              <button type="button" className={`rn-pressable ${s.registerBtn}`} onClick={onOpenRegister} aria-label="Registrarse">
                <IoPersonAddOutline size={17} color={LiveTheme.black} />
                <span className={`rn-text ${s.registerBtnText}`}>Registrarse</span>
              </button>
              <button type="button" className={`rn-pressable ${s.loginBtn}`} onClick={onOpenLogin} aria-label="Iniciar sesión">
                <IoPersonCircleOutline size={23} color={LiveTheme.black} />
                <span className={`rn-text ${s.loginBtnText}`}>Iniciar sesión</span>
              </button>
            </>
          ) : (
            <>
              {isAdmin && (
                <button type="button" className={`rn-pressable ${s.adminBtn}`} onClick={handleAdminPress} aria-label="Administrar">
                  <IoSettingsOutline size={19} color={LiveTheme.black} />
                  <span className={`rn-text ${s.adminBtnText}`}>
                    {pathname.startsWith('/admin') ? 'Inicio' : 'Administrar'}
                  </span>
                </button>
              )}
              <button
                type="button"
                className={`rn-pressable ${s.userInfo}`}
                onClick={() => setProfileVisible(true)}
                aria-label="Ver perfil de usuario"
              >
                <IoPersonCircleOutline size={23} color={LiveTheme.black} />
                <span className={`rn-text rn-line-1 ${s.userText}`}>{profileEmail || userName}</span>
              </button>
              <button type="button" className={`rn-pressable ${s.logoutBtn}`} onClick={logout} aria-label="Cerrar sesión">
                <IoLogOutOutline size={20} color={LiveTheme.black} />
                <span className={`rn-text ${s.logoutBtnText}`}>Cerrar sesión</span>
              </button>
            </>
          )}
        </div>
      </div>

      <Overlay visible={profileVisible} onRequestClose={closeProfile} className={s.profileBackdrop}>
        <div className={`rn-view ${s.profileModal}`}>
          <div className={`rn-view ${s.profileHeader}`}>
            <div className={`rn-view ${s.profileHeaderIcon}`}>
              <IoPersonOutline size={19} color={LiveTheme.goldDark} />
            </div>
            <div className={`rn-view ${s.profileHeaderCopy}`}>
              <span className={`rn-text ${s.profileTitle}`}>Mi perfil</span>
              <span className={`rn-text ${s.profileSubtitle}`}>Información de tu cuenta</span>
            </div>
            <button type="button" className={`rn-pressable ${s.profileClose}`} onClick={closeProfile} aria-label="Cerrar perfil">
              <IoClose size={20} color={LiveTheme.textSecondary} />
            </button>
          </div>
          <div className={`rn-view ${s.profileFieldsScroller}`}>
            <div className={`rn-view ${s.profileFields}`}>
              <div className={`rn-view ${s.profileField}`}>
                <span className={`rn-text ${s.profileLabel}`}>Correo electrónico</span>
                <span className={`rn-text ${s.profileValue}`}>{profileEmail || 'No disponible'}</span>
              </div>
              <div className={`rn-view ${s.profileField}`}>
                <span className={`rn-text ${s.profileLabel}`}>Nombre de usuario</span>
                <span className={`rn-text ${s.profileValue}`}>{profileUserName || 'No disponible'}</span>
              </div>
              <div className={`rn-view ${s.passwordSection}`}>
                <div className={`rn-view ${s.passwordHeading}`}>
                  <IoKeyOutline size={16} color={LiveTheme.textSecondary} />
                  <div className={`rn-view ${s.profileHeaderCopy}`}>
                    <span className={`rn-text ${s.passwordTitle}`}>Cambiar contraseña</span>
                    <span className={`rn-text ${s.passwordHint}`}>Actualiza la contraseña de tu cuenta.</span>
                  </div>
                </div>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Contraseña actual"
                  className={`rn-input ${s.passwordInput}`}
                  aria-label="Contraseña actual"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  className={`rn-input ${s.passwordInput}`}
                  aria-label="Nueva contraseña"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmar nueva contraseña"
                  className={`rn-input ${s.passwordInput}`}
                  aria-label="Confirmar nueva contraseña"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleChangePassword();
                  }}
                />
                {passwordFeedback && (
                  <div
                    className={`rn-view ${s.passwordFeedback} ${
                      passwordFeedback.kind === 'success' ? s.passwordSuccess : s.passwordError
                    }`}
                  >
                    {passwordFeedback.kind === 'success' ? (
                      <IoCheckmarkCircleOutline size={15} color={LiveTheme.success} />
                    ) : (
                      <IoAlertCircleOutline size={15} color={LiveTheme.error} />
                    )}
                    <span
                      className={`rn-text ${s.passwordFeedbackText} ${
                        passwordFeedback.kind === 'success' ? s.passwordSuccessText : s.passwordErrorText
                      }`}
                    >
                      {passwordFeedback.message}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  className={`rn-pressable ${s.passwordButton} ${passwordLoading ? s.passwordButtonDisabled : ''}`}
                  onClick={() => void handleChangePassword()}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <span className="rn-spinner" style={{ color: LiveTheme.black, width: 16, height: 16 }} />
                  ) : (
                    <IoSaveOutline size={15} color={LiveTheme.black} />
                  )}
                  <span className={`rn-text ${s.passwordButtonText}`}>
                    {passwordLoading ? 'Actualizando...' : 'Actualizar contraseña'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Overlay>

      {/* NAVEGACIÓN PRINCIPAL */}
      <nav className={`rn-view ${s.navigationBar}`}>
        <div className={`rn-hscroll ${s.navigationScroll}`}>
          <div className={`rn-view ${s.navigationContent}`}>
            {navigationItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`rn-pressable ${s.navigationItem}`}
                onClick={item.action}
                aria-label={item.label}
                disabled={!item.action}
              >
                <span className={`rn-text rn-line-1 ${s.navigationText}`}>{item.label}</span>
              </button>
            ))}

            <button type="button" className={`rn-pressable ${s.menuButton}`} aria-label="Menú">
              <IoMenu size={22} color={LiveTheme.black} />
            </button>
          </div>
        </div>
      </nav>

      {/* ESPACIO ENTRE ENCABEZADOS */}
      <div className={`rn-view ${s.headerSpacing}`} />

      {/* TITULAR / BARRA DE INFORMACIÓN */}
      <div className={`rn-view ${s.headlineBar}`}>
        <div
          className={`rn-view ${s.liveStateDot} ${isLive ? s.liveStateDotActive : ''}`}
          aria-label={isLive ? 'Transmisión en vivo activa' : 'Sin transmisión en vivo'}
        />

        <span className={`rn-text rn-clamp ${s.headlineText}`} style={clamp1}>
          {headline}
        </span>

        <span className={`rn-text rn-clamp ${s.dateText}`} style={clamp1} suppressHydrationWarning>
          {displayDate}
        </span>
      </div>
    </header>
  );
}
