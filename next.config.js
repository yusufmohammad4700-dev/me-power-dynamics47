/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify is now default in Next.js 15
  experimental: {
    // appDir is now stable in Next.js 15
  },
  webpack: (config) => {
    // Handle mapbox-gl
    config.resolve.alias = {
      ...config.resolve.alias,
      'mapbox-gl': 'mapbox-gl/dist/mapbox-gl.js',
    };
    return config;
  },
  env: {
    MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFudXMtZGVtbyIsImEiOiJjbHNkZmFzZGZhc2RmYXNkZmFzZGYifQ.demo-token',
  },
};

export default nextConfig;

