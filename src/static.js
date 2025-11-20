const TASK_DELETE_ICON = {
  default: "user-trash-symbolic",
  deleted: "rotation-allowed-symbolic"
}

export const TASK_DELETE_TOOLTIP = {}

export const getTaskIcon = (deleted) => deleted !== ''
  ? TASK_DELETE_ICON.deleted
  : TASK_DELETE_ICON.default;

export function about_dialog_params() {
  return {
    application_name: "Do It",
    application_icon: 'io.github.andrepg.Doit',
    developer_name: 'André Paul Grandsire',
    version: pkg.version,
    developers: [
      'André Paul Grandsire'
    ],
    // Translators: Replace "translator-credits" with your
    // name/username, and optionally an email or URL.
    translator_credits: _("translators-credits"),
    copyright: '© 2025 André Paul Grandsire'
  };
}
