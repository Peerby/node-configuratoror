var _ = require('lodash');
var expect = require('chai').expect;

var configuratoror = require('../index.js');

var configs = {
    a: require('./config/a'),
    b: require('./config/b'),
    c: require('./config/c'),
};

describe('configuratoror', function () {
    var configLoader;
    before(function () {
        configLoader = configuratoror({ folder: './test/config' });
    });
    it('loads a non-extending config', function () {
        var a = configLoader('a');
        expect(a).to.eql(configs.a);
    });
    it('loads an extending config', function () {
        var b = _.cloneDeep(configLoader('b'));

        // private keys removed?
        expect(b._extends).to.be.an('undefined');

        // includes keys from extended configs?
        expect(b).to.include.keys(_.keys(configs.a));
        expect(b).to.include.keys(_.keys(_.omit(configs.b, configuratoror.privateKeys)));

        // properties are deeply merged?
        expect(b.something.else).to.eql('then');
    });
    it('loads a double extending config', function () {
        var c = _.cloneDeep(configLoader('c'));

        // private keys removed?
        expect(c._extends).to.be.an('undefined');

        // includes keys from extended configs?
        expect(c).to.include.keys(_.keys(configs.a));
        expect(c).to.include.keys(_.keys(_.omit(configs.b, configuratoror.privateKeys)));
        expect(c).to.include.keys(_.keys(_.omit(configs.c, configuratoror.privateKeys)));

        // properties are deeply merged?
        expect(c.something.else).to.eql({});
        expect(c.something.anything.name).to.eql('b');
        expect(c.something.anything.arr).to.eql([4, 5, 6]);
    });
});
