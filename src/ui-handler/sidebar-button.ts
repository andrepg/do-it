import Gtk40 from 'gi://Gtk';
import GObject from 'gi://GObject';

import { get_template_path } from '../utils/application.js';
import Adw1 from 'gi://Adw';

const GObjectProperties = {
  GTypeName: "SidebarButton",
  Template: get_template_path('ui/sidebar-button.ui'),
  Properties: {
    'project': GObject.ParamSpec.string(
      'project',
      'Project',
      'Project',
      GObject.ParamFlags.READWRITE,
      ""
    )
  },
  InternalChildren: [
    'button_content',
    'button_icon',
  ]
};

// Declare _ global for translation
declare function _(id: string): string;

export class SidebarButton extends Gtk40.Button {
  static {
    GObject.registerClass(GObjectProperties, this);
  }

  private button_icon!: Gtk40.Image;

  private button_content!: Gtk40.Label;

  private project_name: string;

  constructor(project: string) {
    const btnTitle = project === "" ? _("Without project") : project;
    const btnIcon = project === "" ? "task-due-symbolic" : "folder-symbolic";

    super();

    this.project_name = project;
    this.button_content = this.get_template_child(SidebarButton as unknown as GObject.GType, 'button_content') as Gtk40.Label;
    this.button_icon = this.get_template_child(SidebarButton as unknown as GObject.GType, 'button_icon') as Gtk40.Image;

    this.button_icon.set_from_icon_name(btnIcon);
    this.button_content.set_text(btnTitle);
  }

  public set_active(active: boolean) {
    const ICONS = {
      due_tasks: "task-due-symbolic",
      folder: "folder-symbolic",
      folder_open: "folder-open-symbolic",
    }

    const default_icon = this.project_name === "" ? ICONS.due_tasks : ICONS.folder;
    const active_icon = this.project_name === "" ? ICONS.due_tasks : ICONS.folder_open;

    if (active) {
      this.add_css_class('suggested-action');
    } else {
      this.remove_css_class('suggested-action');
    }

    this.button_icon.set_from_icon_name(active ? active_icon : default_icon);
  }
}
