/* tasks.project.ts
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

/**
 * Parses the input string to extract a project tag (`@ProjectName`).
 *
 * Any text following the `@` symbol is captured as the project name.
 *
 * @param text The raw text typed by the user.
 * @returns An object containing the capitalized project name and the remaining clean text.
 */
export const parse_project = (text: string): { project: string; parsedText: string } => {
  let project = '';
  let parsedText = text;
  const projectMatch = text.match(/@(\S+)/);

  if (projectMatch) {
    const rawProject = projectMatch[1];
    project = rawProject.charAt(0).toUpperCase() + rawProject.slice(1).toLowerCase();
    parsedText = text.replace(projectMatch[0], '').trim();
  }

  return { project, parsedText };
};
