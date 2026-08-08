import { vi } from 'vitest';

// Mock pkg (gnome-js-common)
globalThis.pkg = {
  initGettext: vi.fn(),
};

// Mock C_ function for gettext
globalThis.C_ = (ctx: string, msg: string): string => msg;
