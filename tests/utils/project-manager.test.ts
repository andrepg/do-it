import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectManager } from '../../src/utils/project-manager.js';
import GObject from 'gi://GObject';

// Mock GObject
vi.mock('gi://GObject', () => {
  const MockObject = class {
    static registerClass = vi.fn();
    connect = vi.fn().mockReturnValue(1);
    disconnect = vi.fn();
    emit = vi.fn();
  };
  return {
    default: {
      Object: MockObject,
      registerClass: vi.fn(),
      TYPE_STRING: 'string',
      TYPE_OBJECT: 'object',
    }
  };
});

// Mock TaskItem
class MockTaskItem {
  private project: string;
  constructor(project: string) {
    this.project = project;
  }
  get_project() {
    return this.project;
  }
}

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
    // Manually trigger the static block equivalent if needed, 
    // but GObject mock handles registerClass
  });

  it('should identify new projects and emit project-added', () => {
    const emitSpy = vi.spyOn(projectManager as any, 'emit');
    
    const tasks = [
      new MockTaskItem('Work'),
      new MockTaskItem('Home'),
    ];

    mockStore.get_n_items.mockReturnValue(tasks.length);
    mockStore.get_item.mockImplementation((i: number) => tasks[i]);

    projectManager.refresh_items();

    expect(emitSpy).toHaveBeenCalledWith('project-added', 'Work');
    expect(emitSpy).toHaveBeenCalledWith('project-added', 'Home');
    expect(emitSpy).not.toHaveBeenCalledWith('project-added', '');
  });

  it('should identify removed projects and emit project-removed', () => {
    // Stage 1: Add projects
    const tasks1 = [new MockTaskItem('Work')];
    mockStore.get_n_items.mockReturnValue(tasks1.length);
    mockStore.get_item.mockImplementation((i: number) => tasks1[i]);
    projectManager.refresh_items();

    const emitSpy = vi.spyOn(projectManager as any, 'emit');

    // Stage 2: Remove project
    mockStore.get_n_items.mockReturnValue(0);
    projectManager.refresh_items();

    expect(emitSpy).toHaveBeenCalledWith('project-removed', 'Work');
    expect(emitSpy).toHaveBeenCalledWith('project-added', ''); // Restores default empty project
  });

  it('should set and get filters correctly', () => {
    const emitSpy = vi.spyOn(projectManager as any, 'emit');
    
    projectManager.set_filter('Work');
    expect(projectManager.get_filter()).toBe('Work');
    expect(emitSpy).toHaveBeenCalledWith('filter-changed', 'Work');

    // Should not emit if same filter
    emitSpy.mockClear();
    projectManager.set_filter('Work');
    expect(emitSpy).not.toHaveBeenCalled();
  });
});
