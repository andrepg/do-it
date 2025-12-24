import Gtk from "gi://Gtk";

const TASK_DELETE_ICON = {
  default: "user-trash-symbolic",
  deleted: "rotation-allowed-symbolic"
}

export const TASK_DELETE_TOOLTIP = {}

export const getTaskIcon = (deleted) => deleted !== ''
  ? TASK_DELETE_ICON.deleted
  : TASK_DELETE_ICON.default;
