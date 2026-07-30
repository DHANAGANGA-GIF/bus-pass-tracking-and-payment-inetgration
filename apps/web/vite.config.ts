import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';

function hashPathResolver() {
  return {
    name: 'hash-path-resolver',
    resolveId(source, importer) {
      if (source === '@bus-pass/shared') {
        const sharedDist = path.resolve(__dirname, '../../packages/shared/dist/index.js');
        if (fs.existsSync(sharedDist)) return sharedDist;
      }

      if (importer && (source.startsWith('./') || source.startsWith('../') || source.startsWith('@/'))) {
        let baseDir = path.dirname(importer);
        if (source.startsWith('@/')) {
          baseDir = path.resolve(__dirname, 'src');
          source = source.replace('@/', './');
        }
        const resolvedPath = path.resolve(baseDir, source);

        const candidates = [
          resolvedPath,
          `${resolvedPath}.tsx`,
          `${resolvedPath}.ts`,
          `${resolvedPath}.jsx`,
          `${resolvedPath}.js`,
          path.join(resolvedPath, 'index.tsx'),
          path.join(resolvedPath, 'index.ts')
        ];

        for (const candidate of candidates) {
          if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            return candidate;
          }
        }
      }
      return null;
    }
  };
}

const rootPath = path.resolve(__dirname, '../../');

export default defineConfig({
  plugins: [hashPathResolver(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@bus-pass/shared': path.resolve(__dirname, '../../packages/shared/dist/index.js'),
      'react-transition-group': path.resolve(rootPath, 'node_modules/react-transition-group/esm/index.js'),
      'dom-helpers': path.resolve(rootPath, 'node_modules/dom-helpers/esm'),
      'react-smooth': path.resolve(rootPath, 'node_modules/react-smooth/es6/index.js')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-lucide': ['lucide-react'],
          'vendor-recharts': ['recharts']
        }
      },
      emptyOutDir: true
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: ['react-transition-group']
  }
});