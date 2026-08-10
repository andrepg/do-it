import { describe, it, expect, vi, beforeEach } from 'vitest';

// GJS provides String.prototype.format at runtime; polyfill it for node
if (typeof (String.prototype as { format?: unknown }).format === 'undefined') {
  (String.prototype as unknown as { format: (...args: string[]) => string }).format = function (
    ...args: string[]
  ) {
    return String(this).replace(/%s/g, () => args.shift() ?? '');
  };
}

const { gtk, store, projectStore, toast } = vi.hoisted(() => {
  const button = {
    connect: vi.fn(),
  };

  const entryHandlers: Record<string, () => void> = {};
  const entry = {
    connect: vi.fn((signal: string, handler: () => void) => {
      entryHandlers[signal] = handler;
    }),
    get_text: vi.fn(),
    set_text: vi.fn(),
  };

  const hintLabel = {
    set_text: vi.fn(),
    set_visible: vi.fn(),
  };

  const filterHandlers: Array<(store: unknown, filter: string | null) => void> = [];

  const projectStore = {
    get_filter: vi.fn(),
    connect: vi.fn((_signal: string, handler: (store: unknown, filter: string | null) => void) => {
      filterHandlers.push(handler);
    }),
  };

  const store = {
    append_task: vi.fn(),
    persist_tasks: vi.fn(),
    get_default: () => store,
  };

  const toast = {
    showToast: vi.fn(),
  };

  return {
    gtk: { button, entry, entryHandlers, hintLabel, filterHandlers },
    store,
    projectStore,
    toast,
  };
});

vi.mock('gi://Gio', () => ({
  default: {
    SimpleAction: class {
      name: string;
      connect = vi.fn();

      constructor(config: { name: string }) {
        this.name = config.name;
      }
    },
  },
}));

vi.mock('gi://Gtk', () => ({
  default: {},
}));

vi.mock('../../src/views/doit.js', () => ({
  DoItMainWindow: class {},
}));

vi.mock('../../src/store/list-store.js', () => ({
  TaskListStore: store,
}));

vi.mock('../../src/store/project-store.js', () => ({
  ProjectStore: { get_default: () => projectStore },
}));

vi.mock('../../src/actions/toast.js', () => ({
  showToast: toast.showToast,
}));

import { newTask } from '../../src/actions/new-task.js';

import { AppSignals, WidgetIds } from '../../src/app.enums.js';
import { AppLocale } from '../../src/app.strings.js';
import { MagicFilters } from '../../src/static/sidebar.js';

const window = {
  add_action: vi.fn(),
  get_template_child: vi.fn((_gtype: unknown, id: string) => {
    if (id === WidgetIds.WindowButtonNewTask) return gtk.button;
    if (id === WidgetIds.WindowTaskNewEntry) return gtk.entry;
    if (id === WidgetIds.WindowTaskNewEntryHint) return gtk.hintLabel;
    return null;
  }),
};

describe('new task actions', () => {
  const run_setup = () => {
    const { setup } = newTask();
    setup(window);
  };

  const trigger_save = () => {
    const handler = gtk.entryHandlers[AppSignals.EntryActivated];
    expect(handler).toBeDefined();
    handler();
  };

  beforeEach(() => {
    vi.clearAllMocks();
    gtk.entryHandlers[AppSignals.EntryActivated] = undefined;
    projectStore.get_filter.mockReturnValue(MagicFilters.all);
    gtk.entry.get_text.mockReturnValue('');
  });

  it('creates the task without a project when no filter is active', () => {
    run_setup();
    gtk.entry.get_text.mockReturnValue('buy milk');

    trigger_save();

    expect(store.append_task).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'buy milk', project: '' }),
    );
    expect(store.persist_tasks).toHaveBeenCalled();
    expect(toast.showToast).toHaveBeenCalledWith(AppLocale.tasks.toast.created);
  });

  it('assigns the task to the filtered project when none is typed', () => {
    projectStore.get_filter.mockReturnValue('Work');
    run_setup();
    gtk.entry.get_text.mockReturnValue('prepare report');

    trigger_save();

    expect(store.append_task).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'prepare report', project: 'Work' }),
    );
  });

  it('keeps an explicitly typed project over the filter', () => {
    projectStore.get_filter.mockReturnValue('Work');
    run_setup();
    gtk.entry.get_text.mockReturnValue('prepare report @gym');

    trigger_save();

    expect(store.append_task).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'prepare report', project: 'Gym' }),
    );
  });

  it('keeps the task without a project for the without-project filter', () => {
    projectStore.get_filter.mockReturnValue(MagicFilters.none);
    run_setup();
    gtk.entry.get_text.mockReturnValue('clean desk');

    trigger_save();

    expect(store.append_task).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'clean desk', project: '' }),
    );
  });

  it('shows the hint label when a project filter is active', () => {
    projectStore.get_filter.mockReturnValue('Work');
    run_setup();

    expect(gtk.hintLabel.set_visible).toHaveBeenCalledWith(true);
    expect(gtk.hintLabel.set_text).toHaveBeenCalledWith(
      AppLocale.tasks.entry.projectHint.format('Work'),
    );
  });

  it('updates the hint label when the filter changes', () => {
    run_setup();
    const handler = gtk.filterHandlers[0];
    expect(handler).toBeDefined();

    projectStore.get_filter.mockReturnValue('Home');
    handler(null, 'Home');

    expect(gtk.hintLabel.set_visible).toHaveBeenCalledWith(true);
    expect(gtk.hintLabel.set_text).toHaveBeenCalledWith(
      AppLocale.tasks.entry.projectHint.format('Home'),
    );

    projectStore.get_filter.mockReturnValue(MagicFilters.all);
    handler(null, MagicFilters.all);

    expect(gtk.hintLabel.set_visible).toHaveBeenCalledWith(false);
  });

  it('updates the hint to the typed project while typing', () => {
    projectStore.get_filter.mockReturnValue('Work');
    run_setup();

    const changedHandler = gtk.entryHandlers[AppSignals.Changed];
    expect(changedHandler).toBeDefined();

    gtk.entry.get_text.mockReturnValue('prepare report @gym');
    changedHandler();

    expect(gtk.hintLabel.set_visible).toHaveBeenCalledWith(true);
    expect(gtk.hintLabel.set_text).toHaveBeenCalledWith(
      AppLocale.tasks.entry.projectHint.format('Gym'),
    );
  });

  it('reverts the hint to the filter project when the tag is removed', () => {
    projectStore.get_filter.mockReturnValue('Work');
    run_setup();

    const changedHandler = gtk.entryHandlers[AppSignals.Changed];
    expect(changedHandler).toBeDefined();

    gtk.entry.get_text.mockReturnValue('prepare report @gym');
    changedHandler();

    gtk.entry.get_text.mockReturnValue('prepare report');
    changedHandler();

    expect(gtk.hintLabel.set_visible).toHaveBeenCalledWith(true);
    expect(gtk.hintLabel.set_text).toHaveBeenLastCalledWith(
      AppLocale.tasks.entry.projectHint.format('Work'),
    );
  });
});
