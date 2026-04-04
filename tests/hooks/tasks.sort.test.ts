import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTaskSort } from '../../src/hooks/tasks.sort.js';
import { SortingField, SortingStrategy } from '../../src/app.enums.js';

// Mock settings hook
vi.mock('../../src/hooks/settings.js', () => ({
  useSettings: () => ({
    get_int: vi.fn(),
    get_string: vi.fn(),
    set_int: vi.fn(),
    set_string: vi.fn(),
    get_enum: vi.fn(),
    set_enum: vi.fn(),
  }),
}));

// Provide mocks for GI protocols
vi.mock('gi://Gio', () => ({ default: { Settings: vi.fn() } }));
vi.mock('gi://GLib', () => ({ default: {} }));

// Mock TaskItem - matches ITaskView interface
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

describe('useTaskSort', () => {
  const { sort_by } = useTaskSort();

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
