/**
 * Message catalog for debugging purposes.
 *
 * These messages are logged to the console when the application runs in
 * development mode.
 */
export const AppDebug = {
  APPLICATION_INIT: 'Initializing application actions',
  WINDOW_CREATE: 'Creating main window',
  DEV_MODE: 'Development mode enabled',
  APP_SHUTDOWN: 'Shutting down application',

  WIDGET_INIT: 'Widgets initialized',
  ACTION_INIT: 'Actions initialized',
  PROJECT_STORE_INIT: 'Project store initialized',

  WINDOW_CLOSE_REQUEST: 'Shutting down application',
  WINDOW_PERSIST_SIZE: 'Saving window size before closing',

  TASK_STORE_INIT: 'Task store initialized',
  TASK_STORE_PERSIST: 'Persisting tasks',
  TASK_STORE_LOAD: 'Loading tasks...',
  TASK_STORE_LOAD_FAILED: 'Failed to load tasks - ',
  TASK_STORE_APPEND: 'Appending task to list store - ',

  TASK_FORM_CONNECT: 'Connecting form signals and reactions',
  TASK_FORM_INIT: 'Initializing widget instances',
  TASK_FORM_LOAD: 'Loading task: ',
  TASK_FORM_LOAD_FAILED: 'Failed to find task: ',
  TASK_FORM_NO_TASK: 'No task loaded to save',
  TASK_FORM_UPDATE: 'Updating task in store: ',
  TASK_FORM_SAVE: 'Dispatching save action',
  TASK_FORM_CANCEL: 'Dispatching cancel/close action',
  TASK_FORM_DELETE: 'Dispatching delete action',

  TASK_EDIT_CLOSE: 'Task form closed signal received, closing bottom sheet',

  SIDEBAR_SPLIT_VIEW_MISSING: 'Failed to get split_view object',
  TOAST_NO_WINDOW: 'No active window found, skipping toast',

  PERSISTENCE_CREATE: 'First app execution. Creating database',
  PERSISTENCE_CREATE_ERROR: 'Error creating database',
};
