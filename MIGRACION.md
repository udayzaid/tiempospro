# Migración Expo -> Next.js (App Router)

## Equivalencias usadas
- `View` -> `<div className="rn-view ...">` (clase global con los defaults flexbox de RN)
- `Text` -> `<span|p|h2 className="rn-text ...">`
- `Pressable` / `TouchableOpacity` -> `<button className="rn-pressable ...">` (`pressed` -> `:active`)
- `StyleSheet.create` -> CSS Modules (`Componente.module.css`)
- `Image` (expo-image) -> `<img>` con `object-fit`
- `Linking.openURL` -> `window.open(url, '_blank')`
- `useWindowDimensions` -> `src/hooks/use-window-dimensions.ts`
- `numberOfLines` -> `.rn-line-1` o `.rn-clamp` con `--lines`
- `EXPO_PUBLIC_*` -> `NEXT_PUBLIC_*`

## Estado
Etapa 1 (hecha): configuración, layout raíz, providers, servicios, auth (PKCE), contexto SignalR,
ChatMessage, NewsTicker, LiveDescription, VideoPlayer, ReelPlayer, ReelPreview, PromoCard.
Etapa 2 (hecha): `/` -> LiveScreen, LiveHeader, LiveChat, ReelSection, ReelCard, PromoCardsRow, SiteFooter, AdSlot, AuthModal.
  - Breakpoints de ancho -> media queries de CSS (sin parpadeo al hidratar).
  - `<Modal>` -> `components/ui/Overlay.tsx` (Esc y clic en el fondo para cerrar).
  - Iconos: `@expo/vector-icons` -> `react-icons` (io5 y fa).
  - Logos: `public/imagenes/` (ver LEEME.txt). El tamaño 350x115 ya está reservado.
  - Variables: `.env.local` (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_OAUTH_CLIENT_ID).
Etapa 3 (hecha): `/auth/callback`, `/admin` (+ `admin/layout.tsx` con el guard de rol) y los 4 componentes admin.
  - `Redirect` de expo-router -> `router.replace('/')` dentro de un efecto en `admin/layout.tsx`.
  - `react-native-svg` (gráfica) -> `<svg><path/></svg>` inline.
  - `expo-clipboard` -> `navigator.clipboard.writeText`.
  - `Linking.openURL` -> `window.open(url, '_blank', 'noopener,noreferrer')`.

## Ejecutar
```
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```
El `redirect_uri` OAuth pasa a `http://localhost:3000/auth/callback` (antes 8081): registrarlo en el servidor
de autorización y permitir ese origen en el CORS (con credenciales) del backend.

## Pendiente por tu parte
- Copiar las imágenes a `public/imagenes/` (`logo 2.1.png`, `logo 1 (1).png`).

## Descartado (plantilla Expo que ninguna ruta usaba)
animated-icon, app-tabs, external-link, hint-row, web-badge, collapsible, theme.ts, use-color-scheme, use-theme
y los archivos `.native`. `httpClient.ts` y `apiClient.ts` se conservan por si los usas.
