import type { NextConfig } from "next";

// Domaine de prod : on n'y sert que la landing Notion (`/notion`, voir
// src/lib/landing.ts). Tout le reste — preprod, previews Vercel, localhost —
// garde le site WIP. Regex ancrée pour que `preprod.ore.today` ne matche pas.
const onProdHost = [
  { type: "host" as const, value: "^(?:www\\.)?ore\\.today$" },
];

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/files/87awwrcu/**",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/87awwrcu/**",
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", has: onProdHost, destination: "/notion" }],
    };
  },
  async redirects() {
    return [
      {
        // Sur la prod, toute page autre que la racine renvoie vers la landing :
        // les routes WIP n'y sont pas exposées. Les assets (`_next`, fichiers
        // avec extension) et `/api` restent servis.
        source: "/:path((?!_next/|api/|.*\\..*).+)",
        has: onProdHost,
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
