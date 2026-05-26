/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Tell Next.js not to bundle these packages — load them natively via Node.js at runtime
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;
