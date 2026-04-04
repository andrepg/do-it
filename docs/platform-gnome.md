# GNOME Platform Documentation

The GNOME platform is the current primary implementation of the Do It task manager, using GTK4 and libadwaita.

## Directory Structure

```
src/platform/gnome/
├── index.ts              # Public API exports
├── enums.ts              # GNOME-specific enums
├── actions/              # GAction implementations
│   ├── index.ts
│   ├── backup.ts         # Import/export database
│   ├── toast.ts          # Toast notifications
│   ├── task-edit.ts      # Task editing actions
│   ├── purge-deleted.ts  # Purge deleted tasks
│   ├── quit.ts           # Quit application
│   ├── shortcuts.ts      # Shortcuts dialog
│   ├── sidebar.ts        # Sidebar actions
│   ├── projects.ts       # Project management
│   ├── projects-sidebar.ts
│   ├── new-task.ts       # New task creation
│   └── about.ts          # About dialog
├── views/                # GTK widget implementations
│   ├── index.ts
│   ├── doit.ts           # Main window controller
│   ├── task-list-store.ts # ListStore for tasks
│   ├── task-list.ts      # Task list widget
│   ├── task-item.ts      # Individual task row
│   ├── task-group.ts     # Grouped tasks
│   ├── task-form.ts      # Task edit form
│   ├── popover-sort.ts   # Sorting popover
│   ├── sidebar-button.ts # Sidebar button widget
│   └── ...
└── widgets/               # UI definitions (.ui files)
    ├── *.ui              # GTK UI templates
    ├── meson.build       # Build config for widgets
    └── io.github.andrepg.Doit.data.gresource.xml.in
```

## Key Components

### Actions (`actions/`)

All actions use GNOME's `GAction` system and interact with Adwaita components:

- **backup.ts**: Export/import database as JSON
- **task-edit.ts**: Open task editor, save/discard changes
- **new-task.ts**: Create new tasks with quick entry
- **toast.ts**: Show AdwToast notifications

### Views (`views/`)

Views implement GTK4 widgets that display and interact with tasks:

- **doit.ts**: Main window controller, initializes split view
- **task-list.ts**: `Gtk.ListView` backed by `Gtk.ListStore`
- **task-item.ts**: Individual task row with checkbox, title, actions
- **task-form.ts**: Full task editing form with all fields

### Widgets (`widgets/`)

UI templates in GTK4's `.ui` format:

- **application.ui**: Main application window
- **task.ui**: Task row template
- **task-form.ui**: Task editing form
- **sidebar-button.ui**: Sidebar item template
- **popover-sort.ui**: Sorting options popover

## Enums (`enums.ts`)

GNOME-specific enums that shouldn't be shared:

- **AppSignals**: GObject signal names
- **ActionNames**: GAction names
- **CssClasses**: CSS class names
- **WidgetIds**: Widget identifier strings

## Build System

The GNOME platform uses Meson:

1. `.ui` files are compiled into GResources via `gresource.xml`
2. TypeScript is compiled to JavaScript and bundled
3. Resources are embedded in the final binary

### Resource Paths

When adding new `.ui` files:

1. Add to `widgets/meson.build`
2. Update `io.github.andrepg.Doit.data.gresource.xml.in`
3. Update `get_template_path()` in `src/utils/application.js`

## Interface Implementations

The GNOME platform implements these core interfaces:

### ISettings

Uses `Gio.Settings` for persistent key-value storage:

```typescript
// Implemented via Gio.Settings in hooks/settings.ts
```

### IPersistence

Uses file-based JSON storage:

```typescript
// src/core/persistence/file-persistence.ts
```

### ITaskView

Implemented in `views/task-item.ts`:

```typescript
// Updates GTK widgets when task data changes
```

## Customizations

### Settings Hook

`src/hooks/settings.ts` wraps `Gio.Settings`:

- Uses schema from `io.github.andrepg.Doit`
- Provides typed get/set for each setting

### Task Sorting

`src/hooks/tasks.sort.ts`:

- Uses core interfaces (`ITaskView`)
- Implements sorting by various fields

### Autocomplete

`src/hooks/autocomplete.ts`:

- Provides project name suggestions
- Uses GTK `Gtk.EntryCompletion`

## Common Tasks

### Adding a New Action

1. Create `src/platform/gnome/actions/my-action.ts`
2. Register in `actions/index.ts`
3. Connect to UI via `activate()` callback or signal

### Adding a New View

1. Create `src/platform/gnome/views/my-view.ts`
2. Extend appropriate GTK widget class
3. Implement required interfaces
4. Export in `views/index.ts`

### Adding a New UI Template

1. Create `src/platform/gnome/widgets/my-widget.ui`
2. Add to `widgets/meson.build` (ui_files)
3. Update gresource XML with path
4. Use `get_template_path()` in JavaScript

## Migration Notes

When working with this platform:

- **DO NOT** import GTK/Adw/Gio in `src/core/` or `src/hooks/`
- Keep platform-specific code in `src/platform/gnome/`
- Use dependency injection for cross-platform compatibility
- Test on both GNOME 45+ and newer versions
