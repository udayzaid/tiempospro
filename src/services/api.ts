import type { StreamCredentials } from '@/types/stream';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://lostiemposapi20260817104248-avbkfhcfcucgf9e0.centralus-01.azurewebsites.net';

// Helper para obtener encabezados y Token de sesión.
// Durante la migración mantenemos el token antiguo como compatibilidad,
// pero las peticiones también envían las cookies HttpOnly mediante include.
const getHeaders = (requireAuth = false) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Configuración común para que el navegador envíe las cookies HttpOnly
// de la sesión con las peticiones al backend.
const fetchOptions = (requireAuth = false): RequestInit => ({
  credentials: 'include',
  headers: getHeaders(requireAuth),
});

export type ChatHistoryMessage = {
  id?: string;
  userId?: string;
  userName?: string;
  username?: string;
  avatarColor?: string;
  message?: string;
  text?: string;
  createdAt?: string;
  fecha?: string;
};

export type StreamChatHistoryMessage = {
  message: string;
  fecha: string;
  userName: string;
  avatarColor: string;
};

export type AdminProfileUser = {
  nombre: string;
  apellido: string;
  correoElectronico: string;
  username: string;
};

export interface NoticiaItem {
  id?: number;
  titulo: string;
  categoria: string;
  urlImagen: string;
  descripcion: string;
  fecha: string;
  url: string;
}

export interface PagedResponse<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ReelGetDto {
  id?: number;
  link: string;
  titulo: string;
  portadaUrl: string;
  tiktokVideoId: string;
}

export interface StreamHistoryItem {
  broadcastId: string;
  nombre: string;
  descripcion: string;
  watchUrl: string;
  espectadores: number;
  incio: string;
  fin: string;
  estado: string;
}

export const api = {
  getProfileUserByUsername: async (username: string): Promise<AdminProfileUser> => {
    const res = await fetch(`${BASE_URL}/api/profile/users/${encodeURIComponent(username)}`, {
      ...fetchOptions(true),
      method: 'GET',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || data?.mensaje || `Error buscando usuario (${res.status})`);
    }
    return data as AdminProfileUser;
  },

  blockChatUser: async (username: string) => {
    const res = await fetch(`${BASE_URL}/api/profile/chat/blocked-users`, {
      ...fetchOptions(true),
      method: 'POST',
      body: JSON.stringify({ username }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || data?.mensaje || `Error bloqueando usuario (${res.status})`);
    }
    return data;
  },

  getBlockedChatUsers: async (): Promise<{ blockedUsers: string[]; count: number }> => {
    const res = await fetch(`${BASE_URL}/api/profile/chat/blocked-users`, {
      ...fetchOptions(true),
      method: 'GET',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || data?.mensaje || `Error obteniendo usuarios bloqueados (${res.status})`);
    }
    return {
      blockedUsers: Array.isArray(data?.blockedUsers) ? data.blockedUsers : [],
      count: Number(data?.count ?? data?.blockedUsers?.length ?? 0),
    };
  },

  unblockChatUser: async (username: string) => {
    const res = await fetch(`${BASE_URL}/api/profile/chat/blocked-users/${encodeURIComponent(username)}`, {
      ...fetchOptions(true),
      method: 'DELETE',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || data?.mensaje || `Error desbloqueando usuario (${res.status})`);
    }
    return data;
  },

  changeProfilePassword: async (currentPassword: string, newPassword: string) => {
    const res = await fetch(`${BASE_URL}/api/profile/change-password`, {
      ...fetchOptions(true),
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const identityErrors = Array.isArray(data?.errors) ? data.errors.join(' ') : '';
      throw new Error(data?.message || data?.mensaje || identityErrors || `Error cambiando contraseña (${res.status})`);
    }
    return data;
  },

  // 0. GET / -> Endpoint base de salud/inicio
  getPrimer: async () => {
    try {
      const res = await fetch(`${BASE_URL}/`, {
        ...fetchOptions(false),
        method: 'GET',
      });
      if (!res.ok) throw new Error(`Status: ${res.status}`);
      return await res.text();
    } catch (error) {
      console.error('Error en getPrimer:', error);
      return 'Servidor en línea';
    }
  },

  // 1. GET /api/Stream -> Consulta la transmisión activa para la vista pública.
  // Cuando no existe Live, el backend puede responder { message: 'stream no encontrado' }.
  getStream: async () => {
    try {
      let res = await fetch(`${BASE_URL}/Stream`, {
        ...fetchOptions(false),
        method: 'GET',
      });

      // Compatibilidad: algunos despliegues exponen la consulta pública
      // bajo /api/Stream. Si /Stream no existe, probamos esa ruta.
      if (res.status === 404) {
        res = await fetch(`${BASE_URL}/api/Stream`, {
          ...fetchOptions(false),
          method: 'GET',
        });
      }

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        return { url: '', raw: data, hasActiveStream: false };
      }

      const message = String(data?.message || data?.mensaje || '').toLowerCase();
      if (message.includes('stream no encontrado')) {
        return { url: '', raw: data, hasActiveStream: false };
      }

      // Compatibilidad mientras terminamos de confirmar el JSON exacto
      // que devuelve el backend cuando existe una transmisión activa.
      const videoUrl =
        data?.embedUrl ||
        data?.embeUrl ||
        data?.watchUrl ||
        data?.link ||
        data?.url ||
        data?.streamUrl ||
        data?.videoUrl ||
        (typeof data === 'string' ? data : '');

      return {
        url: typeof videoUrl === 'string' ? videoUrl : '',
        raw: data,
        hasActiveStream:
          typeof videoUrl === 'string' && videoUrl.trim().length > 0,
      };
    } catch (error) {
      console.error('Error en getStream:', error);
      return { url: '', raw: null, hasActiveStream: false };
    }
  },

  getStreamCredentials: async () => {
    try {
      const res = await fetch(`${BASE_URL}/Stream`, {
        ...fetchOptions(true),  // requiere auth (admin)
        method: 'GET',
      });


      if (!res.ok) {
        return null;
      }

      const data = await res.json().catch(() => null);

      if (!data) return null;

      // Validación mínima: debe tener broadcastId (indicador de live real)
      if (!data.broadcastId && !data.streamingKey) {
        return null;
      }

      return {
        nombre: String(data.nombre ?? data.Nombre ?? data.titulo ?? data.Titulo ?? ''),
        descripcion: String(data.descripcion ?? data.Descripcion ?? ''),
        incio: String(data.incio ?? data.Incio ?? data.inicio ?? data.Inicio ?? ''),
        broadcastId: String(data.broadcastId ?? ''),
        watchUrl: String(data.watchUrl ?? ''),
        embeUrl: String(data.embeUrl ?? data.embedUrl ?? ''),
        rtmpServerUrl: String(data.rtmpServerUrl ?? ''),
        streamingKey: String(data.streamingKey ?? ''),
        estado: String(data.estado ?? ''),
      };
    } catch (error) {
      console.error('Error en getStreamCredentials:', error);
      return null;
    }
  },

  getAllStreams: async (pageIndex = 1, pageSize = 10): Promise<PagedResponse<StreamHistoryItem>> => {
    const params = new URLSearchParams({
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString(),
    });

    const res = await fetch(`${BASE_URL}/api/Stream/all?${params.toString()}`, {
      ...fetchOptions(true),
      method: 'GET',
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || data?.mensaje || `Error obteniendo transmisiones (${res.status})`);
    }

    return data as PagedResponse<StreamHistoryItem>;
  },

  getStreamChatHistory: async (
    broadcastId: string,
    pageIndex = 1,
    pageSize = 50
  ): Promise<PagedResponse<StreamChatHistoryMessage>> => {
    const params = new URLSearchParams({
      PageIndex: pageIndex.toString(),
      PageSize: pageSize.toString(),
    });
    const safeBroadcastId = encodeURIComponent(broadcastId);
    const res = await fetch(
      `${BASE_URL}/api/Chat/history/stream/${safeBroadcastId}?${params.toString()}`,
      { ...fetchOptions(true), method: 'GET' }
    );
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.message || data?.mensaje || `Error obteniendo historial del chat (${res.status})`);
    }

    return data as PagedResponse<StreamChatHistoryMessage>;
  },

  // 2. GET /api/Chat/history -> Historial público del chat.
  // No requiere autenticación. Las cookies de sesión se envían igualmente
  // mediante credentials: 'include'.
  getChatHistory: async (take = 50) => {
    const safeTake = Math.min(Math.max(take, 1), 100);

    try {
      const res = await fetch(`${BASE_URL}/api/Chat/history?take=${safeTake}`, {
        ...fetchOptions(false),
        method: 'GET',
      });

      if (res.status === 404) {
        throw new Error('El endpoint de historial del chat respondió 404.');
      }

      if (!res.ok) {
        throw new Error(`Error en historial de chat (${res.status})`);
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        return data as ChatHistoryMessage[];
      }

      if (Array.isArray(data?.messages)) {
        return data.messages as ChatHistoryMessage[];
      }

      return [];
    } catch (error) {
      console.error('Error cargando historial del chat:', error);
      throw error;
    }
  },

  // 3. POST /SingIn
  // Registro de usuarios.
  registerUser: async (data: {
    Nombre: string;
    NombreUsuario: string;
    Apellido: string;
    Email: string;
    Password: string;
    PasswordConfir: string;
  }) => {

    const res = await fetch(`${BASE_URL}/SingIn`, {
      ...fetchOptions(false),
      method: 'POST',
      body: JSON.stringify(data),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        resData?.message ||
        resData?.mensaje ||
        'No se pudo registrar el usuario.'
      );
    }

    return resData;
  },

  createStream: async (data: { titulo: string; descripcion: string }): Promise<StreamCredentials> => {
    const res = await fetch(`${BASE_URL}/api/Stream`, {
      ...fetchOptions(true),
      method: 'POST',
      body: JSON.stringify({
        titulo: data.titulo,
        descripcion: data.descripcion,
      }),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(resData?.message || resData?.mensaje || `Error en POST (${res.status})`);
    }

    // Normalizamos los campos por si el backend varía el casing
    return {
      nombre: String(resData.nombre ?? resData.Nombre ?? resData.titulo ?? resData.Titulo ?? data.titulo),
      descripcion: String(resData.descripcion ?? resData.Descripcion ?? data.descripcion),
      incio: String(resData.incio ?? resData.Incio ?? resData.inicio ?? resData.Inicio ?? ''),
      broadcastId: String(resData.broadcastId ?? ''),
      watchUrl: String(resData.watchUrl ?? ''),
      embeUrl: String(resData.embeUrl ?? resData.embedUrl ?? ''),
      rtmpServerUrl: String(resData.rtmpServerUrl ?? ''),
      streamingKey: String(resData.streamingKey ?? ''),
      estado: String(resData.estado ?? ''),
    };
  },

  // Compatibilidad temporal: admin/index.tsx todavía utiliza postStream.
  postStream: async (data: { titulo: string; descripcion: string }) => {
    return api.createStream(data);
  },

  // 5. DELETE /api/Stream -> Finaliza y borra la transmisión activa.
  deleteStream: async () => {
    const res = await fetch(`${BASE_URL}/api/Stream`, {
      ...fetchOptions(true),
      method: 'DELETE',
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(resData?.message || resData?.mensaje || `Error en DELETE (${res.status})`);
    }

    return resData;
  },

  // GET /api/reels?pageIndex=1&pageSize=10
  getReels: async (pageIndex = 1, pageSize = 10, requireAuth = false): Promise<PagedResponse<ReelGetDto>> => {
    const params = new URLSearchParams({
      pageIndex: pageIndex.toString(),
      pageSize: pageSize.toString(),
    });

    const res = await fetch(`${BASE_URL}/api/Reel?${params.toString()}`, {
      ...fetchOptions(requireAuth),
      method: 'GET',
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Error status: ${res.status}`);
    }

    return await res.json();
  },

  getAllNoticias: async (pageIndex = 1, pageSize = 10): Promise<PagedResponse<NoticiaItem>> => {
    const params = new URLSearchParams({
      PageIndex: pageIndex.toString(),
      PageSize: pageSize.toString(),
    });
    const res = await fetch(`${BASE_URL}/api/Noticia/All?${params.toString()}`, {
      ...fetchOptions(true),
      method: 'GET',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || data?.mensaje || `Error obteniendo noticias (${res.status})`);
    }
    return data as PagedResponse<NoticiaItem>;
  },

  getAllReels: async (pageIndex = 1, pageSize = 10): Promise<PagedResponse<ReelGetDto>> => {
    const params = new URLSearchParams({
      PageIndex: pageIndex.toString(),
      PageSize: pageSize.toString(),
    });
    const res = await fetch(`${BASE_URL}/api/Reel/All?${params.toString()}`, {
      ...fetchOptions(true),
      method: 'GET',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || data?.mensaje || `Error obteniendo reels (${res.status})`);
    }
    return data as PagedResponse<ReelGetDto>;
  },

  createNoticia: async (url: string) => {
    const res = await fetch(`${BASE_URL}/api/Noticia`, {
      ...fetchOptions(true),
      method: 'POST',
      body: JSON.stringify({ url }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || data?.mensaje || `Error creando noticia (${res.status})`);
    }
    return data;
  },

  createReel: async (url: string) => {
    const res = await fetch(`${BASE_URL}/api/Reel`, {
      ...fetchOptions(true),
      method: 'POST',
      body: JSON.stringify({ url }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || data?.mensaje || `Error creando reel (${res.status})`);
    }
    return data;
  },

  deleteNoticia: async (id: number) => {
    const res = await fetch(`${BASE_URL}/api/Noticia/${id}`, {
      ...fetchOptions(true),
      method: 'DELETE',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || data?.mensaje || `Error eliminando noticia (${res.status})`);
    }
    return data;
  },

  deleteReel: async (id: number) => {
    const res = await fetch(`${BASE_URL}/api/Reel/${id}`, {
      ...fetchOptions(true),
      method: 'DELETE',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || data?.mensaje || `Error eliminando reel (${res.status})`);
    }
    return data;
  },

  // 6. GET /Noticias -> Obtener noticias paginadas
 getNoticias: async (pageIndex = 1, pageSize = 4): Promise<PagedResponse<NoticiaItem> | null> => {
  try {
    const res = await fetch(
      `${BASE_URL}/api/Noticia?PageIndex=${pageIndex}&PageSize=${pageSize}`,
      {
        ...fetchOptions(false),
        method: 'GET',
      }
    );

    if (!res.ok) {
      throw new Error(`Error obteniendo noticias (${res.status})`);
    }

    const data = await res.json();
    return data as PagedResponse<NoticiaItem>;
  } catch (error) {
    console.error('Error en getNoticias:', error);
    return null;
  }
},
};
