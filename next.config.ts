
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.top4top.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'k.top4top.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'a.top4top.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'f.top4top.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'j.top4top.io', 
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.zuj.edu.jo',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'exelx.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'c.top4top.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'h.top4top.io',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
