import { describe, it, expect, vi, beforeEach } from 'vitest';
import Gio from 'gi://Gio';
import { GioFilePersistence } from '../../src/persistence/gio-persistence.js';

const mockFile = Gio._mockFile;

const sampleTasks = () => [
  { id: '1', title: 'Task one', done: false, created_at: 1700000000000, deleted: false },
  { id: '2', title: 'Task two', done: true, created_at: 1700000000001, deleted: false },
];

describe('GioFilePersistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFile.query_exists.mockReturnValue(true);
    mockFile.load_contents.mockReturnValue([null, new Uint8Array()]);
  });

  it('should create the database file on first run', () => {
    mockFile.query_exists.mockReturnValue(false);

    new GioFilePersistence();

    expect(mockFile.make_directory_with_parents).toHaveBeenCalledWith(null);
    expect(mockFile.create).toHaveBeenCalledWith(Gio.FileCreateFlags.PRIVATE, null);
  });

  it('should not create the database when the file already exists', () => {
    new GioFilePersistence();

    expect(mockFile.make_directory_with_parents).not.toHaveBeenCalled();
    expect(mockFile.create).not.toHaveBeenCalled();
  });

  it('should load an empty list when the file has no content', () => {
    const persistence = new GioFilePersistence();

    expect(persistence.load()).toEqual([]);
  });

  it('should parse the persisted tasks from the database file', () => {
    const content = new TextEncoder().encode(JSON.stringify(sampleTasks()));
    mockFile.load_contents.mockReturnValue([null, content]);

    const persistence = new GioFilePersistence();

    expect(persistence.load()).toEqual(sampleTasks());
  });

  it('should encode and save the tasks to the database file', () => {
    const persistence = new GioFilePersistence();

    persistence.save(sampleTasks());

    const expected = new TextEncoder().encode(JSON.stringify(sampleTasks()));
    expect(mockFile.replace_contents).toHaveBeenCalledWith(
      expected,
      null,
      true,
      Gio.FileCreateFlags.PRIVATE,
      null,
    );
  });
});
