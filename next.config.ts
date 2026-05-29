import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['danish-catering-app.smktibazma.sch.id'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // 👈 Naikkan limit penerimaan body data menjadi 10 MegaByte
    },
  },
};

export default nextConfig;
