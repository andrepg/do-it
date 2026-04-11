# Contributing to Do It

Thank you for your interest in contributing! This guide helps new and returning users navigate the project.

For a full project description and features, see the [README](README.md).

## Project Structure

```
src/
├── core/              # Platform-agnostic business logic & interfaces
│   ├── interfaces/   # Abstract interfaces (settings, persistence, task-view)
│   └── persistence/  # Data storage implementations
├── platform/         # Platform-specific implementations
│   └── {platform}/   # {platform} implementation
├── hooks/             # Reusable hooks (mostly platform-agnostic)
├── utils/             # Utility functions
└── *.ts               # App entry points and shared types

po/                   # Localization files (gettext)
scripts/              # Build and development scripts
docs/                 # Detailed documentation
```

## Finding Things

| What you're looking for           | Where it is                                |
| --------------------------------- | ------------------------------------------ |
| Main task type (`ITask`)          | `src/app.types.ts`                         |
| Shared enums (SortingField, etc.) | `src/app.enums.ts`                         |
| Platform-specific enums           | `src/platform/{platform}/enums.ts`         |
| Translatable strings              | `src/app.strings.ts`                       |
| Static config                     | `src/app.static.ts`                        |
| App entry point                   | `src/app.entrypoint.ts`                    |
| Core interfaces                   | `src/core/interfaces/`                     |
| Settings hook                     | `src/hooks/settings.ts`                    |
| Task sorting logic                | `src/hooks/tasks.sort.ts`                  |
| UI components (`.ui` files)       | `src/platform/{platform}/widgets/`         |
| View code counterparts            | `src/platform/{platform}/views/`           |
| Action handlers                   | `src/platform/{platform}/actions/`         |
| Persistence implementation        | `src/core/persistence/file-persistence.ts` |
| Localization files                | `po/`                                      |

### Typical Workflow

1. **Add new translatable string** → edit `src/app.strings.ts` → run `yarn update-pot-file`
2. **Add new type** → edit `src/app.types.ts`
3. **Add new enum** → edit `src/app.enums.ts` (shared) or `src/platform/{platform}/enums.ts` (platform-specific)
4. **New UI or TS file** → remember to update `.gresource.xml.in`

## Adding Translatable Strings

1. Edit `src/app.strings.ts` to add the new string
2. Run `yarn update-pot-file` to update the `.pot` file in `po/`
3. Translate the string in the respective `po/LANG.po` files using gettext
4. The app will automatically load the translated string at runtime

> **Note**: Always use English for source strings in `app.strings.ts`.

## Adding Constants and Types

- **Types**: Add to `src/app.types.ts` (core types shared across platforms)
- **Shared Enums**: Add to `src/app.enums.ts`
- **Platform Enums**: Add to `src/platform/{platform}/enums.ts`
- **Static Config**: Add to `src/app.static.ts`

## Development Commands

### Bash Scripts (scripts/)

| Script               | Description                                   |
| -------------------- | --------------------------------------------- |
| `run`                | Runs the app locally with optional watch mode |
| `compile`            | Compiles Flatpak via flatpak-builder          |
| `install`            | Installs or exports the Flatpak bundle        |
| `flatpak-validation` | Runs flatpak-builder-lint validation          |
| `generate-sources`   | Generates flatpak/generated-sources.json      |
| `update-pot-file`    | Updates gettext translation files             |

### Development Commands (yarn/npm run)

| Command                         | Description                              |
| ------------------------------- | ---------------------------------------- |
| `yarn dev`                      | Run app with watch mode (`run -w -c`)    |
| `yarn dev:install`              | Compile and install (`install -c`)       |
| `yarn dev:export`               | Compile and export Flatpak bundle        |
| `yarn dev:validate`             | Run flatpak-builder-lint validation      |
| `yarn prod`                     | Compile only (`run -c`)                  |
| `yarn prod:install`             | Install (`install -c`)                   |
| `yarn prod:export`              | Export Flatpak bundle                    |
| `yarn prod:validate`            | Run flatpak-builder-lint validation      |
| `yarn flatpak:generate-sources` | Generates flatpak/generated-sources.json |
| `yarn lint`                     | Run ESLint                               |
| `yarn lint:fix`                 | ESLint auto-fix                          |
| `yarn format`                   | Check Prettier formatting                |
| `yarn format:fix`               | Prettier write                           |
| `yarn test`                     | Run tests                                |
| `yarn test:coverage`            | Run tests with coverage                  |

### Script Flags

- `-c` or `--compile`: Invokes compile before running/installing
- `-w` or `--watch`: Interactive mode - press [R] to recompile and run again
- `-C` or `--clean`: Clears build cache before compiling
- `-e` or `--export`: Generates a .flatpak bundle instead of installing

### Manifests

- Development: `io.github.andrepg.Doit.Devel.json`
- Production: `io.github.andrepg.Doit.json`

## Code Guidelines

For detailed guidelines, see [`.agent/rules/code-guide.md`](.agent/rules/code-guide.md). Key points:

- Comments must always be written in English
- Never use `any` to type errors
- Every UI or TS file change must update the respective `.gresource.xml.in`
- Prefer Enums over magic strings/numbers
- Each function should aim for a single objective

## Git Guidelines

This project uses **Husky** for Git hooks. Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <subject>
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`

Example: `feat: add new sorting option`

> **Note**: Using an invalid prefix will prevent the commit from being accepted.

## Detailed Documentation

For more in-depth information, see these docs:

- [docs/README.md](docs/README.md) - Architecture overview
- [docs/core.md](docs/core.md) - Core interfaces
- [docs/shared-types.md](docs/shared-types.md) - Types and enums
- [docs/hooks-utils.md](docs/hooks-utils.md) - Hooks and utilities
- [docs/platform-gnome.md](docs/platform-gnome.md) - GNOME platform details
