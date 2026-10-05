import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Las imágenes de noticias, anuncios y miniaturas vienen de dominios externos.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
