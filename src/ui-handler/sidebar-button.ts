import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import { get_template_path } from '../utils/application.js';
import Gtk40 from 'gi://Gtk';

// Declare _ global for translation
declare function _(id: string): string;

const GObjectProperties = {
  GTypeName: "SidebarButton",
  Template: get_template_path('ui/sidebar-button.ui'),
};

export class SidebarButton extends Gtk40.Button {
  static {
    GObject.registerClass(GObjectProperties, this);
  }

  constructor(project: string) {
    const btnTitle = project === "" ? _("Tarefas") : project;
    const btnIcon = project === "" ? "task-due-symbolic" : "folder-open-symbolic";

    super({
        label: btnTitle,
        icon_name: btnIcon
    });
  }
}
