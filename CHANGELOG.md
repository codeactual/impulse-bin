# 0.2.0

## breaking

- fix(run): do not inject `child_process/fs/shelljs/util`
  - `child_process/fs/util`: can easily be loaded by the `run()` as
    needed, no real added value
  - `shelljs`: there's less need now that alternatives like `co-exec` and
    `syncExec` exist
- refactor(node): Migrate to ES6 features like `let` and `const`
  - Switch to `iojs` as only build target

## non-breaking

- feat: add `GeneratorFunction` support via `runGenerator(provider, handler)`
- refactor(component): Migrate to NPM-only deps
- style(jshint): Migrate to eslint

# 0.1.5

- chore(npm) Upgrade outdated deps

# 0.1.4

- feat(run): Pass extra arguments to handler module's `run`.
- chore(npm) Upgrade outdated dev dependencies

# 0.1.3

- chore(npm) Upgrade outdated dev dependencies

# 0.1.2

- Upgrade `apidox` and dependents.

# 0.1.1

- Remove NPM shrinkwrapping.

# 0.1.0

- Initial API: `run()`, `createVerbose()`, `exit()`, `exitOnMissingOption()`, `exitOnShelljsErr()`.
- Initial injected dependencies: `child_process`, `fs`, `cli-color`, `shelljs`, `util`.
