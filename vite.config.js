import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  return {
    esbuild: {
      drop: ['console', 'debugger'],
    },
    build: {
      minify: isProduction,
      outDir: './Resources/Public/',
      emptyOutDir: false,
      rollupOptions: {
        input: {
          'form-logic': './Resources/Private/JavaScript/Frontend/form-logic.js'
        },
        output: {
          entryFileNames: `JavaScript/[name].min.js`,
          chunkFileNames: `JavaScript/[name].min.js`,
          assetFileNames: `Css/[name].min.[ext]`,
        }
      }
    }
  }
});
