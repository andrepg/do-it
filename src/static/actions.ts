/**
 * Names of all Gio SimpleActions registered by the application.
 */
export enum ActionNames {
  About = 'about',
  Quit = 'quit',
  Shortcuts = 'shortcuts',
  ExportDatabase = 'export_database',
  ImportDatabase = 'import_database',
  PurgeDeletedTasks = 'purge_deleted_tasks',
  PurgeFinishedTasks = 'purge_finished_tasks',
  ToggleSidebar = 'toggle-sidebar',
  CollapseSidebar = 'collapse-sidebar',
  ShowToast = 'show-toast',
  TaskEdit = 'task-edit',
  TaskEditSave = 'task-edit.save',
  TaskEditClose = 'task-edit.close',
  NewTask = 'new-task',
}
