# loglabels

LogLabels is a small library that allows you to prefix your logs with static
metadata, and create child logs with independent logging levels. It uses bound 
versions of the `console` log functions so line numbers and stack traces are 
preserved.

## Installation and Use

`npm install loglabels`

```javascript
var logger = require('loglabels');

logger.log('CommonJS');
// -> [LOG] CommonJS
```

```javascript
define(['loglabels'], function(logger) {
    logger.log('AMD');
    // -> [LOG] AMD
});
```

```html
<script type="text/javascript" src="loglabels.js"></script>
<script type="text/javascript">
   var logger = window.loglabels;
   
   logger.log('Browser')
</script>
```

## Example

```javascript
//
// ComponentA.js
//

const logger = require('logger');
const log = logger.get('CPA');

log.info('Detailed information');
log.log('More information');

//
// ComponentB.js
//

const logger = require('logger');
const log = logger.get('CPB', {
    level: logger.levels.trace
});

log.trace('Debugging!');
log.log('Other info');

//
// Main.js
//

const logger = require('logger');

logger.setLevel(logger.levels.log);

require('ComponentA');
require('ComponentB');

// -> [LOG][CPA] More information
// -> [TRACE][CPB] Trace: Debugging!
//         at ...
//         at ...
// -> [LOG][CPB] Other info
```

## API

#### new LogLabels(options)

Note that LogLabels provides a new logger using the default options, not the
constructor directly. In order to create a new log use `LogLabels.get()`.

* `options.prefixes` — The prefixes that this log will use. It accepts only static
strings, and `$level` which will be converted to the method name in uppercase 
(default = `["$level"]`).
* `options.separator` — The separator to use for this log's prefixes (default = 
`"]["`).
* `options.format` — A string defining the format to use for the prefix block. 
`%p` is replaced with the prefix block (default = `"[%p]"`).
* `options.level` — The starting log level (default = `log.levels.trace`).

#### LogLabels.level(...args)

Uses the console to log `...args` at the given level. Available log levels 
(in order) are `trace`, `info`, `log`, `warn`, and `error`.

* `...args` — An argument array that will be passed to the corresponding 
`console.level` function.

```javascript
log.warn('Important information about', username);
// -> [WARN] Important information about Joe
```

#### LogLabels.setLevel(level)

Sets the log to redirect all methods below `level` to a no op.

* `level` — The minimum log level to display.

```javascript
log.setLevel(log.levels.log);

log.info('Minor details');
// -> noop()

log.log('Useful information!')
// -> [LOG] Useful information!
```

#### LogLabels.getLevel()

Returns the current logging level.

```javascript
log.setLevel(log.levels.warn);

assert(log.getLevel() === log.levels.warn);
```

#### LogLabels.get(name [, options])

Gets or creates a child log named `name`. No duplicate names are allowed, 
regardless of which log you call this on. All options default to the value used
by the parent log, unless otherwise noted.

* `name` — The name of the child log.
* `options.inheritPrefixes` — Whether or not to inherit prefixes from the parent
log (default = `true`).
* `options.prefixes` — The prefixes that this log will use (default = `[name]`).
* `options.separator` — The separator to use for this log's prefixes.
* `options.format` — A string defining the format to use for the prefix block.
* `options.level` — The starting log level.

```javascript
var childA = log.get('A'),
    childB = log.get('B', { inheritPrefixes: false }),
    childC = log.get('C', { prefixes: ['another', 'prefix'] });

childA.log('From child A!');
childB.log('From child B!');
childB.log('From child C!');

// -> [LOG][A] From child A!
// -> [B] From child B!
// -> [LOG][another][prefix] From child C!
```

## Building

`build.js` simply copies `index.js` to `dist/loglabels.js` and minifies it using
UglifyJS to `dist/loglabels.min.js`.

```
npm install
node ./build
```