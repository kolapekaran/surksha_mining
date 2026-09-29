import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "localhost",

    port: 5173,

    proxy: {

      // --------------------------
      // Normal FastAPI routes
      // --------------------------

      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },

      // --------------------------
      // Health
      // --------------------------

      "/health": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },

      // --------------------------
      // ML API
      // POST /detect/all
      // --------------------------

      "/detect": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },

    },
  },
});