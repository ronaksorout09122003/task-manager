import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const readableBuild = mode === "readable";
  const port = process.env.PORT ? Number(process.env.PORT) : 4173;
  const isRailway = Boolean(process.env.RAILWAY_ENVIRONMENT);

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
      port,
      allowedHosts: isRailway ? true : undefined,
    },
  };
});
