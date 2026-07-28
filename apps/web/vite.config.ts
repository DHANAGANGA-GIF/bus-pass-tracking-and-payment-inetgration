import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

function hashPathResolver() {
  return {
    name: 'hash-path-resolver',
    resolveId(source: string, importer: string | undefined) {
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

export default defineConfig({
  plugins: [hashPathResolver(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@bus-pass/shared': path.resolve(__dirname, '../../packages/shared/dist/index.js')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
