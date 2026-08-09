import { describe, it, expect, vi, beforeEach } from 'vitest';

const { gtk, adw, persistence, store, toast, log } = vi.hoisted(() => {
  const openHandlers: Array<(dialog: unknown, result: unknown) => void> = [];
  const chooseHandlers: Array<(dialog: unknown, result: unknown) => void> = [];

  const file = {
    get_basename: vi.fn(() => 'doit-tasks.json'),
    load_contents: vi.fn(() => [true, new TextEncoder().encode('[{"id":"1"}]')]),
  };

  const alertDialog = {
    _response: 'import',
    add_response: vi.fn(),
    set_response_appearance: vi.fn(),
    set_default_response: vi.fn(),
    set_close_response: vi.fn(),
    present: vi.fn(),
    choose: vi.fn(
      (_parent: unknown, _cancellable: unknown, callback: (d: unknown, r: unknown) => void) => {
        chooseHandlers.push(callback);
      },
    ),
    choose_finish: vi.fn(() => alertDialog._response),
  };

  const fileDialog = {
    open: vi.fn(
      (_parent: unknown, _cancellable: unknown, callback: (d: unknown, r: unknown) => void) => {
        openHandlers.push(callback);
      },
    ),
    open_finish: vi.fn(() => file),
  };

  const gtk = {
    fileDialog,
    file,
    openHandlers,
  };

  const adw = {
    alertDialog,
    chooseHandlers,
    ResponseAppearance: { DESTRUCTIVE: 'destructive' },
  };

  const persistence = {
    save: vi.fn(),
    load: vi.fn(() => []),
  };

  const store = {
    reload_tasks: vi.fn(),
    get_default: () => store,
  };

  const toast = {
    showToast: vi.fn(),
  };

  const log = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  return { gtk, adw, persistence, store, toast, log };
});

vi.mock('gi://Gio', () => ({
  default: {
    SimpleAction: class {
      constructor(config: { name: string }) {
        this.name = config.name;
      }
      name: string;
      connect = vi.fn((_signal: string, handler: () => void) => {
        (this as unknown as { handler: () => void }).handler = handler;
        return 0;
      });
    },
  },
}));

vi.mock('gi://Gtk', () => ({
  default: {
    FileDialog: class {
      constructor() {}
      open = gtk.fileDialog.open;
      open_finish = gtk.fileDialog.open_finish;
      save = vi.fn();
      save_finish = vi.fn();
    },
  },
}));

vi.mock('gi://Adw', () => ({
  default: {
    AlertDialog: class {
      constructor(config: Record<string, string>) {
        adw.alertDialog.heading = config.heading;
        adw.alertDialog.body = config.body;
      }
      add_response = adw.alertDialog.add_response;
      set_response_appearance = adw.alertDialog.set_response_appearance;
      set_default_response = adw.alertDialog.set_default_response;
      set_close_response = adw.alertDialog.set_close_response;
      present = adw.alertDialog.present;
      choose = adw.alertDialog.choose;
      choose_finish = adw.alertDialog.choose_finish;
    },
    ResponseAppearance: { DESTRUCTIVE: 'destructive' },
  },
}));

vi.mock('../../src/persistence/gio-persistence.js', () => ({
  GioFilePersistence: class {
    save = persistence.save;
    load = persistence.load;
  },
}));

vi.mock('../../src/store/list-store.js', () => ({
  TaskListStore: store,
}));

vi.mock('../../src/actions/toast.js', () => ({
  showToast: toast.showToast,
}));

vi.mock('../../src/utils/log-manager.js', () => ({
  log: log.log,
  warn: log.warn,
  error: log.error,
}));

import backup from '../../src/actions/backup.js';

import { AppLocale } from '../../src/app.strings.js';

import { ActionNames } from '../../src/static/actions.js';

type MockAction = {
  name: string;
  handler: (() => void) | undefined;
  connect: ReturnType<typeof vi.fn>;
};

describe('backup actions', () => {
  const parent = {};
  const { setup } = backup();

  const window = {
    add_action: vi.fn((action: MockAction) => {
      window.actions.push(action);
    }),
    actions: [] as MockAction[],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.actions = [];
    adw.alertDialog._response = 'import';
    gtk.file.get_basename.mockReturnValue('doit-tasks.json');
    gtk.file.load_contents.mockReturnValue([true, new TextEncoder().encode('[{"id":"1"}]')]);

    setup(window);
  });

  const trigger_import = () => {
    const action = window.actions.find((a) => a.name === ActionNames.ImportDatabase);
    expect(action).toBeDefined();
    action?.handler?.();
  };

  it('registers export and import actions on the window', () => {
    expect(window.actions.map((a) => a.name)).toEqual([
      ActionNames.ExportDatabase,
      ActionNames.ImportDatabase,
    ]);
  });

  it('asks for confirmation before importing the selected file', () => {
    trigger_import();
    const openHandler = gtk.openHandlers[0];
    openHandler(gtk.fileDialog, {});

    expect(gtk.fileDialog.open).toHaveBeenCalled();
    expect(adw.alertDialog.add_response).toHaveBeenCalledWith(
      'cancel',
      AppLocale.app.common.discard,
    );
    expect(adw.alertDialog.add_response).toHaveBeenCalledWith(
      'import',
      AppLocale.app.backup.importConfirmAction,
    );
    expect(adw.alertDialog.set_response_appearance).toHaveBeenCalledWith('import', 'destructive');
    expect(adw.alertDialog.set_default_response).toHaveBeenCalledWith('cancel');
    expect(adw.alertDialog.set_close_response).toHaveBeenCalledWith('cancel');
    expect(adw.alertDialog.body).toContain('doit-tasks.json');
    expect(persistence.save).not.toHaveBeenCalled();
  });

  it('imports the database when the user confirms', () => {
    trigger_import();

    const openHandler = gtk.openHandlers[0];
    openHandler(gtk.fileDialog, {});
    expect(adw.alertDialog.choose).toHaveBeenCalled();

    const chooseHandler = adw.chooseHandlers[0];
    chooseHandler(adw.alertDialog, {});
    expect(persistence.save).toHaveBeenCalledWith([{ id: '1' }]);
    expect(store.reload_tasks).toHaveBeenCalled();
    expect(toast.showToast).toHaveBeenCalledWith(AppLocale.app.backup.importSuccess);
  });

  it('does not import the database when the user discards', () => {
    adw.alertDialog._response = 'cancel';
    trigger_import();

    const openHandler = gtk.openHandlers[0];
    openHandler(gtk.fileDialog, {});
    expect(adw.alertDialog.choose).toHaveBeenCalled();

    const chooseHandler = adw.chooseHandlers[0];
    chooseHandler(adw.alertDialog, {});
    expect(persistence.save).not.toHaveBeenCalled();
    expect(store.reload_tasks).not.toHaveBeenCalled();
  });
});
