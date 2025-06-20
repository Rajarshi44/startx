import { createCivicAuthPlugin } from "@civic/auth/nextjs"
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: "591fba43-f526-4a18-b303-e0ad4dd98bd9"
});

export default withCivicAuth(nextConfig)