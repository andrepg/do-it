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

import { CssClasses, WidgetIds } from '../enums.js';
import { AppLocale } from '~/app.strings.js';
import { SymbolicIcons } from '~/app.static.js';

import { get_template_path } from '~/utils/application.js';

const GObjectProperties = {
  GTypeName: 'SidebarButton',
  Template: get_template_path('sidebar-button.ui'),
  Properties: {
    project: GObject.ParamSpec.string(
      'project',
      'Project',
      'Project',
      GObject.ParamFlags.READWRITE,
      '',
    ),
  },
  InternalChildren: [WidgetIds.SidebarButtonContent, WidgetIds.SidebarButtonIcon],
};

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
    const btnTitle = project === '' ? AppLocale.tasks.list.noProject : project;
    const btnIcon = project === '' ? SymbolicIcons.sidebar.task_due : SymbolicIcons.sidebar.folder;

    super();

    this.project_name = project;
    this.button_content = this.get_template_child(
      SidebarButton.$gtype,
      WidgetIds.SidebarButtonContent,
    ) as Gtk40.Label;
    this.button_icon = this.get_template_child(
      SidebarButton.$gtype,
      WidgetIds.SidebarButtonIcon,
    ) as Gtk40.Image;

    this.button_icon.set_from_icon_name(btnIcon);
    this.button_content.set_text(btnTitle);
  }

  /**
   * Sets the visual active state of the button to reflect the current global filter.
   *
   * @param active True if this project is currently selected, False otherwise.
   */
  public set_active(active: boolean) {
    this.set_button_icon(active);
    this.set_button_active_state(active);
  }

  private set_button_icon(isActive: boolean) {
    let icon = SymbolicIcons.sidebar.folder;

    if (isActive) icon = SymbolicIcons.sidebar.folder_open;

    if (this.project_name === '') icon = SymbolicIcons.sidebar.task_due;

    this.button_icon.set_from_icon_name(icon);
  }

  private set_button_active_state(isActive: boolean) {
    if (isActive) this.add_css_class(CssClasses.SuggestedAction);
    else this.remove_css_class(CssClasses.SuggestedAction);
  }
}
