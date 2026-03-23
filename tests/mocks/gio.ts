import { vi } from 'vitest';

const mockFile = {
  get_path: vi.fn((p) => p),
  query_exists: vi.fn(() => true),
  make_directory_with_parents: vi.fn(),
  create: vi.fn(),
  load_contents: vi.fn(() => [null, new Uint8Array()]),
  replace_contents: vi.fn(),
};

export default {
  File: {
    new_for_path: vi.fn((path: string) => {
      mockFile.get_path.mockReturnValue(path);
      return mockFile;
    }),
  },
  FileCreateFlags: {
    PRIVATE: 1,
  },
  Settings: class {
    constructor() {}
    get_int = vi.fn();
    set_int = vi.fn();
    get_string = vi.fn();
    set_string = vi.fn();
  },
  _mockFile: mockFile, // Export for easy access in tests
};
