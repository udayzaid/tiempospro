'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import {
  IoAlertCircleOutline,
  IoBanOutline,
  IoCheckmarkCircleOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoRefreshOutline,
  IoSearchOutline,
} from 'react-icons/io5';
import { LiveTheme } from '@/constants/live-theme';
import { api, type AdminProfileUser } from '@/services/api';
import s from './UserModerationPanel.module.css';

type Feedback = { kind: 'success' | 'error'; message: string } | null;

const clamp1 = { '--lines': 1 } as CSSProperties;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function UserModerationPanel() {
  const [username, setUsername] = useState('');
  const [userResult, setUserResult] = useState<AdminProfileUser | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<Feedback>(null);

  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [blockedCount, setBlockedCount] = useState(0);
  const [blockedLoading, setBlockedLoading] = useState(true);
  const [blockedFeedback, setBlockedFeedback] = useState<Feedback>(null);
  const [pendingUnblock, setPendingUnblock] = useState<string | null>(null);
  const [unblockingUser, setUnblockingUser] = useState<string | null>(null);

  const refreshBlockedUsers = useCallback(async () => {
    setBlockedLoading(true);
    setBlockedFeedback(null);
    try {
      const result = await api.getBlockedChatUsers();
      setBlockedUsers(result.blockedUsers);
      setBlockedCount(result.count);
    } catch (error) {
      setBlockedFeedback({ kind: 'error', message: getErrorMessage(error, 'No se pudo cargar la lista de bloqueados.') });
    } finally {
      setBlockedLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshBlockedUsers();
  }, [refreshBlockedUsers]);

  const handleSearch = async () => {
    const value = username.trim();
    if (!value) {
      setSearchFeedback({ kind: 'error', message: 'Escribe el username que quieres consultar.' });
      setUserResult(null);
      return;
    }

    setSearchLoading(true);
    setSearchFeedback(null);
    setUserResult(null);
    try {
      const result = await api.getProfileUserByUsername(value);
      setUserResult(result);
    } catch (error) {
      setSearchFeedback({ kind: 'error', message: getErrorMessage(error, 'No se pudo encontrar el usuario.') });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleBlockUser = async () => {
    const value = (userResult?.username || username).trim();
    if (!value) {
      setSearchFeedback({ kind: 'error', message: 'Busca un usuario antes de bloquearlo.' });
      return;
    }

    setBlockLoading(true);
    setSearchFeedback(null);
    try {
      const result = await api.blockChatUser(value);
      setSearchFeedback({ kind: 'success', message: result?.message || `@${value} fue bloqueado en el chat.` });
      await refreshBlockedUsers();
    } catch (error) {
      setSearchFeedback({ kind: 'error', message: getErrorMessage(error, 'No se pudo bloquear al usuario.') });
      // Mantener la lista sincronizada también cuando el servidor indique que ya estaba bloqueado.
      await refreshBlockedUsers();
    } finally {
      setBlockLoading(false);
    }
  };

  const handleUnblockUser = async (value: string) => {
    setUnblockingUser(value);
    setBlockedFeedback(null);
    try {
      const result = await api.unblockChatUser(value);
      setPendingUnblock(null);
      await refreshBlockedUsers();
      setBlockedFeedback({ kind: 'success', message: result?.message || `@${value} fue desbloqueado.` });
    } catch (error) {
      await refreshBlockedUsers();
      setBlockedFeedback({ kind: 'error', message: getErrorMessage(error, 'No se pudo desbloquear al usuario.') });
    } finally {
      setUnblockingUser(null);
    }
  };

  return (
    <div className={`rn-view ${s.container}`}>
      <div className={`rn-view ${s.heading}`}>
        <div className={`rn-view ${s.headingIcon}`}>
          <IoPeopleOutline size={19} color={LiveTheme.goldDark} />
        </div>
        <div className={`rn-view ${s.headingCopy}`}>
          <span className={`rn-text ${s.title}`}>Usuarios</span>
          <span className={`rn-text ${s.subtitle}`}>Consulta perfiles y modera la participación en el chat del live.</span>
        </div>
      </div>

      <div className={`rn-view ${s.sectionCard}`}>
        <div className={`rn-view ${s.sectionHeading}`}>
          <IoSearchOutline size={17} color={LiveTheme.textSecondary} />
          <div className={`rn-view ${s.sectionHeadingCopy}`}>
            <span className={`rn-text ${s.sectionTitle}`}>Buscar usuario</span>
            <span className={`rn-text ${s.sectionSubtitle}`}>Consulta los datos de una cuenta por su username.</span>
          </div>
        </div>
        <div className={`rn-view ${s.formRow}`}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoCapitalize="none"
            autoCorrect="off"
            className={`rn-input ${s.input}`}
            aria-label="Username del usuario"
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleSearch();
            }}
          />
          <button
            type="button"
            className={`rn-pressable ${s.primaryButton} ${searchLoading ? s.disabled : ''}`}
            onClick={handleSearch}
            disabled={searchLoading}
          >
            {searchLoading ? (
              <span className={`rn-spinner ${s.spinnerSmall}`} style={{ color: LiveTheme.black }} />
            ) : (
              <IoSearchOutline size={15} color={LiveTheme.black} />
            )}
            <span className={`rn-text ${s.primaryButtonText}`}>{searchLoading ? 'Buscando' : 'Buscar'}</span>
          </button>
        </div>

        {searchFeedback && <FeedbackMessage feedback={searchFeedback} />}
        {userResult && (
          <div className={`rn-view ${s.userResult}`}>
            <div className={`rn-view ${s.resultAvatar}`}>
              <IoPersonOutline size={19} color={LiveTheme.textSecondary} />
            </div>
            <div className={`rn-view ${s.resultCopy}`}>
              <span className={`rn-text ${s.resultName}`}>
                {[userResult.nombre, userResult.apellido].filter(Boolean).join(' ') || userResult.username}
              </span>
              <span className={`rn-text ${s.resultDetail}`}>@{userResult.username}</span>
              <span className={`rn-text ${s.resultDetail}`}>{userResult.correoElectronico}</span>
            </div>
            <button
              type="button"
              className={`rn-pressable ${s.blockButton} ${blockLoading ? s.disabled : ''}`}
              onClick={() => void handleBlockUser()}
              disabled={blockLoading}
              aria-label={`Bloquear a ${userResult.username} en el chat`}
            >
              {blockLoading ? (
                <span className={`rn-spinner ${s.spinnerSmall}`} style={{ color: LiveTheme.white }} />
              ) : (
                <IoBanOutline size={15} color={LiveTheme.white} />
              )}
              <span className={`rn-text ${s.blockButtonText}`}>{blockLoading ? 'Bloqueando' : 'Bloquear chat'}</span>
            </button>
          </div>
        )}
      </div>

      <div className={`rn-view ${s.sectionCard}`}>
        <div className={`rn-view ${s.blockedHeader}`}>
          <div className={`rn-view ${s.sectionHeading}`}>
            <IoBanOutline size={17} color={LiveTheme.textSecondary} />
            <div className={`rn-view ${s.sectionHeadingCopy}`}>
              <span className={`rn-text ${s.sectionTitle}`}>Usuarios bloqueados</span>
              <span className={`rn-text ${s.sectionSubtitle}`}>
                {blockedCount} bloqueado{blockedCount === 1 ? '' : 's'} en el live actual
              </span>
            </div>
          </div>
          <button
            type="button"
            className={`rn-pressable ${s.refreshButton}`}
            onClick={() => void refreshBlockedUsers()}
            disabled={blockedLoading}
            aria-label="Actualizar usuarios bloqueados"
          >
            {blockedLoading ? (
              <span className={`rn-spinner ${s.spinnerSmall}`} style={{ color: LiveTheme.textSecondary }} />
            ) : (
              <IoRefreshOutline size={17} color={LiveTheme.textSecondary} />
            )}
          </button>
        </div>

        {blockedFeedback && <FeedbackMessage feedback={blockedFeedback} />}
        {blockedLoading ? (
          <div className={`rn-view ${s.listState}`}>
            <span className="rn-spinner" />
            <span className={`rn-text ${s.emptyText}`}>Actualizando lista...</span>
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className={`rn-view ${s.listState}`} style={{ color: LiveTheme.success }}>
            <IoCheckmarkCircleOutline size={20} color={LiveTheme.success} />
            <span className={`rn-text ${s.emptyText}`}>No hay usuarios bloqueados en este live.</span>
          </div>
        ) : (
          blockedUsers.map((blockedUsername) => (
            <div key={blockedUsername} className={`rn-view ${s.blockedRow}`}>
              <div className={`rn-view ${s.blockedUserIcon}`}>
                <IoPersonOutline size={15} color={LiveTheme.textSecondary} />
              </div>
              <span className={`rn-text rn-clamp ${s.blockedUsername}`} style={clamp1}>
                @{blockedUsername}
              </span>
              {pendingUnblock === blockedUsername ? (
                <div className={`rn-view ${s.inlineConfirm}`}>
                  <span className={`rn-text ${s.confirmText}`}>¿Desbloquear?</span>
                  <button
                    type="button"
                    className={`rn-pressable ${s.cancelButton}`}
                    onClick={() => setPendingUnblock(null)}
                    disabled={unblockingUser === blockedUsername}
                  >
                    <span className={`rn-text ${s.cancelButtonText}`}>No</span>
                  </button>
                  <button
                    type="button"
                    className={`rn-pressable ${s.confirmButton}`}
                    onClick={() => void handleUnblockUser(blockedUsername)}
                    disabled={unblockingUser === blockedUsername}
                  >
                    {unblockingUser === blockedUsername ? (
                      <span className={`rn-spinner ${s.spinnerSmall}`} />
                    ) : (
                      <span className={`rn-text ${s.confirmButtonText}`}>Sí</span>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={`rn-pressable ${s.unblockButton}`}
                  onClick={() => setPendingUnblock(blockedUsername)}
                  disabled={Boolean(unblockingUser)}
                >
                  <span className={`rn-text ${s.unblockButtonText}`}>Desbloquear</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function FeedbackMessage({ feedback }: { feedback: Exclude<Feedback, null> }) {
  const ok = feedback.kind === 'success';
  return (
    <div className={`rn-view ${s.feedbackBox} ${ok ? s.feedbackSuccess : s.feedbackError}`}>
      {ok ? (
        <IoCheckmarkCircleOutline size={15} color={LiveTheme.success} />
      ) : (
        <IoAlertCircleOutline size={15} color={LiveTheme.error} />
      )}
      <span className={`rn-text ${s.feedbackText} ${ok ? s.feedbackSuccessText : s.feedbackErrorText}`}>
        {feedback.message}
      </span>
    </div>
  );
}
