import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sort_by } from '../../src/utils/tasks.sort.js';
import { SortingField, SortingStrategy } from '../../src/app.enums.js';
import type { ProjectGroupEntry } from '../../src/utils/task-grouping.js';

const { settingsMock } = vi.hoisted(() => ({
  settingsMock: {
    get_int: vi.fn(),
    get_string: vi.fn(),
    set_int: vi.fn(),
    set_string: vi.fn(),
    get_enum: vi.fn(),
    set_enum: vi.fn(),
  },
}));

// Mock settings module
vi.mock('../../src/utils/settings.js', () => ({
  get_settings: () => settingsMock,
}));

// Provide mocks for GI protocols
vi.mock('gi://Gio', () => ({ default: { Settings: vi.fn() } }));
vi.mock('gi://GLib', () => ({ default: {} }));

// Mock TaskItem - matches SortableTask interface
const createMockTask = (overrides: any) => ({
  taskId: '1',
  title: 'Task',
  project: 'Project',
  done: false,
  deleted: false,
  created: '2024-01-01T00:00:00.000Z',
  ...overrides,
  to_object: function () {
    return {
      id: this.taskId,
      title: this.title,
      project: this.project,
      done: this.done,
      created_at: new Date(this.created).getTime(),
      deleted: this.deleted,
    };
  },
});

describe('sort_by', () => {
  it('should sort by title ascending', () => {
    const taskA = createMockTask({ title: 'B' });
    const taskB = createMockTask({ title: 'A' });
    const taskC = createMockTask({ title: 'C' });

    const comparator = sort_by(SortingField.byTitle, SortingStrategy.ascending);
    const sorted = [taskA, taskB, taskC].sort(comparator as any);

    expect((sorted[0] as any).to_object().title).toBe('A');
    expect((sorted[1] as any).to_object().title).toBe('B');
    expect((sorted[2] as any).to_object().title).toBe('C');
  });

  it('should sort by title descending', () => {
    const taskA = createMockTask({ title: 'B' });
    const taskB = createMockTask({ title: 'A' });
    const taskC = createMockTask({ title: 'C' });

    const comparator = sort_by(SortingField.byTitle, SortingStrategy.descending);
    const sorted = [taskA, taskB, taskC].sort(comparator as any);

    expect((sorted[0] as any).to_object().title).toBe('C');
    expect((sorted[1] as any).to_object().title).toBe('B');
    expect((sorted[2] as any).to_object().title).toBe('A');
  });

  it('should sort by status (undone first)', () => {
    const taskA = createMockTask({ done: true });
    const taskB = createMockTask({ done: false });

    const comparator = sort_by(SortingField.byStatus, SortingStrategy.ascending);
    const sorted = [taskA, taskB].sort(comparator as any);

    expect((sorted[0] as any).to_object().done).toBe(false);
    expect((sorted[1] as any).to_object().done).toBe(true);
  });

  it('should sort by date', () => {
    const taskA = createMockTask({ created: '2024-01-02T00:00:00.000Z' });
    const taskB = createMockTask({ created: '2024-01-01T00:00:00.000Z' });

    const comparator = sort_by(SortingField.byDate, SortingStrategy.ascending);
    const sorted = [taskA, taskB].sort(comparator as any);

    const createdA = new Date((sorted[0] as any).created).getTime();
    const createdB = new Date((sorted[1] as any).created).getTime();
    expect(createdA).toBeLessThan(createdB);
  });

  it('should sort by project', () => {
    const taskA = createMockTask({ project: 'Work' });
    const taskB = createMockTask({ project: 'Home' });

    const comparator = sort_by(SortingField.byProject, SortingStrategy.ascending);
    const sorted = [taskA, taskB].sort(comparator as any);

    expect((sorted[0] as any).to_object().project).toBe('Home');
    expect((sorted[1] as any).to_object().project).toBe('Work');
  });
});

describe('retrieve_sort_preferences', () => {
  it('should return persisted sorting mode and strategy', async () => {
    settingsMock.get_string.mockReturnValue(SortingField.byStatus);
    settingsMock.get_enum.mockReturnValue(SortingStrategy.descending);

    const { retrieve_sort_preferences } = await import('../../src/utils/tasks.sort.js');

    const prefs = retrieve_sort_preferences();

    expect(prefs).toEqual({
      mode: SortingField.byStatus,
      strategy: SortingStrategy.descending,
    });
    expect(settingsMock.get_string).toHaveBeenCalledWith('sorting-mode');
    expect(settingsMock.get_enum).toHaveBeenCalledWith('sorting-strategy');
  });

  it('should fall back to title ascending when nothing is persisted', async () => {
    settingsMock.get_string.mockReturnValue('');
    settingsMock.get_enum.mockReturnValue(0);

    const { retrieve_sort_preferences } = await import('../../src/utils/tasks.sort.js');

    const prefs = retrieve_sort_preferences();

    expect(prefs).toEqual({
      mode: SortingField.byTitle,
      strategy: SortingStrategy.ascending,
    });
  });
});

describe('persist_sort_preferences', () => {
  it('should persist the given sorting mode and strategy', async () => {
    const { persist_sort_preferences } = await import('../../src/utils/tasks.sort.js');

    persist_sort_preferences(SortingField.byProject, SortingStrategy.descending);

    expect(settingsMock.set_string).toHaveBeenCalledWith('sorting-mode', SortingField.byProject);
    expect(settingsMock.set_enum).toHaveBeenCalledWith(
      'sorting-strategy',
      SortingStrategy.descending,
    );
  });
});

describe('order_projects', () => {
  const makeGroups = (...projects: string[]): Map<string, ProjectGroupEntry> => {
    const map = new Map<string, ProjectGroupEntry>();
    for (const p of projects) {
      map.set(p, { tasks: [], finished: 0, deleted: 0 });
    }
    return map;
  };

  it('should pin empty project first regardless of sort mode', async () => {
    settingsMock.get_string.mockReturnValue(SortingField.byTitle);
    settingsMock.get_enum.mockReturnValue(SortingStrategy.ascending);

    const { order_projects } = await import('../../src/utils/tasks.sort.js');
    const groups = makeGroups('Work', 'Home', '');

    expect(order_projects(groups)).toEqual(['', 'Home', 'Work']);
  });

  it('should sort alphabetically when not sorting by project', async () => {
    settingsMock.get_string.mockReturnValue(SortingField.byTitle);
    settingsMock.get_enum.mockReturnValue(SortingStrategy.ascending);

    const { order_projects } = await import('../../src/utils/tasks.sort.js');
    const groups = makeGroups('Zebra', 'Apple', 'Mango');

    expect(order_projects(groups)).toEqual(['Apple', 'Mango', 'Zebra']);
  });

  it('should sort by project name ascending when mode is byProject', async () => {
    settingsMock.get_string.mockReturnValue(SortingField.byProject);
    settingsMock.get_enum.mockReturnValue(SortingStrategy.ascending);

    const { order_projects } = await import('../../src/utils/tasks.sort.js');
    const groups = makeGroups('Zebra', 'Apple', '');

    expect(order_projects(groups)).toEqual(['', 'Apple', 'Zebra']);
  });

  it('should sort by project name descending when mode is byProject', async () => {
    settingsMock.get_string.mockReturnValue(SortingField.byProject);
    settingsMock.get_enum.mockReturnValue(SortingStrategy.descending);

    const { order_projects } = await import('../../src/utils/tasks.sort.js');
    const groups = makeGroups('Apple', 'Zebra', '');

    expect(order_projects(groups)).toEqual(['', 'Zebra', 'Apple']);
  });

  it('should return empty array for empty groups', async () => {
    settingsMock.get_string.mockReturnValue(SortingField.byTitle);
    settingsMock.get_enum.mockReturnValue(SortingStrategy.ascending);

    const { order_projects } = await import('../../src/utils/tasks.sort.js');
    const groups = new Map<string, ProjectGroupEntry>();

    expect(order_projects(groups)).toEqual([]);
  });
});
