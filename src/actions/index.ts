/* index.ts
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
import about from "./about.js";
import quit from "./quit.js";
import backup from './backup.js';
import sidebar from './sidebar.js';
import toast from './toast.js';
import projects from './projects.js';
import projectSidebar from './projects-sidebar.js';
import purgeDeleted from './purge-deleted.js';

export { newTask } from './new-task.js';
export { showToast } from './toast.js';

export {
    about,
    quit,
    backup,
    sidebar,
    toast,
    projects,
    projectSidebar,
    purgeDeleted,
}