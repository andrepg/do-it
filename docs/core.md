# Core Layer Documentation

The `src/core/` directory contains platform-agnostic business logic and interfaces that can be shared across all platforms.

## Directory Structure

```
src/core/
├── interfaces/
│   ├── settings.ts      # Settings abstraction
│   ├── persistence.ts   # Data persistence abstraction
│   └── task-view.ts     # Task view abstraction
└── persistence/
    └── gio-persistence.ts  # File-based persistence implementation
```

## Interfaces

### ISettings (`interfaces/settings.ts`)

Abstract interface for application settings. Platforms must implement this to provide persistent key-value storage.

```typescript
export interface ISettings {
  get_int(key: string): number;
  set_int(key: string, value: number): void;
  get_string(key: string): string;
  set_string(key: string, value: string): void;
  get_enum(key: string): number;
  set_enum(key: string, value: number): void;
}
```

**Implementations:**

- GNOME: `src/hooks/settings.ts` (uses `Gio.Settings`)

### IPersistence (`interfaces/persistence.ts`)

Abstract interface for task data persistence. Defines async load/save operations.

```typescript
import type { ITask } from '../../app.types.js';

export interface IPersistence {
  load(): Promise<ITask[]>;
  save(tasks: ITask[]): Promise<void>;
}
```

**Implementations:**

- GNOME: `src/core/persistence/gio-persistence.ts` (file-based JSON)
- Web (planned): IndexedDB

### ITaskView (`interfaces/task-view.ts`)

Abstract interface for task display widgets. Provides a bridge between task data and UI components.

```typescript
import type { ITask } from '../../app.types.js';

export interface ITaskView {
  taskId: number;
  title: string;
  done: boolean;
  deleted: boolean;
  project: string;
  created: string;

  update(task: ITask): void;
  onTaskUpdated(callback: (task: ITask) => void): void;
  onTaskDeleted(callback: (task: ITask) => void): void;
  to_object(): ITask;
}
```

**Implementations:**

- GNOME: `src/platform/gnome/views/task-item.ts`

## Implementations

### FilePersistence (`persistence/gio-persistence.ts`)

File-based JSON persistence implementation for GNOME.

```typescript
import type { ITask } from '../../app.types.js';
import type { IPersistence } from '../interfaces/persistence.js';

export class FilePersistence implements IPersistence {
  // Loads tasks from JSON file
  async load(): Promise<ITask[]>;

  // Saves tasks to JSON file
  async save(tasks: ITask[]): Promise<void>;
}
```

## Design Principles

### Platform Agnostic

The core layer must never import platform-specific code:

- No GTK, Adw, Gio imports
- No browser-specific APIs
- Only TypeScript types and interfaces

### Dependency Injection

Platforms inject their implementations:

```typescript
// Example: Creating platform-specific instances
let settings: ISettings;
let persistence: IPersistence;

if (platform === 'gnome') {
  settings = new GnomeSettings();
  persistence = new FilePersistence();
} else if (platform === 'web') {
  settings = new WebSettings();
  persistence = new IndexedDBPersistence();
}
```

### Extensibility

To add a new interface:

1. Create `src/core/interfaces/<name>.ts`
2. Define TypeScript interface
3. Implement in each platform
4. Document in this file
