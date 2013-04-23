  - [ImpulseBin()](#impulsebin)
  - [ImpulseBin.loadAdapter()](#impulsebinloadadapternamestring)
  - [ImpulseBin.run()](#impulsebinrunproviderobjecthandlerfunction)
  - [ImpulseBin.createVerbose()](#impulsebincreateverboseargsmixed)
  - [ImpulseBin.exit()](#impulsebinexitmsgstringcode1number)
  - [ImpulseBin.exitOnMissingOption()](#impulsebinexitonmissingoptionkeystringarrayexitcodenumber)
  - [ImpulseBin.exitOnShelljsErr()](#impulsebinexitonshelljserrresobject)

## ImpulseBin()

  Usage:
  
```js
  var bin = require('impulse-bin').create(); // new ImpulseBin() instance
```

  
  Example configuration:
  
```js
  bin
    .set('adapter', 'optimist')
    .set('quietOption', 'silent');
```

  
   Configuration:
  
   - `{string} [adapter='commander]` Valid name of adapter in `./lib/adapter/`
   - `{string} [quietOption='quiet']` Silence all loggers on `--quiet`
   - `{string} [requiredOptionTmpl='--%s is required']` `exitOnMissingOption()` message template
   - `{string} [verboseOption='verbose']` Enable verbose logger on `--verbose`
   - `{string} [verboseLogName='[verbose]']` Prepended to each message
   - `{string} [stdoutLogName='[stdout]']` Prepended to each message
   - `{string} [stderrLogName='[stderr]']` Prepended to each message
  
   Properties:
  
   - `{object} adapter` Ex. `require('./lib/adapter/commander')`
   - `{object} console` long-con instance
   - `{object} options` CLI options extracted by adapter
   - `{object} provider` commander.js, optimist, etc.

## ImpulseBin.loadAdapter(name:string)

  Wrap adapter require() for stubbing.

## ImpulseBin.run(provider:object, handler:function)

  Run the handler function with a prepared context.
  
  Examples:
  
```js
  bin.run(commander, require('./path/to/handler/module'));
  bin.run(optimist, require('./path/to/handler/module'));
```

## ImpulseBin.createVerbose(args*:mixed)

  Create a logger that respects `--verbose`, or the flag with a name
  matching the `verboseOption` config value.
  
  Examples:
  
```js
  var log = bin.createVerbose();
  fn('key: %s', key);
  fn.push('method entered: %s', name);
  fn.pop('method exited: %s', name);
```

## ImpulseBin.exit(msg:string, [code=1]:number)

  Exit process.
  
  Examples:
  
```js
  bin.exit('bailing'); // status code = 1
  bin.exit('no more work', 0); // status code = 0
  bin.exit('no config file', 2); // status code = 2
```

## ImpulseBin.exitOnMissingOption(key:string|array, exitCode:number)

  Exit if the given CLI options are undefined.
  
  Examples:
  
```js
  bin.exitOnMissingOption('config', 2); // status code = 2
  bin.exitOnMissingOption(['config', 'file'], 3); // status code = 3
```

## ImpulseBin.exitOnShelljsErr(res:object)

  Exit if the ShellJS exec() result object indicates an error.
  
  - `output` string will be sent to stderr.
  
  Example:
  
```js
  var res = bin.shelljs._('exec', ...);
  bin.exitOnShelljsErr(res);
```

