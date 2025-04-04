import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "aos/dist/aos.css": path.resolve(
        __dirname,
        "node_modules/aos/dist/aos.css"
      ),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "${path.resolve(
          __dirname,
          "node_modules/aos/dist/aos.css"
        )}";`,
      },
    },
  },
});
