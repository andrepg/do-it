# Hooks and Utils Documentation

This document describes the helper functions and utilities in `src/hooks/` and `src/utils/`.

## Hooks (`src/hooks/`)

Hooks are reusable functions that provide platform-agnostic functionality. They should remain free of platform-specific imports.

### tasks.sort.ts

Provides task sorting functionality.

```typescript
// Sorts tasks by specified field and strategy
sortTasks(tasks: ITask[], field: SortingField, strategy: SortingStrategy): ITask[]
```

**Dependencies:**

- Imports `ITask` from `app.types`
- Uses `ITaskView` from core interfaces (for comparison)

### settings.ts

> ⚠️ **Note**: This hook currently uses GNOME-specific `Gio.Settings`.

```typescript
// Provides access to application settings
getSettings(): ISettings
```

**Status:** Needs abstraction for web platform.

### autocomplete.ts

Provides project name autocomplete suggestions.

```typescript
// Returns matching project names
getSuggestions(input: string): string[]
```

## Utils (`src/utils/`)

Utility functions, some platform-specific.

### application.js

GNOME application bootstrap.

```javascript
// Returns path to UI template
get_template_path(filename: string): string

// Initializes the GTK application
activate(application: Gtk.Application): void
```

**Platform:** GNOME only

### project-manager.ts

Manages project CRUD operations.

```typescript
class ProjectManager {
  getProjects(): string[];
  addProject(name: string): void;
  removeProject(name: string): void;
}
```

**Platform:** GNOME (uses Adw/Gtk)

### persistence.ts

Legacy persistence utilities.

> ⚠️ **Note**: Should migrate to use `core/persistence/file-persistence.ts`

### log-manager.ts

Logging utilities.

```typescript
class LogManager {
  debug(message: string): void;
  info(message: string): void;
  error(message: string): void;
}
```

## Guidelines

### Keeping Hooks Platform-Agnostic

When modifying hooks:

1. **DO**: Use interfaces from `src/core/interfaces/`
2. **DO**: Import types from `src/app.types.ts`
3. **DON'T**: Import GTK, Adw, Gio, or browser APIs
4. **DON'T**: Import from `src/platform/gnome/`

### Example: Refactoring for Platform Agnosticism

Before (GNOME-specific):

```typescript
import { Settings } from 'gi://Gio';

export function getSettings() {
  return new Settings({ schema: 'io.github.andrepg.Doit' });
}
```

After (Platform-agnostic):

```typescript
import type { ISettings } from '~core/interfaces/settings';

export function createSettings(): ISettings {
  // Platform-specific implementation injected
  return platform.createSettings();
}
```
