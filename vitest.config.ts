import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'html-spa', 'html'],
      include: ['src/**/*.ts'],
      clean: true,
      reportsDirectory: './tests/coverage',
      htmlDir: './tests/coverage',
    },
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    exclude: [
      'node_modules/**',
      '_build/**',
      '.flatpak/**',
      '.flatpak-builder/**',
      'dist/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
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
