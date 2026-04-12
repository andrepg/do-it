---
trigger: always_on
---

## Project overview

- This is a GNOME/Flatpak application (GTK4 + GObject)
- It is backed up by TypeScript and Meson to develop and build
- The interface consists of XML files with `.ui` extension
- Localization is handled by `gettext` utilitary
- Icons are, whenever possible, provided by the system/framework

## Path and architecture

- Code is located inside `src`
  - Inside `src/platform/gnome/actions` we have Gio SimpleActions "hooks"
  - Inside `src/platform/gnome/views` we have the UI's code counterpart (e.g., doit.ts)
  - Inside `src/platform/gnome/widgets` we have `.ui` files
  - Inside `src/core/interfaces` we have TypeScript interfaces
  - Inside `src/hooks` we have custom hooks
  - Inside `src/utils` are helpers functions
- Root-level app files: `app.entrypoint.ts`, `app.wrapper.ts`, `app.enums.ts`, `app.types.ts`, `app.strings.ts`, `app.static.ts`
- Localization is located inside `po`
- Some useful scripts are in `scripts`
- Types & Enums are declared in `app.enums.ts` and `app.types.ts`
- The app flows entrypoint.ts -> wrapper -> doit.ts primarily

## GResource XML files

- TS files: `src/io.github.andrepg.Doit.src.gresource.xml.in`
- UI files: `src/platform/gnome/widgets/io.github.andrepg.Doit.data.gresource.xml.in`

## Code guidelines

- The comments must ALWAYS be written in English
- Never use `any` as solution to type errors
- Every UI created/renamed must cause gresource XML update
- Every TS file created/renamed/deleted must cause gresource XML update
- Never type variables with `any` type
- Prefer to use Enums instead of magic strings/numbers
- Try to type the most number of variables possible
- Each function must be concise, aiming one single objective
- Related codes can be merged, as combined in classes, hooks, script collection and others

## Behavior guideline

- ALWAYS change the minimal possible amount of code.
- Be concise, simple and direct on solutions
- Comment the most complex codes
- Keep JSDocs updated and create them if required
- If you ever encounter yourself in doubt, ask.
- Web research is encouraged to documentation, official APIs and language related searches.

## Git guidelines

- This project uses **Husky** to manage Git hooks
- Hooks are located in `.husky/` directory
- **Commit messages** must follow [Conventional Commits](https://www.conventionalcommits.org/):
  - Format: `<type>: <subject>` (e.g., `feat: add new feature`)
  - Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `revert`
- **Pre-commit hook** runs `yarn lint` (non-blocking, warnings only)
- Use `git commit -m "type: message"` for commits
- To skip hooks temporarily: `git commit -m "..." -n`

## Scripts and Commands

### Bash Scripts (scripts/)

| Script                    | Description                                |
| ------------------------- | ------------------------------------------ |
| `run-dev`                 | Runs the app locally via flatpak-builder   |
| `compile`                 | Compiles Flatpak via flatpak-builder       |
| `flatpak-export-bundle`   | Builds and exports/installs Flatpak bundle |
| `flatpak-prebuild`        | Generates flatpak/generated-sources.json   |
| `pot-generator`           | Updates gettext translation files          |
| `validate-flatpak-bundle` | Runs flatpak-builder-lint validation       |

### Development Commands (yarn/npm run)

| Command            | Description                                 |
| ------------------ | ------------------------------------------- |
| `dev`              | Compiles and runs dev version once          |
| `watch`            | Compiles and runs dev version in watch mode |
| `dev:install`      | Compiles and installs dev flatpak to user   |
| `dev:export`       | Compiles and exports dev flatpak bundle     |
| `dev:validate`     | Validates dev flatpak bundle                |
| `build`            | Generates POT and exports prod bundle       |
| `prod`             | Compiles and runs prod version once         |
| `prod:install`     | Compiles and installs prod flatpak to user  |
| `prod:export`      | Compiles and exports prod flatpak bundle    |
| `prod:validate`    | Validates prod flatpak bundle               |
| `pot-generator`    | Generates POT template and PO files         |
| `flatpak:prebuild` | Runs flatpak-prebuild script                |
| `lint`             | ESLint                                      |
| `lint:fix`         | ESLint auto-fix                             |
| `format`           | Prettier check                              |
| `format:fix`       | Prettier write                              |
| `test`             | Vitest                                      |
| `test:coverage`    | Vitest coverage                             |

### Script Flags

- `-c` or `--compile`: Invokes compile before running/installing
- `-w` or `--watch`: Runs app in watch mode (restarts on exit)
- `-C` or `--clean`: Full clean of cache before compiling
- `-i` or `--install`: Install bundle to user after export

### Manifests

- Development: `io.github.andrepg.Doit.Devel.json`
- Production: `io.github.andrepg.Doit.json`

### Build Workflow

- **Development** (`dev`, `watch`, `dev:install`, `dev:export`): No need to generate offline sources - uses network
- **Production** (`prod`, `prod:install`, `prod:export`, `build`): Uses offline sources from `flatpak/generated-sources.json` for Flatpak compliance

## Antigravity integration

- This project uses Plannotator for AI-assisted development
- The `/compound-planning` command triggers the plannotator-compound skill
- This skill analyzes plan archives to extract denial patterns, feedback taxonomy, and actionable prompt improvements
- When working with Antigravity, reference the skill at `~/.claude/skills/plannotator-compound/SKILL.md`
