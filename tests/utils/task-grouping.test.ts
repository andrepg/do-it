import { describe, it, expect, vi } from 'vitest';

vi.mock('gi://Gio', () => ({ default: { Settings: vi.fn() } }));
vi.mock('gi://GLib', () => ({ default: {} }));
vi.mock('../../src/utils/settings.js', () => ({
  get_settings: () => ({
    get_string: vi.fn(),
    get_enum: vi.fn(),
  }),
}));

import { collect_project_groups, is_group_visible } from '../../src/utils/task-grouping.js';
import { MagicFilters } from '../../src/static/sidebar.js';

const makeTask = (overrides: Record<string, unknown> = {}) => ({
  taskId: '1',
  title: 'Task',
  project: '',
  done: false,
  deleted: false,
  created: '2024-01-01T00:00:00.000Z',
  created_at: 0,
  ...overrides,
});

describe('collect_project_groups', () => {
  it('should return an empty map for an empty array', () => {
    const groups = collect_project_groups([]);
    expect(groups.size).toBe(0);
  });

  it('should group tasks by project', () => {
    const tasks = [
      makeTask({ project: 'Home', title: 'A' }),
      makeTask({ project: 'Work', title: 'B' }),
      makeTask({ project: 'Home', title: 'C' }),
    ];

    const groups = collect_project_groups(tasks as any);

    expect(groups.size).toBe(2);
    expect(groups.get('Home')?.tasks).toHaveLength(2);
    expect(groups.get('Work')?.tasks).toHaveLength(1);
  });

  it('should count finished tasks per project', () => {
    const tasks = [
      makeTask({ project: 'Home', done: true }),
      makeTask({ project: 'Home', done: false }),
      makeTask({ project: 'Work', done: true }),
    ];

    const groups = collect_project_groups(tasks as any);

    expect(groups.get('Home')?.finished).toBe(1);
    expect(groups.get('Work')?.finished).toBe(1);
  });

  it('should count deleted tasks per project', () => {
    const tasks = [
      makeTask({ project: 'Home', deleted: true }),
      makeTask({ project: 'Home', deleted: false }),
      makeTask({ project: 'Home', deleted: true }),
    ];

    const groups = collect_project_groups(tasks as any);

    expect(groups.get('Home')?.deleted).toBe(2);
  });

  it('should group tasks without a project under empty string key', () => {
    const tasks = [makeTask({ project: '' }), makeTask({ project: '' })];

    const groups = collect_project_groups(tasks as any);

    expect(groups.size).toBe(1);
    expect(groups.get('')?.tasks).toHaveLength(2);
  });

  it('should preserve task order within each group', () => {
    const tasks = [
      makeTask({ project: 'Home', title: 'First' }),
      makeTask({ project: 'Home', title: 'Second' }),
      makeTask({ project: 'Home', title: 'Third' }),
    ];

    const groups = collect_project_groups(tasks as any);
    const titles = groups.get('Home')?.tasks.map((t) => t.title);

    expect(titles).toEqual(['First', 'Second', 'Third']);
  });
});

describe('is_group_visible', () => {
  it('should return true when filter is null', () => {
    expect(is_group_visible('Home', null)).toBe(true);
  });

  it('should return true when filter is ALL', () => {
    expect(is_group_visible('Home', MagicFilters.all)).toBe(true);
  });

  it('should return true for empty project when filter is NONE', () => {
    expect(is_group_visible('', MagicFilters.none)).toBe(true);
  });

  it('should return false for named project when filter is NONE', () => {
    expect(is_group_visible('Home', MagicFilters.none)).toBe(false);
  });

  it('should return true when project matches filter', () => {
    expect(is_group_visible('Home', 'Home')).toBe(true);
  });

  it('should return false when project does not match filter', () => {
    expect(is_group_visible('Home', 'Work')).toBe(false);
  });
});
