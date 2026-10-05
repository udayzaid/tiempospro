import s from './ChatMessage.module.css';

export type ChatMessageData = {
  id: string;
  username: string;
  text: string;
  avatarColor?: string;
};

/*
 * Fallback estable para mensajes antiguos o datos que no traigan avatarColor.
 */
const AVATAR_COLORS = [
  '#4285F4',
  '#34A853',
  '#FBBC05',
  '#EA4335',
  '#9C27B0',
  '#00ACC1',
  '#FF7043',
  '#5C6BC0',
];

function getAvatarColor(username: string) {
  let hash = 0;

  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % AVATAR_COLORS.length;

  return AVATAR_COLORS[index];
}

function getInitial(username: string) {
  const cleanUsername = username.trim().replace(/^@/, '');

  if (!cleanUsername) {
    return '?';
  }

  return cleanUsername.charAt(0).toUpperCase();
}

export function ChatMessage({ username, text, avatarColor }: ChatMessageData) {
  const finalAvatarColor = avatarColor || getAvatarColor(username);
  const initial = getInitial(username);

  return (
    <div className={`rn-view ${s.row}`}>
      {/* AVATAR */}
      <div className={`rn-view ${s.avatar}`} style={{ backgroundColor: finalAvatarColor }}>
        <span className={`rn-text ${s.avatarText}`}>{initial}</span>
      </div>

      {/* MENSAJE */}
      <div className={`rn-view ${s.textCol}`}>
        <span className={`rn-text ${s.username}`}>{username}</span>
        <span className={`rn-text ${s.messageText}`}>{text}</span>
      </div>
    </div>
  );
}
