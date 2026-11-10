# TiemposPro

Plataforma web de información, transmisiones en vivo y contenido multimedia.

TiemposPro es una aplicación web desarrollada para centralizar la visualización y administración de transmisiones en vivo, noticias y videos cortos. Permite a los usuarios acceder a contenido informativo, interactuar mediante un chat en tiempo real y participar en las publicaciones de la plataforma.

Este repositorio contiene el desarrollo del **frontend web**, encargado de la interfaz de usuario y de la comunicación con los servicios del backend.

---

## 1. Descripción del proyecto

TiemposPro es una plataforma web que integra diferentes funcionalidades de comunicación y publicación de contenido.

El sistema contempla diferentes niveles de acceso para visitantes, usuarios registrados y administradores.

Su arquitectura separa el frontend y el backend, permitiendo que cada componente pueda desarrollarse, mantenerse y desplegarse independientemente.

## 2. Funcionalidades principales

### 2.1. Transmisiones en vivo

- Visualización de transmisiones activas.
- Acceso a la última transmisión finalizada cuando no existe una transmisión activa.
- Integración de chat durante las transmisiones.
- Visualización de comentarios según el tipo de usuario.
- Administración de transmisiones desde el panel administrativo.

### 2.2. Noticias

- Visualización de noticias publicadas.
- Consulta de contenido informativo.
- Interacciones mediante Me gusta, comentarios y compartir.
- Administración de publicaciones.

### 2.3. Reels y contenido multimedia

- Visualización de videos cortos.
- Integración de videos de TikTok mediante reproductores embebidos.
- Presentación del título y descripción del contenido.
- Navegación entre los videos publicados.

### 2.4. Chat en tiempo real

- Comunicación mediante SignalR.
- Visualización de mensajes durante las transmisiones.
- Interacción de usuarios registrados.
- Consulta del historial de mensajes.

### 2.5. Panel administrativo

- Administración de transmisiones.
- Publicación y eliminación de noticias.
- Gestión de contenido multimedia.
- Administración de los contenidos de la plataforma.

## 3. Roles de usuario

| Tipo de usuario | Permisos |
|---|---|
| Visitante | Visualizar transmisiones y contenido público. |
| Usuario no registrado | Visualizar contenido y comentarios, sin participar directamente en el chat. |
| Usuario registrado | Visualizar transmisiones, comentar e interactuar con las noticias. |
| Administrador | Crear y eliminar transmisiones, publicar noticias y administrar contenidos. |

## 4. Tecnologías utilizadas

### Frontend

- Next.js 16.
- React 19.
- TypeScript.
- CSS Modules.
- React Icons.

### Comunicación

- API REST.
- SignalR.
- HTTP/HTTPS.
- Cookies de sesión y autenticación.

### Infraestructura

- Node.js 22.
- Docker.
- Docker Compose.
- Nginx.
- Git y GitHub.

## 5. Requisitos previos

Para trabajar con el proyecto desde otra computadora se necesitan:

| Herramienta | Uso |
|---|---|
| Git | Clonar y actualizar el repositorio. |
| Node.js 22 | Ejecutar el entorno de desarrollo. |
| npm | Instalar dependencias. |
| Visual Studio Code | Editor de código recomendado. |
| Docker | Ejecutar el proyecto en contenedores. |
| Docker Compose | Administrar los servicios Docker. |

**Nota:** Node.js 20.9 o superior es el requisito mínimo de Next.js 16. Se recomienda Node.js 22, que coincide con la versión utilizada en el Dockerfile.

Documentación oficial:

- Node.js: https://nodejs.org/
- Next.js: https://nextjs.org/docs
- Docker: https://docs.docker.com/
- Git: https://git-scm.com/

## 6. Clonar el repositorio

Abrir una terminal y ejecutar:

```bash
git clone https://github.com/udayzaid/tiempospro.git
```

Ingresar al directorio:

```bash
cd tiempospro
```

La rama principal del proyecto es:

```text
main
```

## 7. Configuración de variables de entorno

El proyecto utiliza variables de entorno para configurar la comunicación entre el frontend y el backend.

En la raíz del repositorio se proporciona el archivo `.env.example`, que contiene valores de referencia.

### 7.1. Variables disponibles

| Variable | Descripción | Ejemplo |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Dirección base del backend. | `http://localhost:5000` |
| `NEXT_PUBLIC_OAUTH_CLIENT_ID` | Identificador del cliente OAuth. | `react-client` |

### 7.2. Ejemplos de direcciones del backend

**Backend ejecutándose en la misma computadora:**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Backend en una computadora de la red local:**

```env
NEXT_PUBLIC_API_URL=http://192.168.1.100:5000
```

**Backend publicado mediante un dominio:**

```env
NEXT_PUBLIC_API_URL=https://api.midominio.com
```

**Backend publicado mediante una IP y Nginx:**

```env
NEXT_PUBLIC_API_URL=https://IP_DEL_SERVIDOR
```

Las direcciones de dominio e IP son ejemplos. Deben reemplazarse por direcciones reales, configuradas y accesibles.

### 7.3. Configuración para desarrollo local

Copiar el archivo de ejemplo y crear `.env.local`.

Linux:

```bash
cp .env.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Abrir `.env.local` y modificar la dirección del backend según el entorno utilizado.

Ejemplo:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_OAUTH_CLIENT_ID=react-client
```

### 7.4. Configuración para Docker Compose

Para Docker Compose se utiliza un archivo llamado `.env`.

Linux:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Ejemplo:

```env
NEXT_PUBLIC_API_URL=https://api.midominio.com
NEXT_PUBLIC_OAUTH_CLIENT_ID=react-client
```

**Importante:**

- `.env.local` se utiliza para desarrollo local.
- `.env` se utiliza para proporcionar variables a Docker Compose.
- No se deben subir archivos `.env` privados al repositorio.
- Las variables que comienzan con `NEXT_PUBLIC_` quedan incorporadas al código generado por Next.js durante la compilación.
- Si se modifica la dirección del backend para Docker, es necesario reconstruir la imagen.
- Nunca colocar contraseñas, tokens privados, claves de transmisión o credenciales en variables `NEXT_PUBLIC_`.

## 8. Instalación y ejecución en modo desarrollo

Una vez clonado el repositorio y configurado `.env.local`, instalar las dependencias:

```bash
npm ci
```

Si no se dispone de un `package-lock.json` válido, utilizar:

```bash
npm install
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

El proyecto está configurado para ejecutarse en el puerto **8081** durante el desarrollo.

Abrir en el navegador:

```text
http://localhost:8081
```

Para detener el servidor:

```text
Ctrl + C
```

Los cambios realizados en el código se reflejan automáticamente durante el desarrollo.

## 9. Construcción y ejecución en producción local

Para generar la versión optimizada de Next.js:

```bash
npm run build
```

Para iniciar el servidor de producción:

```bash
npm start
```

Por defecto, Next.js utiliza el puerto 3000.

Abrir:

```text
http://localhost:3000
```

## 10. Ejecución mediante Docker

El proyecto cuenta con un Dockerfile que utiliza una construcción multietapa y el modo standalone de Next.js.

### 10.1. Requisitos

Comprobar que Docker esté instalado:

```bash
docker --version
```

Comprobar Docker Compose:

```bash
docker compose version
```

### 10.2. Crear el archivo `.env`

Linux:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Configurar la dirección del backend dentro del archivo `.env`.

### 10.3. Construir la imagen

```bash
docker compose -f compose.yaml build tiempospro-frontend
```

### 10.4. Iniciar el contenedor

```bash
docker compose -f compose.yaml up -d tiempospro-frontend
```

### 10.5. Consultar el estado del contenedor

```bash
docker compose -f compose.yaml ps
```

### 10.6. Consultar los registros

```bash
docker compose -f compose.yaml logs -f tiempospro-frontend
```

### 10.7. Acceder a la aplicación

```text
http://localhost:3000
```

### 10.8. Detener los servicios

```bash
docker compose -f compose.yaml down
```

**Nota:** el servicio frontend está configurado para publicar el puerto 3000 únicamente en `127.0.0.1`. Esta configuración permite que Nginx del servidor actúe como proxy inverso. Por eso no se puede acceder directamente al puerto 3000 desde otra computadora de la red.

## 11. Actualización del proyecto

Para obtener los últimos cambios de GitHub:

```bash
git pull origin main
```

Si se modificaron las dependencias:

```bash
npm ci
```

Si se trabaja con Docker, reconstruir la imagen:

```bash
docker compose -f compose.yaml build tiempospro-frontend
```

Recrear el contenedor:

```bash
docker compose -f compose.yaml up -d --no-deps --force-recreate tiempospro-frontend
```

## 12. Arquitectura del sistema

TiemposPro utiliza una arquitectura con frontend y backend independientes.

### Frontend

Responsable de:

- Presentar la interfaz de usuario.
- Administrar páginas y componentes.
- Gestionar la navegación.
- Consumir los servicios API.
- Establecer la comunicación con SignalR.

### Backend

Responsable de:

- Procesar la lógica de negocio.
- Administrar usuarios y autenticación.
- Gestionar transmisiones, noticias y Reels.
- Proporcionar los servicios API.
- Gestionar la información del sistema.

### Base de datos

Almacena la información utilizada por la aplicación y es administrada desde el backend.

### Infraestructura

Docker permite ejecutar los servicios en contenedores y Nginx administra el acceso a la aplicación y las solicitudes dirigidas al backend.

**Importante:** este repositorio contiene el frontend. Ejecutar su archivo `compose.yaml` no inicia automáticamente el backend ni la base de datos.

## 13. Estructura general del proyecto

```text
tiempospro/
│
├── public/                  # Recursos públicos
│
├── src/
│   ├── app/                 # Páginas y rutas de Next.js
│   ├── components/          # Componentes reutilizables
│   ├── contexts/            # Contextos y estados compartidos
│   ├── hooks/               # Hooks personalizados
│   ├── services/            # Comunicación con la API
│   ├── styles/              # Estilos de la aplicación
│   └── types/               # Tipos de TypeScript
│
├── Dockerfile               # Construcción de imagen Docker
├── compose.yaml             # Configuración de Docker Compose
├── .dockerignore            # Archivos excluidos de Docker
├── .env.example             # Ejemplo de variables de entorno
├── next.config.ts           # Configuración de Next.js
├── package.json             # Dependencias y scripts
├── package-lock.json        # Versiones bloqueadas
└── README.md                # Documentación
```

La estructura es una representación general de la organización del frontend.

## 14. Configuración de producción

Para desplegar el frontend en un servidor se requiere:

- Un servidor Linux.
- Node.js o Docker.
- Acceso al backend.
- Configuración de dominio o dirección IP.
- HTTPS mediante un certificado válido.
- Nginx u otro proxy inverso.

En el servidor actual de TiemposPro, Nginx recibe las solicitudes HTTPS y las distribuye entre el frontend y el backend.

La dirección pública utilizada por el frontend debe corresponder a la configuración del proxy inverso.

### Consideraciones de producción

- Configurar correctamente las variables de entorno antes de construir la imagen.
- Verificar que el backend esté disponible.
- Configurar CORS para los orígenes autorizados.
- Configurar correctamente las cookies de autenticación.
- Utilizar HTTPS con certificados válidos.
- No exponer puertos internos innecesariamente.
- No publicar archivos `.env` con información privada.

## 15. Solución de problemas

### Error: NEXT_PUBLIC_API_URL no está definido

Comprobar que exista el archivo correspondiente:

- `.env.local` para desarrollo.
- `.env` para Docker Compose.

Verificar que la variable esté escrita correctamente.

### Error al instalar dependencias

Comprobar la versión de Node.js:

```bash
node -v
```

Comprobar npm:

```bash
npm -v
```

Se recomienda Node.js 22.

### Error de conexión con el backend

Comprobar:

- Que el backend esté funcionando.
- Que la dirección configurada sea correcta.
- Que la computadora tenga acceso al servidor.
- Que HTTPS y el certificado sean válidos.
- Que el backend permita el origen del frontend mediante CORS.

### La aplicación abre, pero no carga noticias, usuarios o transmisiones

El frontend puede estar funcionando correctamente, pero no conseguir comunicarse con el backend.

Revisar la consola del navegador y la pestaña Network para identificar errores HTTP, CORS o autenticación.

### Error al iniciar Docker

Comprobar:

```bash
docker ps
```

Consultar los registros:

```bash
docker compose -f compose.yaml logs tiempospro-frontend
```

Verificar que el archivo `.env` exista y que `NEXT_PUBLIC_API_URL` esté definido.

### Cambié el backend, pero sigue utilizando la dirección anterior

Las variables `NEXT_PUBLIC_` quedan incorporadas durante la compilación.

Reconstruir la imagen:

```bash
docker compose -f compose.yaml build --no-cache tiempospro-frontend
```

Recrear el contenedor:

```bash
docker compose -f compose.yaml up -d --force-recreate tiempospro-frontend
```

## 16. Repositorio y control de versiones

Repositorio oficial:

https://github.com/udayzaid/tiempospro

Rama principal:

```text
main
```

Para obtener los cambios más recientes:

```bash
git pull origin main
```

Git se utiliza para el control de versiones y GitHub para alojar el código fuente del proyecto.

## 17. Seguridad y archivos de configuración

Los siguientes archivos deben manejarse de forma diferente:

| Archivo | ¿Se sube a GitHub? | Uso |
|---|---|---|
| `.env.example` | Sí | Plantilla de configuración sin secretos. |
| `.env` | No | Variables de entorno de Docker Compose. |
| `.env.local` | No | Configuración de desarrollo local. |
| `.env.production` | No | Configuración privada de producción. |

El repositorio contiene reglas en `.gitignore` para excluir los archivos de entorno privados y permitir únicamente `.env.example`.

No almacenar credenciales, contraseñas, tokens, claves privadas ni claves de transmisión en el repositorio.

## 18. Objetivo del proyecto

Desarrollar una plataforma web que permita centralizar la difusión de contenido informativo y audiovisual, facilitando el acceso a transmisiones en vivo, noticias y videos, además de proporcionar herramientas administrativas para gestionar los contenidos y mejorar la interacción con los usuarios.

---

**TiemposPro**

Plataforma web de información, transmisiones en vivo y contenido multimedia.

