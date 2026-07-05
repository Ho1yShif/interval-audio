import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Served at the root of the custom domain interval-audio.com (GitHub Pages).
  base: "/",
  plugins: [react()],
  ssgOptions: {
    formatting: "minify",
  },
});
