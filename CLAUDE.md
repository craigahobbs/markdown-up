# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common commands

This project uses the [javascript-build](https://github.com/craigahobbs/javascript-build) Make-based toolchain. `Makefile.base`, `jsdoc.json`, and `eslint.config.js` are downloaded on first build and are not in source control.

- `make test` — run the test suite (`node --test` against `test/`)
- `make test TEST=<pattern>` — run a single test or subset (passed as `--test-name-pattern`)
- `make lint` — ESLint over `lib/` and `test/`
- `make cover` — coverage via `c8`; project requires 100% (`--100`)
- `make doc` — jsdoc into `build/doc/`
- `make commit` — runs `test lint doc cover` (and `app`, per the project's override)
- `make app` — assemble the deployable static app into `build/app/` (used by gh-pages)
- `make run` — `make app` then `python3 -m http.server --directory build/app`
- `make clean` / `make superclean` — clean build artifacts (also removes downloaded `Makefile.base` etc.)

`npm test` works too but bypasses the build-deps install step that `make` provides.

## Code architecture

MarkdownUp is the browser frontend for the MarkdownUp Markdown viewer. There is no bundler — JS modules are loaded directly by the browser as ESM. The build step copies dependency packages from `node_modules` into the output and rewrites relative import paths with `sed` so they resolve at runtime. All source lives in `lib/` (four files):

- **`lib/app.js`** — `MarkdownUp` class. Owns the full app lifecycle: hash-parameter routing (schema in `markdownUpTypes`), fetching the Markdown resource, parsing and rendering via `element-model`, the menu/dark-mode/font-size UI, and dispatch into the BareScript code-block runtime. The hash schema, `MarkdownUpLocal` (localStorage), and `MarkdownUpSession` (sessionStorage) shapes are defined inline as schema-markdown.
- **`lib/script.js`** — Bridge to BareScript. Exports `markdownScriptCodeBlock` (the renderer for ` ```markdown-script ` fenced blocks) and `MarkdownScriptRuntime` (per-document runtime state shared across blocks). Optionally runs the BareScript linter when debug mode is on.
- **`lib/scriptLibrary.js`** — The library of BareScript functions exposed to MarkdownUp Applications (e.g. `documentFontSize`, `documentInputValue`, element-model helpers). Each function is declared with `// $function:` / `$group:` / `$doc:` / `$arg:` / `$return:` doc comments — this comment format is consumed by external doc tooling, **preserve it when adding or editing functions**. Argument validation goes through `valueArgsModel` / `valueArgsValidate` from `bare-script/lib/value.js`.
- **`lib/appImports.js`** — Single entry point the HTML stub imports. Re-exports `MarkdownUp` and side-effect-imports every dependency module so the browser only fetches one module graph.

Tests in `test/` use `node --test` with `jsdom` (Makefile sets `USE_JSDOM := 1`). `testApp.js` covers `lib/app.js`; `testScriptLibrary.js` covers `lib/scriptLibrary.js`. Coverage is enforced at 100%.

## Dependencies and the build

Production deps are sibling packages by the same author: `bare-script` (the scripting language), `element-model` (the virtual-DOM-like element representation), and `schema-markdown` (the schema language used for hash params, validation, and the BareScript value system). The `tarball` target in the top-level `Makefile` assembles these into `build/markdown-up/` with rewritten import paths, then `app` copies that plus docs and statics into `build/app/`. If you change imports in `lib/`, verify they still resolve after `make app` — the `sed` rewrites in both `tarball` and `app` match `import ... 'pkg/...'` patterns and are sensitive to import-statement formatting.

## BareScript and `markdown-script` blocks

When working on anything that touches `markdown-script` fenced blocks, the BareScript runtime, or functions in `scriptLibrary.js`, use the `bare-script` skill — it has the language reference and built-in library docs.
