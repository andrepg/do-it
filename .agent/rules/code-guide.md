---
trigger: always_on
---

## Project overview

- This is a GNOME/Flatpak application
- It is backed up by Typescript and Meson to develop and build
- The interface consists of XML files with `.ui` extension
- Localization is handled by `gettext` utilitary
- Icons are, whenever possible, provided by the system/framework

## Path and architecture

- Code is located inside `src`
  - Inside `src/actions` we have Gio SimpleActions "hooks"
  - Inside `src/ui-handler` we have the UI's code counterpart
  - Inside `src/utils` are helpers functions
- Localization is located inside `po`
- Some useful scripts are in `scripts`
- The interface is located inside `ui`
- Types & Enums are declared on their own file
- The app flows entrypoint.ts -> app.ts -> doit.ts primarily

## Code guidelines

- The comments must ALWAYS be written in English
- Never use `any` as solution to type errors
- Every UI created/renamed must causes gresource XML update
- Every TS file created/renamed/deleted must causes gresource XML update
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