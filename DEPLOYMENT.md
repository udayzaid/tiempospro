# Despliegue del frontend TiemposPro con Docker

## Alcance

Esta configuración despliega el frontend Next.js en modo producción. No despliega el backend .NET, la base de datos ni el servidor de streaming.

## Requisitos

- Docker Engine y Docker Compose plugin.
- Acceso al repositorio y permiso para ejecutar contenedores.
- Nginx del servidor configurado por el administrador para hacer proxy a `127.0.0.1:3000`.
- URL del backend accesible desde los navegadores de los usuarios.
- Registrar el origen público y la URL de callback OAuth en el proveedor de identidad y en la configuración CORS del backend.

## Preparación local

Crear un archivo `.env` (no subirlo a Git) con:

```dotenv
NEXT_PUBLIC_API_URL=https://URL-ACTUAL-DE-LA-API
NEXT_PUBLIC_OAUTH_CLIENT_ID=react-client
```

Usar la URL real de la API vigente. Las variables `NEXT_PUBLIC_*` se incorporan al bundle durante `npm run build`; cambiar el archivo después de construir la imagen no actualiza esos valores.

## Compilar e iniciar

```bash
docker compose build
docker compose up -d
docker compose ps
docker compose logs --tail=100 tiempospro-frontend
```

La aplicación queda enlazada a `127.0.0.1:3000`, no expuesta directamente a toda Internet. No cambiar puertos ni Nginx en el servidor compartido sin autorización del administrador.

## Validación previa a producción

- Confirmar que la página carga y que las rutas de Next.js funcionan.
- Probar OAuth con la URL pública definitiva y revisar cookies/HTTPS.
- Probar API, SignalR, noticias, chat, panel administrativo y reproductor.
- Revisar consola y pestaña Network del navegador.
- Confirmar que el backend autoriza cada operación administrativa.
- Mantener Vercel como respaldo hasta completar pruebas y aprobación.

## Seguridad

- No añadir secretos, tokens, claves de streaming ni archivos `.env` al repositorio.
- La URL de API y el ID de cliente OAuth pueden ser públicos; las claves privadas no.
- El contenedor ejecuta como usuario no root, elimina capacidades y usa sistema de archivos de solo lectura.
- Los encabezados HTTP se configuran en Next.js; TLS y proxy inverso se configuran en Nginx.
- Este despliegue no sustituye una auditoría del backend, OAuth, CORS, Supabase ni del servidor de streaming.
