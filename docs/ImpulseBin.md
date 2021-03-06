node.js CLI module runner

_Source: [lib/impulse-bin/index.js](../lib/impulse-bin/index.js)_

<a name="tableofcontents"></a>

- <a name="toc_exportsimpulsebin"></a><a name="toc_exports"></a>[exports.ImpulseBin](#exportsimpulsebin)
- <a name="toc_exportscreate"></a>[exports.create](#exportscreate)
- <a name="toc_exportsextendext"></a>[exports.extend](#exportsextendext)
- <a name="toc_impulsebin"></a>[ImpulseBin](#impulsebin)
- <a name="toc_impulsebinprototyperunprovider-handler-args"></a><a name="toc_impulsebinprototype"></a>[ImpulseBin.prototype.run](#impulsebinprototyperunprovider-handler-args)
- <a name="toc_impulsebinprototyperungenerator"></a>[ImpulseBin.prototype.runGenerator](#impulsebinprototyperungenerator)
- <a name="toc_impulsebinprototypecreateverboseargs"></a>[ImpulseBin.prototype.createVerbose](#impulsebinprototypecreateverboseargs)
- <a name="toc_impulsebinprototypeexitmsg-code1"></a>[ImpulseBin.prototype.exit](#impulsebinprototypeexitmsg-code1)
- <a name="toc_impulsebinprototypeexitonmissingoptionkey-exitcode"></a>[ImpulseBin.prototype.exitOnMissingOption](#impulsebinprototypeexitonmissingoptionkey-exitcode)

<a name="exports"></a>

# exports.ImpulseBin()

> Reference to [ImpulseBin](#impulsebin).

<sub>Go: [TOC](#tableofcontents) | [exports](#toc_exports)</sub>

# exports.create()

> Create a new [ImpulseBin](#impulsebin).

**Return:**

`{object}`

<sub>Go: [TOC](#tableofcontents) | [exports](#toc_exports)</sub>

# exports.extend(ext)

> Extend [ImpulseBin](#impulsebin).prototype.

**Parameters:**

- `{object} ext`

**Return:**

`{object}` Merge result.

<sub>Go: [TOC](#tableofcontents) | [exports](#toc_exports)</sub>

# ImpulseBin()

> ImpulseBin constructor.

```js
const bin = require('impulse-bin').create();
```

**Example configuration:**

```js
bin
  .set('adapter', 'optimist')
  .set('quietOption', 'silent');
```

**Configuration:**

- `{string} [adapter='commander]` Valid name of adapter in `./lib/adapter/`
- `{string} [quietOption='quiet']` Silence all loggers on `--quiet`
- `{string} [requiredOptionTmpl='--%s is required']` `exitOnMissingOption()` message template
- `{string} [verboseOption='verbose']` Enable verbose logger on `--verbose`
- `{string} [verboseLogName='[verbose]']` Prepended to each message
- `{string} [stdoutLogName='[stdout]']` Prepended to each message
- `{string} [stderrLogName='[stderr]']` Prepended to each message

**Properties:**

- `{object} adapter` Ex. `require('./lib/adapter/commander')`
- `{object} console` `LongCon` instance
- `{object} options` CLI options extracted by adapter
- `{object} provider` commander.js, optimist, etc.

**See:**

- [LongCon](https://github.com/codeactual/long-con/blob/master/docs/LongCon.md)

<sub>Go: [TOC](#tableofcontents)</sub>

<a name="impulsebinprototype"></a>

# ImpulseBin.prototype.run(provider, handler, [args]*)

> Run the handler function with a prepared context.

**Examples:**

```js
bin.run(commander, require('./path/to/handler/module'));
bin.run(optimist, require('./path/to/handler/module'));
yield bin.runGenerator(commander, require('./path/to/handler/module'));
```

**`handler` module must export:**

- `{function} init` Set option/arg expectations
  - Receives one argument: `provider` object
- `{function} run` Respond to parsed options/args
  - Receives no arguments

**Parameters:**

- `{object} provider` Ex. commander.js or optimist module
- `{object} handler` User-defined module with init/run/etc. functions
- `{mixed} [args]*` Remaining args are passed to handler module's `run`.

<sub>Go: [TOC](#tableofcontents) | [ImpulseBin.prototype](#toc_impulsebinprototype)</sub>

# ImpulseBin.prototype.runGenerator()

> GeneratorFunction compatible version of [ImpulseBin.prototype.run](#impulsebinprototyperunprovider-handler-args).

<sub>Go: [TOC](#tableofcontents) | [ImpulseBin.prototype](#toc_impulsebinprototype)</sub>

# ImpulseBin.prototype.createVerbose(args*)

> Create a logger that respects `--verbose`, or the flag with a name
matching the `verboseOption` config value.

**Examples:**

```js
const log = bin.createVerbose();
fn('key: %s', key);
fn.push('method entered: %s', name);
fn.pop('method exited: %s', name);
```

**Parameters:**

- `{mixed} args*` `LongCon#create` arguments

**Return:**

`{function}` `long-con` logger function

**See:**

- [LongCon](https://github.com/codeactual/long-con/blob/master/docs/LongCon.md)

<sub>Go: [TOC](#tableofcontents) | [ImpulseBin.prototype](#toc_impulsebinprototype)</sub>

# ImpulseBin.prototype.exit(msg, [code=1])

> Exit process.

**Examples:**

```js
bin.exit('bailing'); // status code = 1
bin.exit('no more work', 0); // status code = 0
bin.exit('no config file', 2); // status code = 2
```

**Parameters:**

- `{string} msg` Message sent to stderr
- `{number} [code=1]` Status code

<sub>Go: [TOC](#tableofcontents) | [ImpulseBin.prototype](#toc_impulsebinprototype)</sub>

# ImpulseBin.prototype.exitOnMissingOption(key, exitCode)

> Exit if the given CLI options are undefined.

**Examples:**

```js
bin.exitOnMissingOption('config', 2); // status code = 2
bin.exitOnMissingOption(['config', 'file'], 3); // status code = 3
```

**Parameters:**

- `{string | array} key`
- `{number} exitCode`

<sub>Go: [TOC](#tableofcontents) | [ImpulseBin.prototype](#toc_impulsebinprototype)</sub>

_&mdash;generated by [apidox](https://github.com/codeactual/apidox)&mdash;_
