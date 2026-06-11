import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" makes asset paths relative, so the built dist works whether
// dropped at a domain root or a subpath on Netlify.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
