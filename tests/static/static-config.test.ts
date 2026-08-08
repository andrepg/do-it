import { describe, it, expect } from 'vitest';

import { GeneralSectionItems, MagicFilters } from '../../src/static/sidebar.js';
import {
  SymbolicIcons,
  TaskEntryOpacity,
  TaskEntryStyle,
  TaskDeleteButtonIcon,
} from '../../src/static/tasks.js';
import { DoItSettings, SortingModeSchema } from '../../src/static/settings.js';
import { AppDebug } from '../../src/static/messages.js';
import { ActionNames } from '../../src/static/actions.js';
import { SortingFieldOptions, SortingModeOptions } from '../../src/static/sorting.js';
import { SortingField, SortingStrategy } from '../../src/app.enums.js';

describe('sidebar static config', () => {
  it('should define magic filters for all and none', () => {
    expect(MagicFilters.all).toBe('__ALL__');
    expect(MagicFilters.none).toBe('__NONE__');
  });

  it('should expose the general section items with their filters', () => {
    expect(GeneralSectionItems).toHaveLength(2);
    expect(GeneralSectionItems[0].filter).toBe(MagicFilters.all);
    expect(GeneralSectionItems[1].filter).toBe(MagicFilters.none);
  });
});

describe('tasks static config', () => {
  it('should expose symbolic icons', () => {
    expect(SymbolicIcons.tasks.new_task).toBe('appointment-new-symbolic');
    expect(SymbolicIcons.sidebar.folder).toBe('folder-symbolic');
  });

  it('should expose task entry opacity values', () => {
    expect(TaskEntryOpacity.enabled).toBe(1);
    expect(TaskEntryOpacity.done).toBe(0.6);
    expect(TaskEntryOpacity.deleted).toBe(0.3);
  });

  it('should map entry styles to opacity values', () => {
    expect(TaskEntryStyle.done.opacity).toBe(TaskEntryOpacity.done);
    expect(TaskEntryStyle.deleted.opacity).toBe(TaskEntryOpacity.deleted);
  });

  it('should toggle the delete button icon based on state', () => {
    expect(TaskDeleteButtonIcon.default).toBe(SymbolicIcons.tasks.trash_bin);
    expect(TaskDeleteButtonIcon.deleted).toBe(SymbolicIcons.tasks.undo);
  });
});

describe('settings static config', () => {
  it('should expose window settings keys', () => {
    expect(DoItSettings.windowHeight).toBe('window-height');
    expect(DoItSettings.windowWidth).toBe('window-width');
  });

  it('should expose sorting schema keys', () => {
    expect(SortingModeSchema.MODE).toBe('sorting-mode');
    expect(SortingModeSchema.STRATEGY).toBe('sorting-strategy');
  });
});

describe('messages static config', () => {
  it('should expose debug message keys', () => {
    expect(AppDebug.TASK_STORE_PERSIST).toBe('Persisting tasks');
    expect(AppDebug.PERSISTENCE_CREATE).toBe('First app execution. Creating database');
  });
});

describe('actions static config', () => {
  it('should expose action names', () => {
    expect(ActionNames.TaskEdit).toBe('task-edit');
    expect(ActionNames.NewTask).toBe('new-task');
    expect(ActionNames.ToggleSidebar).toBe('toggle-sidebar');
  });
});

describe('sorting static config', () => {
  it('should expose an option for each sorting field', () => {
    expect(SortingFieldOptions).toHaveLength(4);
    expect(SortingFieldOptions.map((o) => o.mode)).toEqual(
      expect.arrayContaining([
        SortingField.byDate,
        SortingField.byProject,
        SortingField.byStatus,
        SortingField.byTitle,
      ]),
    );
  });

  it('should expose an option for each sorting strategy', () => {
    expect(SortingModeOptions).toHaveLength(2);
    expect(SortingModeOptions.map((o) => o.strategy)).toEqual(
      expect.arrayContaining([SortingStrategy.ascending, SortingStrategy.descending]),
    );
  });
});
