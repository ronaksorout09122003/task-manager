import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const readableBuild = mode === "readable";

  return {
    plugins: [react()],

    build: {
      cssMinify: readableBuild ? false : "esbuild",
      minify: readableBuild ? false : "esbuild",
      sourcemap: readableBuild,
    },

    server: {
      port: 5173,
    },

    preview: {
      host: true, 
      port: process.env.PORT ? Number(process.env.PORT) : 4173,

      allowedHosts: [
        "confident-vision-production-a740.up.railway.app",
      ],
    },
  };
});