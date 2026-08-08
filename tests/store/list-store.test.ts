import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AppSignals } from '../../src/app.enums.js';
import type { ITask } from '../../src/app.types.js';

const { persistenceRef, windowMock } = vi.hoisted(() => ({
  persistenceRef: {
    current: null as null | { load: ReturnType<typeof vi.fn>; save: ReturnType<typeof vi.fn> },
  },
  windowMock: { activate_action: vi.fn() },
}));

vi.mock('gi://Gio', () => ({
  default: {
    ListStore: class MockListStore {
      items: unknown[] = [];
      connect = vi.fn();
      emit = vi.fn();
      get_n_items = vi.fn(() => this.items.length);
      get_item = vi.fn((index: number) => this.items[index] ?? null);
      insert_sorted = vi.fn((item: unknown, comparator: (a: unknown, b: unknown) => number) => {
        this.items.push(item);
        this.items.sort(comparator);
      });
      remove = vi.fn((index: number) => {
        this.items.splice(index, 1);
      });
      remove_all = vi.fn(() => {
        this.items.length = 0;
      });
      sort = vi.fn();
    },
  },
}));

vi.mock('../../src/views/task-item.js', () => ({
  TaskItem: class MockTaskItem {
    handlers: Record<string, () => void> = {};
    deleted: boolean;
    connect = vi.fn((signal: string, callback: () => void) => {
      this.handlers[signal] = callback;
      return 1;
    });
    constructor(
      public id: string,
      public title: string,
      public done: boolean,
      public created_at: number,
      public project: string,
      public deleted: boolean = false,
    ) {}
    to_object(): ITask {
      return {
        id: this.id,
        title: this.title,
        done: this.done,
        created_at: this.created_at,
        project: this.project,
        deleted: this.deleted,
      };
    }
    get_root() {
      return windowMock;
    }
  },
}));

vi.mock('../../src/persistence/gio-persistence.js', () => ({
  GioFilePersistence: class MockPersistence {
    load = vi.fn(() => []);
    save = vi.fn();
    constructor() {
      persistenceRef.current = this;
    }
  },
}));

vi.mock('../../src/utils/tasks.sort.js', () => ({
  retrieve_sort_preferences: vi.fn(() => ({ mode: 'by_date', strategy: 1 })),
  sort_by: vi.fn(() => (_a: unknown, _b: unknown) => 0),
}));

vi.mock('../../src/views/doit.js', () => ({
  DoItMainWindow: class MockWindow {},
}));

import { TaskListStore } from '../../src/store/list-store.js';
import { ActionNames } from '../../src/static/actions.js';

describe('TaskListStore', () => {
  let store: TaskListStore;

  beforeEach(() => {
    vi.clearAllMocks();
    persistenceRef.current = null;
    store = new TaskListStore();
  });

  const task = (overrides: Partial<ITask> = {}): ITask => ({
    id: 'task-1',
    title: 'Buy milk',
    done: false,
    created_at: 1_700_000_000_000,
    project: 'Home',
    deleted: false,
    ...overrides,
  });

  it('should provide a shared singleton instance', () => {
    expect(TaskListStore.get_default()).toBe(TaskListStore.get_default());
  });

  it('should append a task, wiring signals and inserting it sorted', () => {
    const data = task();

    store.append_task(data);

    expect(store.get_count()).toBe(1);
    expect(store.get_item(0).to_object()).toEqual(data);

    const item = store.get_item(0) as { connect: ReturnType<typeof vi.fn> };
    expect(item.connect).toHaveBeenCalledWith(AppSignals.TaskUpdated, expect.any(Function));
    expect(item.connect).toHaveBeenCalledWith(AppSignals.TaskDeleted, expect.any(Function));
    expect(item.connect).toHaveBeenCalledWith(AppSignals.Activated, expect.any(Function));
  });

  it('should generate an id when appending a task without one', () => {
    const data = task({ id: undefined });

    store.append_task(data);

    expect(store.get_item(0).to_object().id).toBe('test-uuid');
  });

  it('should return all tasks as plain objects', () => {
    store.append_task(task());
    store.append_task(task({ id: 'task-2', title: 'Walk dog' }));

    expect(store.get_all().map((t) => t.id)).toEqual(['task-1', 'task-2']);
  });

  it('should find a task by id', () => {
    store.append_task(task());
    store.append_task(task({ id: 'task-2', title: 'Walk dog' }));

    const found = store.find_by_id('task-2');

    expect(found?.to_object().title).toBe('Walk dog');
  });

  it('should return undefined when no task matches the id', () => {
    store.append_task(task());

    expect(store.find_by_id('missing')).toBeUndefined();
  });

  it('should load tasks from persistence', () => {
    const tasks = [task(), task({ id: 'task-2', title: 'Walk dog' })];
    persistenceRef.current?.load.mockReturnValue(tasks);

    store.load_tasks();

    expect(store.get_count()).toBe(2);
    expect(store.get_all().map((t) => t.id)).toEqual(['task-1', 'task-2']);
  });

  it('should reload tasks, discarding the current store state', () => {
    store.append_task(task());

    const tasks = [task({ id: 'task-2', title: 'Walk dog' })];
    persistenceRef.current?.load.mockReturnValue(tasks);

    store.reload_tasks();

    expect(store.get_count()).toBe(1);
    expect(store.get_item(0).to_object().id).toBe('task-2');
  });

  it('should emit and re-sort when a task changes', () => {
    store.append_task(task());
    const item = store.get_item(0) as { handlers: Record<string, () => void> };

    item.handlers[AppSignals.TaskUpdated]();

    expect(store.emit).toHaveBeenCalledWith(AppSignals.TaskUpdated, expect.anything());
    expect(store.sort).toHaveBeenCalled();
    expect(persistenceRef.current?.save).toHaveBeenCalled();
  });

  it('should trigger task edit action when a task is activated', () => {
    store.append_task(task());
    const item = store.get_item(0) as { handlers: Record<string, () => void> };

    item.handlers[AppSignals.Activated]();

    expect(windowMock.activate_action).toHaveBeenCalledWith(
      ActionNames.TaskEdit,
      expect.anything(),
    );
  });

  it('should persist all tasks', () => {
    store.append_task(task());
    store.append_task(task({ id: 'task-2', title: 'Walk dog' }));

    store.persist_tasks();

    expect(persistenceRef.current?.save).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: 'task-1' }),
        expect.objectContaining({ id: 'task-2' }),
      ]),
    );
  });

  it('should purge soft-deleted tasks and persist the remaining ones', () => {
    store.append_task(task());
    store.append_task(task({ id: 'task-2', title: 'Walk dog', deleted: true }));

    store.purge_deleted_tasks();

    expect(store.get_count()).toBe(1);
    expect(store.get_item(0).to_object().id).toBe('task-1');
    expect(persistenceRef.current?.save).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 'task-1' })]),
    );
  });

  it('should sort the store using the current preferences', () => {
    store.sort_tasks();

    expect(store.sort).toHaveBeenCalledWith(expect.any(Function));
  });
});
