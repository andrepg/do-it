import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', '_build', 'dist', '**/.{idea,git,cache,output,temp}/**'],
    alias: {
      'gi://GLib': path.resolve(__dirname, './tests/mocks/glib.ts'),
      'gi://Gio': path.resolve(__dirname, './tests/mocks/gio.ts'),
      'gi://GObject': path.resolve(__dirname, './tests/mocks/gobject.ts'),
      '~': path.resolve(__dirname, './src'),
    },
  },
  server: {
    watch: {
      ignored: ['**/_build/**'],
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
});
