import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist/engine',
    lib: {
      entry: 'Engine/index.ts',
      name: 'Aether3dEngine',
      formats: ['umd'],
      fileName: (format) => `aether3d-engine.${format}.js`
    },
    rollupOptions: {
      // 移除 external，将 Three.js 和 Tween.js 也打包进库中
      // external: ['three', '@tweenjs/tween.js'],
      output: {
        // 移除 globals，因为我们不再将它们作为外部依赖
        // globals: {
        //   'three': 'THREE',
        //   '@tweenjs/tween.js': 'TWEEN'
        // },
        // 确保 UMD 格式正确暴露到全局作用域
        name: 'Aether3dEngine',
        extend: true
      }
    }
  },
  define: {
    global: 'globalThis'
  }
});