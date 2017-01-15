var loader = require('./lib/loader');
var merge = require('./lib/merge');

loader.initialize();

window.inc = loader;
window.inc.merge = merge;
