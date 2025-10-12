export const RESPONSES = {
  cancel: {
    action: 'cancel',
    label: "_Cancel",
  },
  confirm: {
    action: 'delete',
    label: "_Delete",

  },
}


export const TASK_DELETE_ICON = {
  default: "user-trash-symbolic",
  deleted: "rotation-allowed-symbolic",

  getIcon: (state) => state !== ""
    ? TASK_DELETE_ICON.deleted
    : TASK_DELETE_ICON.default
}

export const TASK_DELETE_TOOLTIP = {}
