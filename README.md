# configuratoror
Simple module to load inheritable configs from folder

From the `folder` path you specify `configuratoror` loads all config files in memory, parses them and returns a config loader that in turn returns a config for your `env`.

## install

```
npm i configuratoror
```

## usage
**folder structure**
```
etc/
  common.js
  production.js
  development.js
  whatever.js
```

**config files**

`common.js`:
```js
module.exports = {
    database: {
        uri: 'http://localhost:1338',
        username: 'admin'
    }
}
```

`production.js`:
```js
module.exports = {
    _extends: 'common',
    database: {
        name: 'production',
        password: 'michaeljordan',
    }
}
```

**load config**
```js
var options = {
    folder: './etc', // path from pwd to folder where configs are stored
};
var env = 'production'; // it's up to you how to determine what environment you're running in, e.g. process.env.NODE_ENV
var config = require('configuratoror')(options)(env);

console.log(config);
```

**output**
```js
{
    database: {
        uri: 'http://localhost:1338',
        username: 'admin'
        name: 'production',
        password: 'michaeljordan',
    },
}
```

## details

- the config files must end in `.js` and are loaded using NodeJS `require`, so they need to use `module.exports` to export the configuration object.
- to determine which config files are present in `options.folder`, `fs.readdirSync` is used. This removes the need for callbacks, but introduces a `sync` step. If you absolutely want the shortest boot time, don't use this module (although I doubt you'll notice the difference).
- a config can extend another config by specifying `_extends: '<name of other config>'`. Properties in the extending config overwrite properties in the extended config. There's no maximum to the amount of inheritance levels.
- configs are deeply merged using [lodash.merge](https://lodash.com/docs#merge).
- this module throws errors because your process should die when it fails to load its configuration. If you disagree (for your specific use case), don't use this module or `try-catch` your way out of it.

## warning
There's currently no protection against indirectly self-referencing configs, e.g. `A -> B -> A`. If you setup your configs like this, your process will crash because it will get into an infinite loop.
