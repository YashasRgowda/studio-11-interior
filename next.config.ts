import type { NextConfig } from "next";

// Static export: `next build` writes plain HTML/CSS/JS to `out/`.
// The site reads live content from Firestore in the browser, so no server is needed.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
