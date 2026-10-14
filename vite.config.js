import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function apiDevServerPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next();
        
        const endpoint = req.url.split('?')[0].replace('/api/', '');
        const filePath = path.resolve(__dirname, `api/${endpoint}.js`);

        if (fs.existsSync(filePath)) {
          try {
            // Buffer POST body
            let body = {};
            if (req.method === 'POST') {
              const chunks = [];
              for await (const chunk of req) {
                chunks.push(chunk);
              }
              const raw = Buffer.concat(chunks).toString();
              if (raw) {
                try { body = JSON.parse(raw); } catch {}
              }
            }
            req.body = body;

            // Mock Vercel response helpers
            res.status = function(code) {
              this.statusCode = code;
              return this;
            };
            res.json = function(data) {
              this.setHeader('Content-Type', 'application/json');
              this.end(JSON.stringify(data));
            };

            const mod = await server.ssrLoadModule(filePath);
            await mod.default(req, res);
          } catch (err) {
            console.error('API Dev error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), apiDevServerPlugin()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/@vercel/')) {
            return 'vendor-analytics';
          }
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
