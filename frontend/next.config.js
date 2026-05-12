/** @type {import('next').NextConfig} */
module.exports = {
  experimental: { serverComponentsExternalPackages: [] },
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
};
