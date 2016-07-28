# configuratoror
Simple module to load inheritable configs from folder

From the `folder` path you specify, `configuratoror` loads all `.js` files in memory. It parses them and returns a config loader that returns a config.

## install

```
npm i configuratoror
```

## usage
```
var options = {
    folder: './etc', // path from pwd to folder where configs are stored
};
var env = process.env.NODE_ENV; // it's up to you how to determine what environment you're running in
var config = require('configuratoror')(options)(env);
```

## details

- from the `optiosn.folder`, only `.js` config files can be loaded. The config files are loaded using `require`, so they need to use `module.exports`.
- to determine which config files are present in `options.folder`, `fs.readdirSync` is used. This removes the need for callbacks, but introduces a `sync` step. If you absolutely want the shortest boot time, don't use this module (although I doubt you'll notice the difference).
- a config can define another config that it will extend by specifying `_extends: '<name of other config>'`. Properties in the extending config overwrite properties in the extended config. There's no maximum to the amount of inheritance levels.
- configs are deeply merged using [lodash.merge](https://lodash.com/docs#merge).
- this module throws errors. The reason for this is that if your config fails to load, your process should die. If you disagree (for your specific use case), don't use this module or `try-catch` your way out of it.

## warning
There's currently no protection against indirectly self-referencing configs, e.g. A -> B -> A. If you setup your configs like this, the process will crash because it will get into an infinite loop.
