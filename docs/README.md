# Do It - Developer Documentation

This document provides an overview of the Do It project architecture and how to navigate its source code.

## Project Overview

**Do It** is a GNOME task manager application written in TypeScript, now being refactored for multiplatform support. The codebase follows a clean architecture pattern that separates platform-specific code from core business logic.

## Architecture

```
src/
├── core/           # Platform-agnostic business logic & interfaces
├── platform/      # Platform-specific implementations
│   ├── gnome/      # GNOME/GTK4/Adw implementation
│   └── web/        # Web platform (future)
├── hooks/          # Reusable hooks (mostly platform-agnostic)
├── utils/          # Utility functions
└── *.ts            # App entry points and shared types
```

## Key Concepts

### Core Layer (`src/core/`)

Contains platform-agnostic interfaces and implementations:

- **interfaces/**: Abstract interfaces for settings, persistence, and task views
- **persistence/**: Data storage implementations

### Platform Layer (`src/platform/`)

Contains platform-specific implementations:

- Each platform has its own subfolder with platform-specific code
- Platforms expose a public API via `index.ts`

### Shared Types (`src/`)

- `app.types.ts`: Core types like `ITask`, `IProject`
- `app.enums.ts`: Shared enums like `SortingField`, `SortingStrategy`
- `app.strings.ts`: Localized strings
- `app.static.ts`: Static configuration

## Platform-Specific Documentation

- [GNOME Platform](platform-gnome.md) - Current active platform
- [Web Platform](platform-web.md) - Future web implementation

## Development Guidelines

### Adding a New Platform

1. Create `src/platform/<platform-name>/`
2. Implement core interfaces (`ISettings`, `IPersistence`, `ITaskView`)
3. Create UI components using platform-specific frameworks
4. Export public API via `index.ts`
5. Add to build system (Meson for GNOME, Vite/Webpack for web)

### Dependency Injection

The project uses factory patterns for dependency injection. Core interfaces should never import platform-specific code.

### Import Aliases

The project uses TypeScript path aliases:

- `~core` → `src/core`
- `~gnome` → `src/platform/gnome`
- `~web` → `src/platform/web`
- `~hooks` → `src/hooks`
- `~utils` → `src/utils`
- `~actions` → `src/platform/gnome/actions`

## Building

- **GNOME**: Use Meson (`meson setup build && ninja -C build`)
- **Web**: Use Vite (future)

## Resources

- [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/)
- [Adwaita Widgets](https://gnome.pages.gitlab.gnome.org/libadwaita/)
