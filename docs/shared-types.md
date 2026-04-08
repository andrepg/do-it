# Shared Types Documentation

The `src/` root contains shared types, enums, and entry points used across all platforms.

## Types (`app.types.ts`)

Core domain types that are platform-agnostic.

### ITask

```typescript
export interface ITask {
  id?: number;
  title: string;
  created_at: number;
  project?: string;
  deleted?: boolean;
  done?: boolean;
}
```

The main task entity. Used by all platforms for task data.

### ISortingFieldOption

```typescript
export interface ISortingFieldOption {
  label: string;
  icon?: string;
  mode: SortingField;
}
```

UI configuration for sorting field options.

### ISortingStrategyOption

```typescript
export interface ISortingStrategyOption {
  icon: string;
  strategy: SortingStrategy;
}
```

UI configuration for sorting strategy options.

## Enums (`app.enums.ts`)

Platform-agnostic enumerations.

### SortingField

```typescript
export enum SortingField {
  byDate = 0,
  byStatus = 1,
  byTitle = 2,
  byProject = 3,
}
```

Fields by which tasks can be sorted.

### SortingStrategy

```typescript
export enum SortingStrategy {
  ascending = 0,
  descending = 1,
}
```

Sort direction.

### DoItSettings

```typescript
export const DoItSettings = {
  windowHeight: 'window-height',
  windowWidth: 'window-width',
};
```

Settings keys for window dimensions.

## Static Data (`app.static.ts`)

Static configuration constants.

## Strings (`app.strings.ts`)

Localized UI strings.

## Entry Points

### app.entrypoint.ts

Application entry point.

### app.wrapper.ts

Wrapper that initializes platform-specific components.

## Platform-Specific Enums

> **Note**: Platform-specific enums are in their respective platform directories:
>
> - GNOME: `src/platform/gnome/enums.ts` (AppSignals, ActionNames, CssClasses, WidgetIds)
> - Web: `src/platform/web/enums.ts` (future)

## Design Guidelines

### What Goes in Root `src/`

- Types used by all platforms
- Enums that are truly shared
- Entry points that bootstrap the app
- Localization strings

### What Goes in Platform Directories

- Platform-specific enums
- UI components
- Platform-specific implementations of core interfaces
