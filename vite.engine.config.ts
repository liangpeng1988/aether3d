import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist/engine',
    lib: {
      entry: 'Engine/index.ts',
      name: 'Aether3dEngine',
      formats: ['umd', 'es'],
      fileName: (format) => `aether3d-engine.${format}.js`
    },
    rollupOptions: {
      // 移除 external，将 Three.js 和 Tween.js 也打包进库中
      output: {
        // 确保 UMD 格式正确暴露到全局作用域
        name: 'Aether3dEngine',
        extend: true,
        // 将CSS内容也输出到单独的文件
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'style.css'
          }
          return assetInfo.name || 'assets/[name][extname]'
        }
      }
    },
    // 确保CSS被提取
    cssCodeSplit: false
  },
  define: {
    global: 'globalThis'
  }
});
