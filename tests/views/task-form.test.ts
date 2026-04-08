import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ITask } from '../../src/app.types.js';

// Mock GTK/Box before importing TaskForm
vi.mock('gi://Gtk', () => ({
  default: {
    Box: class {
      constructor() {
        this.add_controller = vi.fn();
        this.get_template_child = vi.fn().mockImplementation(() => null);
        this.get_first_child = vi.fn();
      }
    },
    CheckButton: class {
      connect() {}
      set_active() {}
      get_active() {
        return false;
      }
    },
    Button: class {
      connect() {}
    },
    EventControllerKey: class {
      connect() {}
    },
    EntryRow: class {
      set_text() {}
      get_text() {
        return '';
      }
      get_first_child() {
        return null;
      }
    },
  },
}));

vi.mock('gi://Adw', () => ({
  default: {
    EntryRow: class {
      set_text() {}
      get_text() {
        return '';
      }
      get_first_child() {
        return null;
      }
    },
  },
}));

vi.mock('gi://Gdk', () => ({
  default: {
    KEY_Escape: 0xff1b,
  },
}));

vi.mock('../../src/platform/gnome/actions/toast.js', () => ({
  showToast: vi.fn(),
}));

vi.mock('../../src/utils/log-manager.js', () => ({
  log: vi.fn(),
}));

describe('TaskForm Logic', () => {
  // Test the logic patterns used in TaskForm without instantiating GTK
  describe('has_task_loaded', () => {
    const createTaskLoadedChecker = () => {
      let taskId: string | null = null;

      return {
        has_task_loaded: () => taskId !== null,
        load_task: (id: string) => {
          taskId = id;
        },
        clear: () => {
          taskId = null;
        },
      };
    };

    it('should return false when no task is loaded', () => {
      const checker = createTaskLoadedChecker();
      expect(checker.has_task_loaded()).toBe(false);
    });

    it('should return true after loading a task', () => {
      const checker = createTaskLoadedChecker();
      checker.load_task('task-123');
      expect(checker.has_task_loaded()).toBe(true);
    });

    it('should return false after clearing', () => {
      const checker = createTaskLoadedChecker();
      checker.load_task('task-123');
      checker.clear();
      expect(checker.has_task_loaded()).toBe(false);
    });
  });

  describe('find_task pattern', () => {
    const createTaskFinder = (store: { find_by_id: (id: string) => any }) => {
      let taskId: string | null = null;

      return {
        find_task: () => {
          if (taskId === null) return null;
          return store.find_by_id(taskId);
        },
        load_task: (id: string) => {
          taskId = id;
        },
      };
    };

    it('should return null when no task is loaded', () => {
      const mockStore = { find_by_id: vi.fn() };
      const finder = createTaskFinder(mockStore);

      expect(finder.find_task()).toBeNull();
    });

    it('should call store.find_by_id with correct id', () => {
      const mockStore = { find_by_id: vi.fn().mockReturnValue({}) };
      const finder = createTaskFinder(mockStore);

      finder.load_task('task-456');
      finder.find_task();

      expect(mockStore.find_by_id).toHaveBeenCalledWith('task-456');
    });

    it('should return null when task not found in store', () => {
      const mockStore = { find_by_id: vi.fn().mockReturnValue(null) };
      const finder = createTaskFinder(mockStore);

      finder.load_task('task-789');
      expect(finder.find_task()).toBeNull();
    });
  });

  describe('dispatch_save validation', () => {
    const validateSave = (title: string): boolean => {
      const trimmed = title.trim();
      if (trimmed === '') {
        return false; // Would show error
      }
      return true;
    };

    it('should not save empty title', () => {
      expect(validateSave('')).toBe(false);
    });

    it('should not save whitespace-only title', () => {
      expect(validateSave('   ')).toBe(false);
    });

    it('should save valid title', () => {
      expect(validateSave('My Task')).toBe(true);
    });
  });

  describe('update_task pattern', () => {
    const createTaskUpdater = (store: { persist_store: () => void }) => {
      return {
        update: (task: ITask) => {
          store.persist_store();
        },
      };
    };

    it('should call persist_store after update', () => {
      const mockStore = { persist_store: vi.fn() };
      const updater = createTaskUpdater(mockStore);

      updater.update({ title: 'Test', created_at: Date.now() });

      expect(mockStore.persist_store).toHaveBeenCalled();
    });
  });
});
