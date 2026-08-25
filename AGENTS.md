# AGENTS.md

Notes for coding agents working in this repository.

## javascript-build

This is a [javascript-build](https://github.com/craigahobbs/javascript-build#readme) package. Read the javascript-build skill before running tests, lint, coverage, or changing the Makefile: [`../javascript-build/SKILL.md`](../javascript-build/SKILL.md) if that file exists, otherwise [https://raw.githubusercontent.com/craigahobbs/javascript-build/main/SKILL.md](https://raw.githubusercontent.com/craigahobbs/javascript-build/main/SKILL.md).

Local Makefile overrides:

- `GHPAGES_SRC` — `build/app/`
- `USE_JSDOM` — jsdom is a development dependency
- `commit` also depends on `app`

Package-specific targets:

- `make app` — assemble the deployable static app into `build/app/` (used by gh-pages)
- `make run` — `make app` then `python3 -m http.server --directory build/app`
- `make tarball` — assemble `build/markdown-up.tar.gz` with rewritten import paths

## Code architecture

MarkdownUp is the browser frontend for the MarkdownUp Markdown viewer. There is no bundler — JS modules are loaded directly by the browser as ESM. The build step copies dependency packages from `node_modules` into the output and rewrites relative import paths with `sed` so they resolve at runtime. All source lives in `lib/` (four files):

- **`lib/app.js`** — `MarkdownUp` class. Owns the full app lifecycle: hash-parameter routing (schema in `markdownUpTypes`), fetching the Markdown resource, parsing and rendering via `element-model`, the menu/dark-mode/font-size UI, and dispatch into the BareScript code-block runtime. The hash schema, `MarkdownUpLocal` (localStorage), and `MarkdownUpSession` (sessionStorage) shapes are defined inline as schema-markdown.
- **`lib/script.js`** — Bridge to BareScript. Exports `markdownScriptCodeBlock` (the renderer for ` ```markdown-script ` fenced blocks) and `MarkdownScriptRuntime` (per-document runtime state shared across blocks). Optionally runs the BareScript linter when debug mode is on.
- **`lib/scriptLibrary.js`** — The library of BareScript functions exposed to MarkdownUp Applications (e.g. `documentFontSize`, `documentInputValue`, element-model helpers). Each function is declared with `// $function:` / `$group:` / `$doc:` / `$arg:` / `$return:` doc comments — this comment format is consumed by external doc tooling, **preserve it when adding or editing functions**. Argument validation goes through `valueArgsModel` / `valueArgsValidate` from `bare-script/lib/value.js`.
- **`lib/appImports.js`** — Single entry point the HTML stub imports. Re-exports `MarkdownUp` and side-effect-imports every dependency module so the browser only fetches one module graph.

Tests in `test/` use `node --test` with `jsdom`. `testApp.js` covers `lib/app.js`; `testScriptLibrary.js` covers `lib/scriptLibrary.js`.

## Dependencies and the build

Production deps are sibling packages by the same author: `bare-script` (the scripting language; its `lib/include.js` stubs provide the Schema Markdown, URL, and Markdown functions used for hash params, validation, and rendering) and `element-model` (the virtual-DOM-like element representation). The `tarball` target in the top-level `Makefile` assembles these into `build/markdown-up/` with rewritten import paths, then `app` copies that plus docs and statics into `build/app/`. If you change imports in `lib/`, verify they still resolve after `make app` — the `sed` rewrites in both `tarball` and `app` are line-based: one expression rewrites side-effect imports (`^import 'pkg/...'`), the other rewrites the first ` from 'pkg/...'` occurrence on any line. The `from` rule is not anchored to import syntax, so a ` from '...'` sequence inside a string or comment in shipped code would be rewritten too — avoid writing one.

## BareScript and `markdown-script` blocks

When working on anything that touches `markdown-script` fenced blocks, the BareScript runtime, or functions in `scriptLibrary.js`, use the `bare-script` skill — it has the language reference and built-in library docs.
