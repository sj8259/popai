import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Turbopack uses this folder as the root, even if Next.js detects other lockfiles
  // higher up the filesystem.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
