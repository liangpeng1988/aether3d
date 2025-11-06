import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        demo3d: resolve(__dirname, '3dDemo.html')
      }
    }
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