import { describe, it, expect, vi, beforeEach } from 'vitest';

// Provide mocks for GI protocols BEFORE any other imports to catch ESM loader
vi.mock('gi://GLib', () => ({
  default: {
    get_user_data_dir: () => '/home/test/.local/share/doit',
    build_filenamev: (args: string[]) => args.join('/'),
  },
}));

vi.mock('gi://Gio', () => ({
  default: {
    File: {
      new_for_path: vi.fn(),
    },
    FileCreateFlags: {
      PRIVATE: 1,
    },
  },
}));

import Gio from 'gi://Gio';
import { Persistence } from '../../src/utils/persistence.js';

describe('Persistence', () => {
  let persistence: Persistence;
  let mockFile: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockFile = {
      get_path: vi.fn().mockReturnValue('/home/test/.local/share/doit/data.json'),
      query_exists: vi.fn().mockReturnValue(true),
      make_directory_with_parents: vi.fn(),
      create: vi.fn(),
      load_contents: vi.fn().mockReturnValue([null, new TextEncoder().encode('[]')]),
      replace_contents: vi.fn(),
    };

    ((Gio as any).File.new_for_path as any).mockReturnValue(mockFile);

    persistence = new Persistence();
  });

  it('should read from database correctly', () => {
    const data = [{ title: 'Test Task' }];
    mockFile.load_contents.mockReturnValue([null, new TextEncoder().encode(JSON.stringify(data))]);

    const result = persistence.read_database();
    expect(result).toEqual(data);
    expect(mockFile.load_contents).toHaveBeenCalled();
  });

  it('should return empty array if database is empty', () => {
    mockFile.load_contents.mockReturnValue([null, new TextEncoder().encode('')]);

    const result = persistence.read_database();
    expect(result).toEqual([]);
  });

  it('should write to database correctly', () => {
    const data = [{ title: 'New Task' }];
    persistence.write_database(data);

    expect(mockFile.replace_contents).toHaveBeenCalled();
    const callArgs = mockFile.replace_contents.mock.calls[0];
    const encodedData = callArgs[0];
    expect(new TextDecoder().decode(encodedData)).toBe(JSON.stringify(data));
  });

  it('should create database directory if it does not exist', () => {
    mockFile.query_exists.mockReturnValue(false);
    persistence.read_database();
    expect(mockFile.make_directory_with_parents).toHaveBeenCalled();
  });
});
