# Web Platform Documentation

> **Note**: The web platform is planned for Phase 3 of the migration and has not been implemented yet.

## Planned Architecture

```
src/platform/web/
├── index.ts              # Public API exports
├── enums.ts              # Web-specific enums (if any)
├── components/           # Web components
│   ├── task-list.ts      # Task list component
│   ├── task-item.ts      # Task row component
│   ├── task-form.ts      # Task editing form
│   └── ...
├── services/            # Web-specific services
│   ├── storage.ts        # IndexedDB persistence
│   └── router.ts         # URL routing
└── styles/              # CSS styles
    └── *.css
```

## Planned Implementations

### ISettings

Will use `localStorage` or `IndexedDB`:

```typescript
// Planned: WebSettings implementation
```

### IPersistence

Will use IndexedDB via `idb` library:

```typescript
// Planned: IndexedDBPersistence implementation
```

### ITaskView

Will use web components or framework components:

```typescript
// Planned: WebTaskItem implementation
```

## Build System

The web platform will likely use:

- **Vite**: Build tool and dev server
- **TypeScript**: Type checking
- **CSS Modules** or **Tailwind**: Styling

## Migration from GNOME

Key differences from GNOME platform:

| Aspect  | GNOME                    | Web                      |
| ------- | ------------------------ | ------------------------ |
| UI      | GTK4/Adwaita             | React/Vue/Web Components |
| Storage | Gio.Settings + JSON file | IndexedDB                |
| Routing | GTK actions              | URL router               |
| Build   | Meson                    | Vite/Webpack             |

## Implementation Checklist

When implementing the web platform:

- [ ] Create `src/platform/web/` directory structure
- [ ] Implement `ISettings` using localStorage
- [ ] Implement `IPersistence` using IndexedDB
- [ ] Create web UI components
- [ ] Set up Vite build configuration
- [ ] Add CSS styling
- [ ] Test cross-platform compatibility
