# codemirror-typst

Typst language support for CodeMirror 6, published to npm as `codemirror-typst`. Consumed by the Typwriter desktop and mobile apps (`../typwriter`).

- `src/parser/` — the Typst parser: **hand-written TypeScript** on `@lezer/common`. No `typst.grammar`, no codegen; edit the sources directly.
- `src/typst.ts` — the CodeMirror `Language` / `LanguageSupport` (folding, indentation, nested raw-block languages).
- `src/index.ts` — the public API. Everything exported here is semver surface.
- `test/` — `bun test`. Every parser fix gets a test.

Rules:

- `bun` is the package manager; `bun run check-types`, `bun test`, `bun run build` (tsup → `dist/`).
- CodeMirror/Lezer packages are **peer** dependencies and `external` in `tsup.config.ts`. Never bundle them or move them to `dependencies` — a second `@lezer/common` breaks highlighting silently.
- `Type` is a regular `enum`, not `const enum`: ambient const enums are unusable for `isolatedModules` consumers.
- Don't link this package into an app with `bun link` / `file:` — the app would resolve this repo's own `node_modules` copy of Lezer. Test in an app with `npm pack` and install the tarball.
- Release: bump `version`, tag `vX.Y.Z`, push the tag; the `publish` workflow does the rest.
