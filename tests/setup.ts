import { vi } from 'vitest';

// Mock pkg (gnome-js-common)
globalThis.pkg = {
  initGettext: vi.fn(),
};

// Mock C_ function for gettext
globalThis.C_ = (ctx: string, msg: string): string => msg;

// Global mocks for GObject - needed because many classes extend GObject.Object
// These must be at top level for vitest hoisting
vi.mock('gi://GObject', () => ({
  default: {
    Object: class {
      static registerClass() {}
      connect() {
        return 1;
      }
      disconnect() {}
      emit() {}
    },
    registerClass: () => {},
    TYPE_STRING: 'string',
    TYPE_OBJECT: 'object',
  },
}));

vi.mock('gi://GLib', () => ({
  default: {
    get_user_data_dir: () => '/tmp/doit-test',
    build_filenamev: (args: string[]) => args.join('/'),
  },
}));

vi.mock('gi://Gio', () => ({
  default: {
    File: { new_for_path: vi.fn() },
    FileCreateFlags: { PRIVATE: 1 },
  },
}));
