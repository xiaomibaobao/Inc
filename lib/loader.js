/*eslint no-console: "ignore"*/

var headElement = document.head || document.getElementsByTagName('head')[0];
var loadQueue = {};
var loaded = {};
var loading = {};
var configure = { autoload: false, core: '' };
var loader;

var loadAsserts = function (url, type, charset, callback) {
    if (loading[url]) {
        if (callback) {
            setTimeout(function () {
                loadAsserts(url, type, charset, callback);
            }, 1);
            return;
        }
        return;
    }

    if (loaded[url]) {
        if (callback) {
            callback();
            return;
        }
        return;
    }

    loading[url] = true;

    var pureurl = url.split('?')[0];
    var n;
    var t = type || pureurl.toLowerCase().substring(pureurl.lastIndexOf('.') + 1);

    if (t === 'js') {
        n = document.createElement('script');
        n.type = 'text/javascript';
        n.src = url;
        n.async = 'true';
        if (charset) {
            n.charset = charset;
        }
    } else if (t === 'css') {
        n = document.createElement('link');
        n.type = 'text/css';
        n.rel = 'stylesheet';
        n.href = url;
        loaded[url] = true;
        loading[url] = false;
        headElement.appendChild(n);
        if (callback) callback();
        return;
    }

    n.onload = n.onreadystatechange = function () {
        if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
            loading[url] = false;
            loaded[url] = true;

            if (callback) {
                callback();
            }

            n.onload = n.onreadystatechange = null;
        }
    };

    n.onerror = function () {
        loading[url] = false;

        if (callback) {
            callback();
        }

        n.onerror = null;
    };

    headElement.appendChild(n);
};

var dependencyAnalyze = function (array) {
    var riverflow = [];

    for (var i = array.length - 1; i >= 0; i--) {
        var current = array[i];

        if (typeof (current) === 'string') {
            if (!loadQueue[current]) {
                if (typeof console !== 'undefined' && console.warn) {
                    console.warn('In Error :: Module not found: ' + current);
                }

                continue;
            }

            riverflow.push(current);
            var relylist = loadQueue[current].rely;

            if (relylist) {
                riverflow = riverflow.concat(dependencyAnalyze(relylist));
            }
        } else if (typeof (current) === 'function') {
            riverflow.push(current);
        }
    }

    return riverflow;
};

var loadParallel = function (blahlist, callback) {
    var length = blahlist.length;
    var hook = function () {
        if (!--length && callback) callback();
    };

    if (length == 0) {
        callback && callback();
        return;
    }

    for (var i = 0; i < blahlist.length; i++) {
        var current = loadQueue[blahlist[i]];

        if (typeof (blahlist[i]) === 'function') {
            blahlist[i]();
            hook();
            continue;
        }

        if (typeof (current) === 'undefined') {
            console && console.warn && console.warn('In Error :: Module not found: ' + blahlist[i]);
            hook();
            continue;
        }

        if (current.rely && current.rely.length != 0) {
            loadParallel(current.rely, (function (current) {
                return function () {
                    loadAsserts(current.path, current.type, current.charset, hook);
                };
            })(current));
        } else {
            loadAsserts(current.path, current.type, current.charset, hook);
        }
    }
};

var add = function (name, config) {
    if (!name || !config || !config.path) return;
    loadQueue[name] = config;
};

var adds = function (config) {
    if (!config.modules) return;

    for (var module in config.modules) {
        if (config.modules.hasOwnProperty(module)) {
            var module_config = config.modules[module];

            if (!config.modules.hasOwnProperty(module)) continue;
            if (config.type && !module_config.type) module_config.type = config.type;
            if (config.charset && !module_config.charset) module_config.charset = config.charset;
            add.call(this, module, module_config);
        }
    }
};

var config = function (name, conf) {
    configure[name] = conf;
};

var use = function () {
    var args = [].slice.call(arguments);

    if (typeof (args[args.length - 1]) === 'function') {
        var callback = args.pop();
    }

    if (configure.core && !loaded[configure.core]) {
        loadParallel(['__core'], function () {
            loadParallel(args, callback);
        });
    } else {
        loadParallel(args, callback);
    }
};

var initialize = function () {
    var myself = (function () {
        var scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();

    var autoload = myself.getAttribute('autoload');
    var core = myself.getAttribute('core');

    if (core) {
        configure.autoload = eval(autoload);
        configure.core = core;
        add('__core', { path: configure.core });
    }

    if (configure.autoload && configure.core) {
        loader.use();
    }
};

loader.add = add;
loader.adds = adds;
loader.use = use;
loader.config = config;
loader.initialize = initialize;

module.exports = loader;
