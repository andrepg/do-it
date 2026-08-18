import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockStoreRef } = vi.hoisted(() => ({
  mockStoreRef: { current: null as MockStore | null },
}));

vi.mock('gi://Gtk', () => ({
  default: {
    StringList: class MockStringList {
      private items: string[] = [];

      get_n_items() {
        return this.items.length;
      }

      get_string(position: number) {
        return this.items[position] ?? null;
      }

      splice(position: number, n_removals: number, additions: string[] = []) {
        this.items.splice(position, n_removals, ...additions);
      }
    },
  },
}));

vi.mock('../../src/models/task.js', () => {
  return {
    Task: class MockTask {
      project = '';

      constructor(data?: { project?: string }) {
        if (data?.project !== undefined) this.project = data.project;
      }
    },
  };
});

vi.mock('../../src/store/list-store.js', () => ({
  TaskListStore: {
    get_default: () => mockStoreRef.current,
  },
}));

import { ProjectStore } from '../../src/store/project-store.js';
import { Task } from '../../src/models/task.js';

type MockStore = {
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  get_count: ReturnType<typeof vi.fn>;
  get_item: ReturnType<typeof vi.fn>;
};

describe('ProjectStore', () => {
  let mockStore: MockStore;
  let handlers: Record<string, () => void>;
  let projectStore: ProjectStore;

  beforeEach(() => {
    vi.clearAllMocks();

    handlers = {};

    mockStore = {
      connect: vi.fn((signal: string, callback: () => void) => {
        handlers[signal] = callback;
        return 1;
      }),
      disconnect: vi.fn(),
      get_count: vi.fn().mockReturnValue(0),
      get_item: vi.fn(),
    };

    mockStoreRef.current = mockStore;

    projectStore = new ProjectStore();
  });

  const mock_tasks_with_projects = (projects: string[]) => {
    mockStore.get_count.mockReturnValue(projects.length);
    mockStore.get_item.mockImplementation((index: number) => {
      return new Task({ project: projects[index] ?? '' });
    });
  };

  const trigger_store_signal = (signal: string) => handlers[signal]?.();

  it('should connect to store signals to trigger rescans', () => {
    expect(mockStore.connect).toHaveBeenCalledWith('items-changed', expect.any(Function));
    expect(mockStore.connect).toHaveBeenCalledWith('task-updated', expect.any(Function));
    expect(mockStore.connect).toHaveBeenCalledWith('task-deleted', expect.any(Function));
  });

  it('should identify new projects and emit project-added in order', () => {
    const emitSpy = vi.spyOn(projectStore, 'emit');

    mock_tasks_with_projects(['Work', 'Home']);

    trigger_store_signal('items-changed');

    expect(emitSpy).toHaveBeenCalledWith('project-added', 'Work');
    expect(emitSpy).toHaveBeenCalledWith('project-added', 'Home');
  });

  it('should identify removed projects and emit project-removed', () => {
    const emitSpy = vi.spyOn(projectStore, 'emit');

    mock_tasks_with_projects(['Work']);
    trigger_store_signal('items-changed');
    expect(emitSpy).toHaveBeenCalledWith('project-added', 'Work');

    emitSpy.mockClear();
    mock_tasks_with_projects([]);
    trigger_store_signal('items-changed');

    expect(emitSpy).toHaveBeenCalledWith('project-removed', 'Work');
  });

  it('should rescan projects when a task is updated', () => {
    const emitSpy = vi.spyOn(projectStore, 'emit');

    mock_tasks_with_projects(['Work']);
    trigger_store_signal('task-updated');

    expect(emitSpy).toHaveBeenCalledWith('project-added', 'Work');
  });

  it('should rescan projects when a task is deleted', () => {
    const emitSpy = vi.spyOn(projectStore, 'emit');

    mock_tasks_with_projects(['Home']);
    trigger_store_signal('task-deleted');

    expect(emitSpy).toHaveBeenCalledWith('project-added', 'Home');
  });

  it('should default to the all-projects filter', () => {
    expect(projectStore.get_filter()).toBe('__ALL__');
  });

  it('should set and get filters correctly', () => {
    const emitSpy = vi.spyOn(projectStore, 'emit');

    projectStore.set_filter('Work');
    expect(projectStore.get_filter()).toBe('Work');
    expect(emitSpy).toHaveBeenCalledWith('filter-changed', 'Work');
  });

  it('should expose discovered projects, excluding empty names', () => {
    mock_tasks_with_projects(['Work', '', 'Home']);
    trigger_store_signal('items-changed');

    expect(projectStore.get_projects()).toEqual(['Home', 'Work']);
  });
});
