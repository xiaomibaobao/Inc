/*eslint no-console: 0, no-eval: 0, no-useless-call: 0, no-loop-func: 0*/

var store = require('./store');
var merge = require('./merge');

var headElement = document.head || document.getElementsByTagName('head')[0];
var loadQueue = {};
var loaded = {};
var loading = {};
var afreshLoaded = {};
/**
 * bizname 用来区分不用业务的存储空间
 * autoload 是否自动加载
 * core 自动加载库
 * store 是否使用本地存储
 * serverUrl 增量代理服务器地址
 * cdnUrl cdn地址
 */
var configure = { bizname: '', autoload: false, core: '', isStore: false, serverUrl: '', cdnUrl: '' };
var loader = {
    store: store,
    merge: merge
};

// eval js
var globalEval = function (data) {
    if (data && /\S/.test(data)) {
        // (window.execScript || function(data) {
        window.eval.call(window, data);
        // })(data)
    }
};


var loadAsserts = function (url, type, charset, version, module, callback) {
    if (loading[url] && !afreshLoaded[url]) {
        if (callback) {
            setTimeout(function () {
                loadAsserts(url, type, charset, version, module, callback);
            }, 1);
            return;
        }
        return;
    }

    if (loaded[url] && !afreshLoaded[url]) {
        if (callback) {
            callback();
            return;
        }
        return;
    }

    loading[url] = true;
    afreshLoaded[url] = false;
    if (configure.isStore && version) {
        store.setPrefix(configure.bizname + ':');
        var moduleData = store.getItem(module) || {};
        var moduleContent = moduleData.c || '';
        var moduleVersion = moduleData.v || '';
        var moduleURL = moduleData.u || '';

        if (moduleVersion === version) {
            setTimeout(function () {
                try {
                    globalEval(moduleContent);

                    loaded[url] = true;
                    loading[url] = false;

                    if (callback) {
                        callback();
                    }
                } catch (e) {
                    store.removeItem(module);
                    afreshLoaded[url] = true;
                    loadAsserts(url, type, charset, null, module, callback);
                }
            }, 1);
            return;
        }

        merge.setUrl(configure.serverUrl);
        merge.setCdnUrl(configure.cdnUrl);
        merge.merge(moduleURL, url, moduleContent, function (content) {
            if (!content) {
                store.removeItem(module);
                afreshLoaded[url] = true;
                loadAsserts(url, type, charset, null, module, callback);
                return;
            }

            store.setItem(module, content, version, url);
            afreshLoaded[url] = true;
            loadAsserts(url, type, charset, version, module, callback);
            return;
        });
        return;
    }

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

var loadParallel = function (asserts, callback) {
    var length = asserts.length;
    var hook = function () {
        if (!--length && callback) callback();
    };

    if (length === 0) {
        if (callback) {
            callback();
        }
        return;
    }

    for (var i = 0; i < asserts.length; i++) {
        var module = asserts[i];
        var current = loadQueue[module];

        if (typeof (module) === 'function') {
            asserts[i]();
            hook();
            continue;
        }

        if (typeof (current) === 'undefined') {
            if (console && console.warn) {
                console.warn('In Error :: Module not found: ' + module);
            }
            hook();
            continue;
        }

        if (current.rely && current.rely.length !== 0) {
            loadParallel(current.rely, (function (_current) {
                return function () {
                    loadAsserts(_current.path, _current.type, _current.charset, _current.version, module, hook);
                };
            })(current));
        } else {
            loadAsserts(current.path, current.type, current.charset, current.version, module, hook);
        }
    }
};

var add = function (name, config) {
    if (!name || !config) {
        return;
    }

    loadQueue[name] = typeof config === 'string' ? { path: config } : config;
};

var adds = function (config) {
    if (!config.modules) return;

    for (var module in config.modules) {
        if (config.modules.hasOwnProperty(module)) {
            var module_config = config.modules[module];

            if (!config.modules.hasOwnProperty(module)) continue;
            if (config.type && !module_config.type) module_config.type = config.type;
            if (config.charset && !module_config.charset) module_config.charset = config.charset;
            add(module, module_config);
        }
    }
};

var config = function (name, conf) {
    if (arguments.length === 0) {
        return configure;
    } else if (arguments.length === 1) {
        return configure[name];
    }

    configure[name] = conf;
    return conf;
};

var use = function () {
    var callback = function () {
        return;
    };
    var args = [].slice.call(arguments);

    if (typeof (args[args.length - 1]) === 'function') {
        callback = args.pop();
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
    var isStore = myself.getAttribute('is-store');

    if (core) {
        configure.autoload = eval(autoload);
        configure.core = core;
        configure.isStore = eval(isStore);
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
