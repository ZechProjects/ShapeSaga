import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis",
  },
  server: {
    port: parseInt(process.env.PORT || "3000"),
    host: true,
    strictPort: false, // Allow fallback to another port if the specified port is occupied
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
