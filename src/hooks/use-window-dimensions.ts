'use client';

import { useEffect, useState } from 'react';

type Dimensions = { width: number; height: number };

/**
 * Equivalente web de useWindowDimensions() de React Native.
 * En el servidor devuelve un ancho de escritorio para que el primer render
 * coincida con el HTML estático y luego se ajusta en el cliente tras hidratar.
 */
export function useWindowDimensions(): Dimensions {
  const [size, setSize] = useState<Dimensions>({ width: 1280, height: 800 });

  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return size;
}
