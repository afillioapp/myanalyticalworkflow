import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local and test database only; never used when DATABASE_URL is set.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
