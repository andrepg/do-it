import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTaskSort } from '../../src/hooks/tasks.sort.js';
import { SortingField, SortingStrategy } from '../../src/app.enums.js';

// Mock settings
vi.mock('../../src/utils/settings.js', () => ({
  get_setting_int: vi.fn(),
  get_setting_string: vi.fn(),
  set_setting_int: vi.fn(),
  set_setting_string: vi.fn(),
}));

// Mock TaskItem
const createMockTask = (overrides: any) => ({
  to_object: () => ({
    id: 1,
    title: 'Task',
    project: 'Project',
    done: false,
    created_at: 1000,
    deleted: false,
    tags: [],
    ...overrides,
  }),
});

describe('useTaskSort', () => {
  const { sort_by } = useTaskSort();

  it('should sort by title ascending', () => {
    const taskA = createMockTask({ title: 'B' });
    const taskB = createMockTask({ title: 'A' });
    const taskC = createMockTask({ title: 'C' });

    const comparator = sort_by(SortingField.byTitle, SortingStrategy.ascending);
    const sorted = [taskA, taskB, taskC].sort(comparator);

    expect((sorted[0] as any).to_object().title).toBe('A');
    expect((sorted[1] as any).to_object().title).toBe('B');
    expect((sorted[2] as any).to_object().title).toBe('C');
  });

  it('should sort by title descending', () => {
    const taskA = createMockTask({ title: 'B' });
    const taskB = createMockTask({ title: 'A' });
    const taskC = createMockTask({ title: 'C' });

    const comparator = sort_by(SortingField.byTitle, SortingStrategy.descending);
    const sorted = [taskA, taskB, taskC].sort(comparator);

    expect((sorted[0] as any).to_object().title).toBe('C');
    expect((sorted[1] as any).to_object().title).toBe('B');
    expect((sorted[2] as any).to_object().title).toBe('A');
  });

  it('should sort by status (undone first)', () => {
    const taskA = createMockTask({ done: true });
    const taskB = createMockTask({ done: false });

    const comparator = sort_by(SortingField.byStatus, SortingStrategy.ascending);
    const sorted = [taskA, taskB].sort(comparator);

    expect((sorted[0] as any).to_object().done).toBe(false);
    expect((sorted[1] as any).to_object().done).toBe(true);
  });

  it('should sort by date', () => {
    const taskA = createMockTask({ created_at: 2000 });
    const taskB = createMockTask({ created_at: 1000 });

    const comparator = sort_by(SortingField.byDate, SortingStrategy.ascending);
    const sorted = [taskA, taskB].sort(comparator);

    expect((sorted[0] as any).to_object().created_at).toBe(1000);
    expect((sorted[1] as any).to_object().created_at).toBe(2000);
  });

  it('should sort by project', () => {
    const taskA = createMockTask({ project: 'Work' });
    const taskB = createMockTask({ project: 'Home' });

    const comparator = sort_by(SortingField.byProject, SortingStrategy.ascending);
    const sorted = [taskA, taskB].sort(comparator);

    expect((sorted[0] as any).to_object().project).toBe('Home');
    expect((sorted[1] as any).to_object().project).toBe('Work');
  });
});
