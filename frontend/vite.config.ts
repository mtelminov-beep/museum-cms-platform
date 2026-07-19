import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      "/api": "http://localhost:8787",
      "/uploads": "http://localhost:8787",
      "/welcome": "http://localhost:8787",
      "/about": "http://localhost:8787",
      "/poster": "http://localhost:8787",
      "/exhibits": {
        target: "http://localhost:8787",
        bypass(req) {
          // keep SPA routes /exhibits and /exhibits/:id in Vite
          if (req.url && !/\.\w{2,5}($|\?)/.test(req.url)) return req.url;
        }
      },
      "/exhibitions": "http://localhost:8787",
      "/articles": "http://localhost:8787",
      "/news": "http://localhost:8787",
      "/heroes": "http://localhost:8787",
      "/cinema": "http://localhost:8787",
      "/maps": "http://localhost:8787",
      "/games": "http://localhost:8787",
      "/tickets": "http://localhost:8787",
      "/audio": "http://localhost:8787",
      "/video": "http://localhost:8787",
      "/documents": "http://localhost:8787"
    }
  }
});

