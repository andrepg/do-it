import { describe, it, expect, vi, beforeEach } from 'vitest';

import { WidgetIds } from '../../src/app.enums.js';

const { gtk, store, taskStore } = vi.hoisted(() => {
  const keyHandlers: Record<string, (...args: unknown[]) => boolean | void> = {};
  const emittedSignals: string[] = [];
  const addController = vi.fn();

  const makeEntry = () => {
    let text = '';
    return {
      set_text: vi.fn((value: string) => {
        text = value;
      }),
      get_text: vi.fn(() => text),
    };
  };

  const makeCheck = () => {
    let active = false;
    return {
      set_active: vi.fn((value: boolean) => {
        active = value;
      }),
      get_active: vi.fn(() => active),
    };
  };

  const makeButton = () => ({
    connect: vi.fn(),
  });

  const children: Record<string, unknown> = {
    task_form_entry_title: makeEntry(),
    task_form_entry_project: makeEntry(),
    task_form_check_done: makeCheck(),
    task_form_btn_delete: makeButton(),
    task_form_btn_save: makeButton(),
    task_form_btn_discard: makeButton(),
  };

  const gtk = {
    children,
    keyHandlers,
    emittedSignals,
    addController,
    keyController: {
      connect: vi.fn((signal: string, handler: (...args: unknown[]) => boolean | void) => {
        keyHandlers[signal] = handler;
      }),
    },
  };

  const store = {
    find_by_id: vi.fn(),
  };

  const taskStore = {
    get_default: () => store,
  };

  return { gtk, store, taskStore };
});

vi.mock('gi://Gtk', () => ({
  default: {
    Box: class {
      add_controller = gtk.addController;
      get_template_child = vi.fn((_gtype: unknown, id: string) => gtk.children[id] ?? null);
      emit = vi.fn((signal: string) => {
        gtk.emittedSignals.push(signal);
      });
    },
    CheckButton: class {
      set_active() {}
      get_active() {
        return false;
      }
    },
    Button: class {
      connect() {}
    },
    EventControllerKey: class {
      connect = gtk.keyController.connect;
    },
  },
}));

vi.mock('gi://Gdk', () => ({
  default: {
    KEY_Escape: 0xff1b,
  },
}));

vi.mock('gi://Adw', () => ({
  default: {},
}));

vi.mock('../../src/store/list-store.js', () => ({
  TaskListStore: taskStore,
}));

vi.mock('../../src/models/task.js', () => ({
  Task: class MockTask {
    constructor(public data: Record<string, unknown>) {}
    to_object() {
      return this.data;
    }
    update(data: Record<string, unknown>) {
      Object.assign(this.data, data);
    }
    get taskId() {
      return this.data.id;
    }
    get title() {
      return this.data.title;
    }
    get project() {
      return this.data.project;
    }
    get done() {
      return this.data.done;
    }
    get deleted() {
      return this.data.deleted;
    }
  },
}));

vi.mock('../../src/actions/toast.js', () => ({
  showToast: vi.fn(),
}));

vi.mock('../../src/utils/log-manager.js', () => ({
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

import { TaskForm } from '../../src/views/task-form.js';
import { showToast } from '../../src/actions/toast.js';
import { Task } from '../../src/models/task.js';

describe('TaskForm', () => {
  let form: TaskForm;
  let mockTask: {
    to_object: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    taskId: string;
    title: string;
    project: string;
    done: boolean;
    deleted: boolean;
  };

  const taskData = () => ({
    id: 'task-1',
    title: 'Buy milk',
    project: 'Home',
    done: false,
    created_at: 1_700_000_000_000,
    deleted: false,
  });

  const titleEntry = () =>
    gtk.children[WidgetIds.TaskFormEntryTitle] as ReturnType<typeof vi.fn> & {
      set_text: ReturnType<typeof vi.fn>;
      get_text: ReturnType<typeof vi.fn>;
    };

  const projectEntry = () =>
    gtk.children[WidgetIds.TaskFormEntryProject] as ReturnType<typeof vi.fn> & {
      set_text: ReturnType<typeof vi.fn>;
      get_text: ReturnType<typeof vi.fn>;
    };

  const doneCheck = () =>
    gtk.children[WidgetIds.TaskFormCheckDone] as ReturnType<typeof vi.fn> & {
      set_active: ReturnType<typeof vi.fn>;
      get_active: ReturnType<typeof vi.fn>;
    };

  beforeEach(() => {
    vi.clearAllMocks();

    gtk.emittedSignals.length = 0;
    Object.values(gtk.keyHandlers).forEach((handler) => delete gtk.keyHandlers[handler as never]);

    const data = taskData();
    mockTask = {
      to_object: vi.fn(() => ({ ...data })),
      update: vi.fn(),
      taskId: data.id,
      title: data.title,
      project: data.project,
      done: data.done,
      deleted: data.deleted,
    };

    store.find_by_id.mockReturnValue(mockTask);

    form = new TaskForm();
  });

  it('should report no loaded task when empty', () => {
    expect(form.has_task_loaded()).toBe(false);
  });

  it('should load a task and populate the form fields', () => {
    const data = taskData();

    form.load_task(data.id);

    expect(form.has_task_loaded()).toBe(true);
    expect(store.find_by_id).toHaveBeenCalledWith(data.id);
    expect(titleEntry().set_text).toHaveBeenCalledWith(data.title);
    expect(projectEntry().set_text).toHaveBeenCalledWith(data.project);
    expect(doneCheck().set_active).toHaveBeenCalledWith(false);
  });

  it('should not populate fields when the task is not found', () => {
    store.find_by_id.mockReturnValue(undefined);

    form.load_task('missing-task');

    expect(form.has_task_loaded()).toBe(true);
    expect(titleEntry().set_text).not.toHaveBeenCalled();
  });

  it('should show an error toast when saving with an empty title', () => {
    form.load_task('task-1');
    titleEntry().get_text.mockReturnValue('   ');

    form.dispatch_save();

    expect(showToast).toHaveBeenCalled();
    expect(mockTask.update).not.toHaveBeenCalled();
    expect(gtk.emittedSignals).not.toContain('task-form-closed');
  });

  it('should save the task and close the form', () => {
    form.load_task('task-1');

    titleEntry().get_text.mockReturnValue('  Buy milk  ');
    projectEntry().get_text.mockReturnValue('Home');
    doneCheck().get_active.mockReturnValue(true);

    form.dispatch_save();

    expect(mockTask.update).toHaveBeenCalledWith({
      ...taskData(),
      title: 'Buy milk',
      project: 'Home',
      done: true,
    });
    expect(showToast).toHaveBeenCalled();
    expect(gtk.emittedSignals).toContain('task-form-closed');
  });

  it('should clear the form and emit close on cancel', () => {
    form.load_task('task-1');

    form.dispatch_cancel();

    expect(form.has_task_loaded()).toBe(false);
    expect(gtk.emittedSignals).toContain('task-form-closed');
  });

  it('should mark the loaded task as deleted and close the form', () => {
    form.load_task('task-1');

    (
      gtk.children[WidgetIds.TaskFormBtnDelete] as { connect: ReturnType<typeof vi.fn> }
    ).connect.mock.calls[0][1]();

    expect(mockTask.update).toHaveBeenCalledWith({
      ...taskData(),
      deleted: true,
    });
    expect(gtk.emittedSignals).toContain('task-form-closed');
  });

  it('should not delete when no task is loaded', () => {
    (
      gtk.children[WidgetIds.TaskFormBtnDelete] as { connect: ReturnType<typeof vi.fn> }
    ).connect.mock.calls[0][1]();

    expect(mockTask.update).not.toHaveBeenCalled();
    expect(gtk.emittedSignals).not.toContain('task-form-closed');
  });

  it('should cancel the form when the Escape key is pressed', () => {
    form.load_task('task-1');

    const handler = gtk.keyHandlers['key-pressed'];
    const result = handler?.({}, 0xff1b);

    expect(result).toBe(true);
    expect(gtk.emittedSignals).toContain('task-form-closed');
  });
});
