/* sidebar-button.ts
 * Copyright 2025 André Paul Grandsire
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import Gtk40 from 'gi://Gtk';
import GObject from 'gi://GObject';

import { get_template_path } from '../utils/application.js';
import { CssClasses, WidgetIds } from '../app.enums.js';
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
    WidgetIds.SidebarButtonContent,
    WidgetIds.SidebarButtonIcon,
  ]
};

// Declare _ global for translation
declare function _(id: string): string;

/**
 * A custom sidebar button representing a specific project or "All tasks".
 * 
 * Provides visual indication (icons and CSS classes) indicating whether this project 
 * is currently selected as the active filter.
 */
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
    this.button_content = this.get_template_child(SidebarButton as unknown as GObject.GType, WidgetIds.SidebarButtonContent) as Gtk40.Label;
    this.button_icon = this.get_template_child(SidebarButton as unknown as GObject.GType, WidgetIds.SidebarButtonIcon) as Gtk40.Image;

    this.button_icon.set_from_icon_name(btnIcon);
    this.button_content.set_text(btnTitle);
  }

  /**
   * Sets the visual active state of the button to reflect the current global filter.
   * 
   * @param active True if this project is currently selected, False otherwise.
   */
  public set_active(active: boolean) {
    const ICONS = {
      due_tasks: "task-due-symbolic",
      folder: "folder-symbolic",
      folder_open: "folder-open-symbolic",
    }

    const default_icon = this.project_name === "" ? ICONS.due_tasks : ICONS.folder;
    const active_icon = this.project_name === "" ? ICONS.due_tasks : ICONS.folder_open;

    if (active) {
      this.add_css_class(CssClasses.SuggestedAction);
    } else {
      this.remove_css_class(CssClasses.SuggestedAction);
    }

    this.button_icon.set_from_icon_name(active ? active_icon : default_icon);
  }
}
