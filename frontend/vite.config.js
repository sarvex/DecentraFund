import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    base: "/",
    build: {
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: true,
    },
    define: {
      "process.env": env,
    },
    server: {
      port: 3000,
      open: true,
    },
  };
});
