import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.mock factory to avoid hoisting issues
vi.mock('../../src/platform/gnome/views/task-item.js', () => {
  return {
    TaskItem: class MockTaskItem {
      project = '';
    },
  };
});

vi.mock('../../src/platform/gnome/views/task-list-store.js', () => {
  return {
    TaskListStore: class {},
  };
});

import { ProjectManager } from '../../src/utils/project-manager.js';
import { TaskItem } from '../../src/platform/gnome/views/task-item.js';

// Note: This test is skipped because GObject.registerClass cannot be properly
// mocked in Node.js environment. The ProjectManager class extends GObject.Object
// which requires GJS runtime to test properly.
describe.skip('ProjectManager', () => {
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
    taskA.project = 'Work';
    const taskB = new TaskItem();
    taskB.project = 'Home';

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
    taskWork.project = 'Work';
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
