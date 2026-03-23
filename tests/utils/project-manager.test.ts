import { describe, it, expect, vi, beforeEach } from 'vitest';

// Provide mocks for GI protocols BEFORE any other imports to catch ESM loader
vi.mock('gi://GObject', () => ({
  default: {
    Object: class {
      static registerClass = vi.fn();
      connect = vi.fn().mockReturnValue(1);
      disconnect = vi.fn();
      emit = vi.fn();
    },
    registerClass: vi.fn(),
    TYPE_STRING: 'string',
    TYPE_OBJECT: 'object',
  },
}));

vi.mock('gi://GLib', () => ({
  default: {
    get_user_data_dir: () => '/home/test/.local/share/doit',
    build_filenamev: (args: string[]) => args.join('/'),
    idle_add: vi.fn((prio, callback) => {
      callback();
      return 0;
    }),
    SOURCE_REMOVE: false,
    PRIORITY_DEFAULT_IDLE: 200,
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

// Mock TaskItem and TaskListStore to avoid loading them
vi.mock('../../src/ui-handler/task-item.js', () => ({
  TaskItem: class {
    get_project() { return ''; }
  },
}));

vi.mock('../../src/ui-handler/task-list-store.js', () => ({
  TaskListStore: class {},
}));

import { ProjectManager } from '../../src/utils/project-manager.js';
import { TaskItem } from '../../src/ui-handler/task-item.js';

describe('ProjectManager', () => {
  let mockStore: any;
  let projectManager: ProjectManager;

  beforeEach(() => {
    vi.clearAllMocks();

    mockStore = {
      connect: vi.fn().mockReturnValue(1),
      disconnect: vi.fn(),
      get_n_items: vi.fn().mockReturnValue(0),
      get_item: vi.fn(),
    };

    projectManager = new ProjectManager(mockStore);
  });

  it('should identify new projects and emit project-added in order', () => {
    const emitSpy = vi.spyOn(projectManager as any, 'emit');

    const taskA = new TaskItem();
    vi.spyOn(taskA, 'get_project').mockReturnValue('Work');
    const taskB = new TaskItem();
    vi.spyOn(taskB, 'get_project').mockReturnValue('Home');
    
    const tasks = [taskA, taskB];

    mockStore.get_n_items.mockReturnValue(tasks.length);
    mockStore.get_item.mockImplementation((i: number) => tasks[i]);

    projectManager.refresh_items();

    expect(emitSpy).toHaveBeenCalledWith('project-added', 'Work');
    expect(emitSpy).toHaveBeenCalledWith('project-added', 'Home');
    expect(projectManager.get_projects()).toEqual(['Work', 'Home']);
  });

  it('should identify removed projects and emit project-removed', () => {
    // Stage 1: Add projects
    const taskWork = new TaskItem();
    vi.spyOn(taskWork, 'get_project').mockReturnValue('Work');
    const tasks1 = [taskWork];
    
    mockStore.get_n_items.mockReturnValue(tasks1.length);
    mockStore.get_item.mockImplementation((i: number) => tasks1[i]);
    projectManager.refresh_items();

    const emitSpy = vi.spyOn(projectManager as any, 'emit');

    // Stage 2: Remove project
    mockStore.get_n_items.mockReturnValue(0);
    projectManager.refresh_items();

    expect(emitSpy).toHaveBeenCalledWith('project-removed', 'Work');
  });

  it('should set and get filters correctly', () => {
    const emitSpy = vi.spyOn(projectManager as any, 'emit');

    projectManager.set_filter('Work');
    expect(projectManager.get_filter()).toBe('Work');
    expect(emitSpy).toHaveBeenCalledWith('filter-changed', 'Work');
  });
});
