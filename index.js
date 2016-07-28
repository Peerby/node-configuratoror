var _ = require('lodash');
var fs = require('fs');
var path = require('path');

var privateKeys = ['_extends'];

// loads config files and returns a function that returns the parsed config
module.exports = function loadConfigs(options) {
    options = options || {};
    if (!options.folder) {
        throw new Error('options.folder parameter is required');
    }

    var foundConfigs = readConfigs(options.folder);
    if (_.isEmpty(foundConfigs)) {
        throw new Error('no configs found in config folder: ' + options.folder);
    }

    var configs = processConfigs(foundConfigs);
    console.log(require('util').inspect(configs, false, null));
    return function selectConfig(name) {
        if (!name) {
            throw new Error('name parameter is required');
        }
        if (!_.isString(name)) {
            throw new Error('name parameter should be a String');
        }
        if (!configs[name]) {
            throw new Error('config does not exist: ' + name);
        }
        return configs[name];
    };
};

// retrieves config files from user-specificied `folder`
function readConfigs(folder) {
    var folderPath = path.resolve(folder);
    var configNames;
    try {
        configNames = fs.readdirSync(folderPath);
    } catch (e) {
        throw new Error('failed to read folder: ' + folderPath);
    }
    var configs = {};
    _.each(configNames, function (name) {
        var filePath = path.join(folderPath, name);
        name = path.parse(filePath).name; // strip .js
        try {
            configs[name] = require(filePath);
        } catch (e) {
            throw new Error('failed to read config: ' + filePath);
        }
    });
    return configs;
}

// process config files retrieved from disk
function processConfigs(foundConfigs) {
    var processedConfigs = {};
    _.each(_.keys(foundConfigs), function (name) {
        processedConfigs[name] = processConfig(foundConfigs, name);
    });
    return processedConfigs;
}

// process a config by recursing through its config chain
// NOTE: not the most efficient because sub-chains might be walked more than once
//       but who cares, this runs once per process
//       and who has more than a bunch of config files anyway
// NOTE: this function prevents immediate self-referencing but not indirect
//       so A -> A throws an error, but A -> B -> A doesn't
//       and will probably just halt your process from continuing (AKA infinite loop)
function processConfig(configs, name) {
    var config = configs[name];
    if (!config._extends) {
        return config;
    }
    if (config._extends === name) {
        throw new Error('config cannot extend itself');
    }
    var extendedConfig = processConfig(configs, config._extends);
    return mergeConfigs(extendedConfig, config);
}

// merge configs and remove configuratoror-specific properties
function mergeConfigs(extendedConfig, extendingConfig) {
    var filteredExtendedConfig = _.omit(_.cloneDeep(extendedConfig), privateKeys);
    var filteredExtendingConfig = _.omit(_.cloneDeep(extendingConfig), privateKeys);
    return _.merge(filteredExtendedConfig, filteredExtendingConfig);
}

module.exports.privateKeys = privateKeys;
