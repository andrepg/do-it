import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ITask } from '../../src/app.types.js';

vi.mock('gi://GObject', () => ({
  default: {
    Object: class MockGObject {
      static registerClass() {}
      notify(_property: string) {}
      connect() {
        return 1;
      }
      disconnect() {}
      emit() {}
    },
    registerClass: () => {},
    ParamFlags: { READABLE: 1, READWRITE: 3 },
    ParamSpec: {
      string: () => ({}),
      boolean: () => ({}),
      int64: () => ({}),
    },
    TYPE_STRING: 'string',
    TYPE_OBJECT: 'object',
  },
}));

vi.mock('gi://GLib', () => ({
  default: {
    uuid_string_random: vi.fn(() => 'generated-uuid'),
  },
}));

import { Task } from '../../src/models/task.js';

describe('Task', () => {
  const fullTask = (): ITask => ({
    id: 'task-1',
    title: 'Buy milk',
    done: false,
    created_at: 1_700_000_000_000,
    project: 'Home',
    deleted: false,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should store all provided fields', () => {
      const task = new Task(fullTask());

      expect(task.taskId).toBe('task-1');
      expect(task.title).toBe('Buy milk');
      expect(task.done).toBe(false);
      expect(task.created_at).toBe(1_700_000_000_000);
      expect(task.project).toBe('Home');
      expect(task.deleted).toBe(false);
    });

    it('should default optional fields when omitted', () => {
      const task = new Task({ title: 'Test' });

      expect(task.taskId).toBe('generated-uuid');
      expect(task.title).toBe('Test');
      expect(task.done).toBe(false);
      expect(task.project).toBe('');
      expect(task.deleted).toBe(false);
    });

    it('should generate a UUID when id is not provided', () => {
      const task = new Task({ title: 'No ID' });

      expect(task.taskId).toBe('generated-uuid');
    });

    it('should use provided id over generated one', () => {
      const task = new Task({ id: 'custom-id', title: 'Has ID' });

      expect(task.taskId).toBe('custom-id');
    });

    it('should default created_at to current time when omitted', () => {
      const before = Date.now();
      const task = new Task({ title: 'Timestamped' });
      const after = Date.now();

      expect(task.created_at).toBeGreaterThanOrEqual(before);
      expect(task.created_at).toBeLessThanOrEqual(after);
    });
  });

  describe('getters', () => {
    it('should return title from data', () => {
      const task = new Task({ title: 'Walk dog', created_at: 0 });
      expect(task.title).toBe('Walk dog');
    });

    it('should return done status from data', () => {
      const task = new Task({ title: 'Done task', done: true, created_at: 0 });
      expect(task.done).toBe(true);
    });

    it('should return project from data', () => {
      const task = new Task({ title: 'Work task', project: 'Office', created_at: 0 });
      expect(task.project).toBe('Office');
    });

    it('should return deleted status from data', () => {
      const task = new Task({ title: 'Deleted task', deleted: true, created_at: 0 });
      expect(task.deleted).toBe(true);
    });

    it('should return created_at as number', () => {
      const task = new Task({ title: 'Timestamped', created_at: 1_700_000_000_000 });
      expect(task.created_at).toBe(1_700_000_000_000);
    });

    it('should return created as ISO string for sort compatibility', () => {
      const task = new Task({ title: 'Sort compat', created_at: 1_700_000_000_000 });
      expect(task.created).toBe(new Date(1_700_000_000_000).toISOString());
    });
  });

  describe('setters', () => {
    it('should update title', () => {
      const task = new Task({ title: 'Old title', created_at: 0 });
      task.title = 'New title';
      expect(task.title).toBe('New title');
    });

    it('should update done', () => {
      const task = new Task({ title: 'Task', done: false, created_at: 0 });
      task.done = true;
      expect(task.done).toBe(true);
    });

    it('should update project', () => {
      const task = new Task({ title: 'Task', project: 'Old', created_at: 0 });
      task.project = 'New';
      expect(task.project).toBe('New');
    });

    it('should update deleted', () => {
      const task = new Task({ title: 'Task', deleted: false, created_at: 0 });
      task.deleted = true;
      expect(task.deleted).toBe(true);
    });

    it('should call notify on title change', () => {
      const task = new Task({ title: 'Old', created_at: 0 });
      const spy = vi.spyOn(task, 'notify');
      task.title = 'New';
      expect(spy).toHaveBeenCalledWith('title');
    });

    it('should call notify on done change', () => {
      const task = new Task({ title: 'Task', done: false, created_at: 0 });
      const spy = vi.spyOn(task, 'notify');
      task.done = true;
      expect(spy).toHaveBeenCalledWith('done');
    });

    it('should call notify on project change', () => {
      const task = new Task({ title: 'Task', project: 'Old', created_at: 0 });
      const spy = vi.spyOn(task, 'notify');
      task.project = 'New';
      expect(spy).toHaveBeenCalledWith('project');
    });

    it('should call notify on deleted change', () => {
      const task = new Task({ title: 'Task', deleted: false, created_at: 0 });
      const spy = vi.spyOn(task, 'notify');
      task.deleted = true;
      expect(spy).toHaveBeenCalledWith('deleted');
    });

    it('should not call notify when setting same title', () => {
      const task = new Task({ title: 'Same', created_at: 0 });
      const spy = vi.spyOn(task, 'notify');
      task.title = 'Same';
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not call notify when setting same done value', () => {
      const task = new Task({ title: 'Task', done: false, created_at: 0 });
      const spy = vi.spyOn(task, 'notify');
      task.done = false;
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not call notify when setting same project', () => {
      const task = new Task({ title: 'Task', project: 'Same', created_at: 0 });
      const spy = vi.spyOn(task, 'notify');
      task.project = 'Same';
      expect(spy).not.toHaveBeenCalled();
    });

    it('should not call notify when setting same deleted value', () => {
      const task = new Task({ title: 'Task', deleted: false, created_at: 0 });
      const spy = vi.spyOn(task, 'notify');
      task.deleted = false;
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('to_object', () => {
    it('should serialize to a plain ITask object', () => {
      const data = fullTask();
      const task = new Task(data);

      expect(task.to_object()).toEqual(data);
    });

    it('should return a new object each time (not a reference)', () => {
      const task = new Task(fullTask());
      const a = task.to_object();
      const b = task.to_object();

      expect(a).toEqual(b);
      expect(a).not.toBe(b);
    });
  });

  describe('update', () => {
    it('should update all fields from an ITask', () => {
      const task = new Task(fullTask());

      task.update({
        id: 'task-2',
        title: 'Walk dog',
        done: true,
        created_at: 1_800_000_000_000,
        project: 'Office',
        deleted: true,
      });

      expect(task.taskId).toBe('task-2');
      expect(task.title).toBe('Walk dog');
      expect(task.done).toBe(true);
      expect(task.created_at).toBe(1_800_000_000_000);
      expect(task.project).toBe('Office');
      expect(task.deleted).toBe(true);
    });

    it('should preserve existing id when update has no id', () => {
      const task = new Task(fullTask());

      task.update({ title: 'Updated', created_at: 0 });

      expect(task.taskId).toBe('task-1');
    });

    it('should default done to false when omitted in update', () => {
      const task = new Task({ title: 'Task', done: true, created_at: 0 });

      task.update({ title: 'Updated', created_at: 0 });

      expect(task.done).toBe(false);
    });

    it('should default deleted to false when omitted in update', () => {
      const task = new Task({ title: 'Task', deleted: true, created_at: 0 });

      task.update({ title: 'Updated', created_at: 0 });

      expect(task.deleted).toBe(false);
    });

    it('should default project to empty string when omitted in update', () => {
      const task = new Task({ title: 'Task', project: 'Old', created_at: 0 });

      task.update({ title: 'Updated', created_at: 0 });

      expect(task.project).toBe('');
    });

    it('should call notify for each changed property', () => {
      const task = new Task(fullTask());
      const spy = vi.spyOn(task, 'notify');

      task.update({
        id: 'task-1',
        title: 'New title',
        done: true,
        created_at: 1_700_000_000_000,
        project: 'New project',
        deleted: true,
      });

      expect(spy).toHaveBeenCalledWith('title');
      expect(spy).toHaveBeenCalledWith('done');
      expect(spy).toHaveBeenCalledWith('deleted');
      expect(spy).toHaveBeenCalledWith('project');
    });
  });
});
