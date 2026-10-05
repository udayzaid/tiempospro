import type { Metadata } from 'next';
import { LiveScreen } from '@/components/live/LiveScreen';

// Reemplaza el <Head> de expo-router: metadatos renderizados en el servidor.
export const metadata: Metadata = {
  title: 'Los Tiempos | Señal en vivo',
  description:
    'Sigue la señal en vivo de Los Tiempos y mantente informado con noticias y contenido de actualidad de Bolivia.',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Los Tiempos | Señal en vivo',
    description:
      'Sigue la señal en vivo de Los Tiempos y mantente informado con noticias y contenido de actualidad de Bolivia.',
    siteName: 'Los Tiempos',
    locale: 'es_BO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Los Tiempos | Señal en vivo',
    description: 'Sigue nuestras transmisiones en directo y mantente informado.',
  },
};

export default function Home() {
  return <LiveScreen />;
}
