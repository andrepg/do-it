import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/views/task-item.js', () => {
  return {
    TaskItem: class MockTaskItem {
      project = '';
    },
  };
});

vi.mock('../../src/views/task-list-store.js', () => {
  return {
    TaskListStore: class {},
  };
});

import { ProjectManager } from '../../src/managers/project-manager.js';
import { TaskItem } from '../../src/views/task-item.js';
import { TaskListStore } from '../../src/views/task-list-store.js';

describe('ProjectManager', () => {
  let mockStore: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    get_n_items: ReturnType<typeof vi.fn>;
    get_item: ReturnType<typeof vi.fn>;
  };
  let handlers: Record<string, () => void>;
  let projectManager: ProjectManager;

  beforeEach(() => {
    vi.clearAllMocks();

    handlers = {};

    mockStore = {
      connect: vi.fn((signal: string, callback: () => void) => {
        handlers[signal] = callback;
        return 1;
      }),
      disconnect: vi.fn(),
      get_n_items: vi.fn().mockReturnValue(0),
      get_item: vi.fn(),
    };

    projectManager = new ProjectManager(mockStore as unknown as TaskListStore);
  });

  const mock_tasks_with_projects = (projects: string[]) => {
    mockStore.get_n_items.mockReturnValue(projects.length);
    mockStore.get_item.mockImplementation((index: number) => {
      const task = new TaskItem();
      task.project = projects[index] ?? '';
      return task;
    });
  };

  const trigger_store_signal = (signal: string) => handlers[signal]?.();

  it('should connect to store signals to trigger rescans', () => {
    expect(mockStore.connect).toHaveBeenCalledWith('items-changed', expect.any(Function));
    expect(mockStore.connect).toHaveBeenCalledWith('task-updated', expect.any(Function));
    expect(mockStore.connect).toHaveBeenCalledWith('task-deleted', expect.any(Function));
  });

  it('should identify new projects and emit project-added in order', () => {
    const emitSpy = vi.spyOn(projectManager, 'emit');

    mock_tasks_with_projects(['Work', 'Home']);

    trigger_store_signal('items-changed');

    expect(emitSpy).toHaveBeenCalledWith('project-added', 'Work');
    expect(emitSpy).toHaveBeenCalledWith('project-added', 'Home');
  });

  it('should identify removed projects and emit project-removed', () => {
    const emitSpy = vi.spyOn(projectManager, 'emit');

    mock_tasks_with_projects(['Work']);
    trigger_store_signal('items-changed');
    expect(emitSpy).toHaveBeenCalledWith('project-added', 'Work');

    emitSpy.mockClear();
    mock_tasks_with_projects([]);
    trigger_store_signal('items-changed');

    expect(emitSpy).toHaveBeenCalledWith('project-removed', 'Work');
  });

  it('should rescan projects when a task is updated', () => {
    const emitSpy = vi.spyOn(projectManager, 'emit');

    mock_tasks_with_projects(['Work']);
    trigger_store_signal('task-updated');

    expect(emitSpy).toHaveBeenCalledWith('project-added', 'Work');
  });

  it('should rescan projects when a task is deleted', () => {
    const emitSpy = vi.spyOn(projectManager, 'emit');

    mock_tasks_with_projects(['Home']);
    trigger_store_signal('task-deleted');

    expect(emitSpy).toHaveBeenCalledWith('project-added', 'Home');
  });

  it('should set and get filters correctly', () => {
    const emitSpy = vi.spyOn(projectManager, 'emit');

    projectManager.set_filter('Work');
    expect(projectManager.get_filter()).toBe('Work');
    expect(emitSpy).toHaveBeenCalledWith('filter-changed', 'Work');
  });
});
