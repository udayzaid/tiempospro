'use client';

import { useEffect, useState } from 'react';
import { startLogin } from '@/components/auth/authService';
import { Overlay } from '@/components/ui/Overlay';
import { api } from '@/services/api';
import s from './AuthModal.module.css';

type AuthModalProps = {
  visible: boolean;
  onClose: () => void;
  initialRegister?: boolean;
};

export function AuthModal({ visible, onClose, initialRegister = false }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(initialRegister);

  // Campos de registro
  const [nombre, setNombre] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfir, setPasswordConfir] = useState('');

  // Estados de carga y error
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setIsRegister(initialRegister);
      setErrorMessage(null);
    }
  }, [visible, initialRegister]);

  const resetForm = () => {
    setNombre('');
    setNombreUsuario('');
    setApellido('');
    setEmail('');
    setPassword('');
    setPasswordConfir('');
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    // LOGIN
    if (!isRegister) {
      setLoading(true);

      try {
        await startLogin();
      } catch (err: any) {
        setErrorMessage(err?.message || 'No se pudo iniciar el proceso de autenticación.');
        setLoading(false);
      }

      return;
    }

    // VALIDACIÓN DEL REGISTRO
    if (!nombre || !nombreUsuario || !apellido || !email || !password || !passwordConfir) {
      setErrorMessage('Por favor, completa todos los campos requeridos.');
      return;
    }

    if (password !== passwordConfir) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      // REGISTRAR USUARIO EN EL BACKEND
      await api.registerUser({
        Nombre: nombre,
        NombreUsuario: nombreUsuario,
        Apellido: apellido,
        Email: email,
        Password: password,
        PasswordConfir: passwordConfir,
      });

      // REGISTRO EXITOSO: NO mostramos mensaje de "Cuenta creada".
      // Cerramos el modal y enviamos directamente al sistema de autenticación.
      resetForm();
      onClose();
      setLoading(false);

      try {
        await startLogin();
      } catch (loginError: any) {
        console.error('Error iniciando sesión después del registro:', loginError?.message || loginError);
      }

      return;
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error de conexión con el servidor.');
      setLoading(false);
    }
  };

  return (
    <Overlay visible={visible} onRequestClose={handleClose} onBackdropClick={handleClose} className={s.overlay}>
      <div className={`rn-view ${s.modalCard}`}>
        <span className={`rn-text ${s.title}`}>{isRegister ? 'Crear una Cuenta' : 'Iniciar Sesión'}</span>

        <span className={`rn-text ${s.subtitle}`}>
          {isRegister
            ? 'Únete para participar en la transmisión en vivo'
            : 'Serás dirigido al sistema seguro de autenticación de Los Tiempos'}
        </span>

        {errorMessage && <span className={`rn-text ${s.errorText}`}>{errorMessage}</span>}

        {isRegister ? (
          <>
            {/* NOMBRE */}
            <div className={`rn-view ${s.inputGroup}`}>
              <label className={`rn-text ${s.label}`} htmlFor="auth-nombre">Nombre</label>
              <input
                id="auth-nombre"
                className={`rn-input ${s.input}`}
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            {/* USUARIO */}
            <div className={`rn-view ${s.inputGroup}`}>
              <label className={`rn-text ${s.label}`} htmlFor="auth-usuario">Nombre de usuario</label>
              <input
                id="auth-usuario"
                className={`rn-input ${s.input}`}
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                autoCapitalize="none"
              />
            </div>

            {/* APELLIDO */}
            <div className={`rn-view ${s.inputGroup}`}>
              <label className={`rn-text ${s.label}`} htmlFor="auth-apellido">Apellido</label>
              <input
                id="auth-apellido"
                className={`rn-input ${s.input}`}
                placeholder="Tu apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
              />
            </div>

            {/* EMAIL */}
            <div className={`rn-view ${s.inputGroup}`}>
              <label className={`rn-text ${s.label}`} htmlFor="auth-email">Correo electrónico</label>
              <input
                id="auth-email"
                type="email"
                className={`rn-input ${s.input}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoCapitalize="none"
              />
            </div>

            {/* CONTRASEÑA */}
            <div className={`rn-view ${s.inputGroup}`}>
              <label className={`rn-text ${s.label}`} htmlFor="auth-password">Contraseña</label>
              <input
                id="auth-password"
                type="password"
                className={`rn-input ${s.input}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* CONFIRMAR CONTRASEÑA */}
            <div className={`rn-view ${s.inputGroup}`}>
              <label className={`rn-text ${s.label}`} htmlFor="auth-password2">Confirmar contraseña</label>
              <input
                id="auth-password2"
                type="password"
                className={`rn-input ${s.input}`}
                value={passwordConfir}
                onChange={(e) => setPasswordConfir(e.target.value)}
              />
            </div>
          </>
        ) : (
          <div className={`rn-view ${s.loginInfo}`}>
            <span className={`rn-text ${s.loginInfoText}`}>
              Tu correo y contraseña se solicitarán en la pantalla segura de autenticación.
            </span>
          </div>
        )}

        {/* BOTÓN PRINCIPAL */}
        <button
          type="button"
          className={`rn-pressable ${s.submitBtn} ${loading ? s.submitBtnDisabled : ''}`}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <span className="rn-spinner" style={{ color: '#FFF' }} />
          ) : (
            <span className={`rn-text ${s.submitBtnText}`}>
              {isRegister ? 'Registrarme' : 'Continuar con el inicio de sesión'}
            </span>
          )}
        </button>

        {/* CAMBIAR ENTRE LOGIN Y REGISTRO */}
        <button type="button" onClick={toggleMode} className={`rn-pressable ${s.switchContainer}`}>
          <span className={`rn-text ${s.switchText}`}>
            {isRegister ? '¿Ya tienes cuenta? ' : '¿Aún no tienes cuenta? '}
            <span className={`rn-text ${s.switchText} ${s.switchLink}`}>
              {isRegister ? 'Inicia Sesión' : 'Regístrate aquí'}
            </span>
          </span>
        </button>

        {/* CANCELAR */}
        <button type="button" className={`rn-pressable ${s.closeBtn}`} onClick={handleClose}>
          <span className={`rn-text ${s.closeBtnText}`}>Cancelar</span>
        </button>
      </div>
    </Overlay>
  );
}
