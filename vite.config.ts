// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  esbuild: {
    loader: "tsx",
    include: /\.tsx?$/
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx'
      }
    }
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx']
  },
  root: '.', // 设置根目录为项目根目录
  publicDir: 'public' // 设置公共目录
});