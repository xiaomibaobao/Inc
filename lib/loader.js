/*eslint no-console: 0, no-eval: 0, no-useless-call: 0, no-loop-func: 0*/
var store = require('./store');
var merge = require('./merge');

var loader = {};

loader.store = store;
loader.merge = merge;

/**
 * bizname 用来区分不用业务的存储空间
 * store 是否使用本地存储
 * serverUrl 增量代理服务器地址
 * cdnUrl cdn地址
 */
var configure = { bizname: '', isStore: false, serverUrl: '', cdnUrl: '' };
var configureMaps = {
    bizname: function (name) {
        store.setPrefix(name + ':');
    },
    serverUrl: merge.setUrl,
    cdnUrl: merge.setCdnUrl
};


// 加载队列
var loadQueue = {};

var loaded = {};
var loading = {};
var afreshLoaded = {};
var modules = {};


// eval js
var globalEval = function (data) {
    if (data && /\S/.test(data)) {
        // (window.execScript || function(data) {
        window.eval.call(window, data);
        // })(data)
    }
};

// script方式载入js
var scriptCall = function (url, callback) {
    var script = document.createElement('script');
    script.async = true;
    script.onload = callback;
    script.src = url;
    document.head.appendChild(script);
};

// 统一的执行js 方式
var jsCall = function (url, module, callback) {
    setTimeout(function () {
        var data = modules[url];
        if (data && data !== '') {
            try {
                globalEval(modules[url]);
                callback();
            } catch (e) {
                store.removeItem(module);
                scriptCall(url, callback);
            }
        } else {
            store.removeItem(module);
            scriptCall(url, callback);
        }
    }, 0);
};

// 遍历出需要加载的 modules
var ergodicScripts = function (scripts, asserts, callback) {
    var length = asserts.length;
    var hook = function () {
        if (!--length && callback) {
            callback(scripts);
        }
    };

    if (length === 0) {
        if (callback) {
            callback();
        }
        return;
    }

    for (var i = 0; i < asserts.length; i++) {
        var moduleName = asserts[i];
        var current = loadQueue[moduleName];

        if (typeof (module) !== 'function' && typeof (current) !== 'undefined') {
            if (current.rely && current.rely.length !== 0) {
                ergodicScripts(scripts, current.rely, (function (_current) {
                    return function () {
                        scripts.push(moduleName);
                        hook();
                    };
                })(current));
            } else {
                scripts.push(moduleName);
                hook();
            }
        } else {
            hook();
        }
    }
};

// 加载 script
var loadScript = function (url, module, isStore, version, callback) {
    if (loading[url] && !afreshLoaded[url]) {
        if (callback) {
            setTimeout(function () {
                loadScript(url, module, isStore, version, callback);
            }, 5);
            return;
        }
        return;
    }

    if (loaded[url] && modules[url] && !afreshLoaded[url]) {
        if (callback) {
            callback(modules[url]);
            return;
        }
        return;
    }

    loading[url] = true;
    afreshLoaded[url] = false;
    // 是否使用本地存储
    if (isStore) {
        var moduleData = store.getItem(module) || {};
        var moduleContent = moduleData.c || '';
        var moduleURL = moduleData.u || '';

        if (moduleURL === url) {
            loaded[url] = true;
            loading[url] = false;
            modules[url] = moduleContent;

            if (callback) {
                callback(moduleContent);
            }
            return;
        }

        var oldUrl = version ? moduleURL : '';
        merge.merge(oldUrl, url, moduleContent, function (content) {
            if (!content && oldUrl !== '') {
                store.removeItem(module);
                afreshLoaded[url] = true;
                loadScript(url, module, isStore, null, callback);
                return;
            }

            store.setItem(module, content, version, url);
            loaded[url] = true;
            loading[url] = false;
            modules[url] = content;

            if (callback) {
                callback(content);
            }
            return;
        });
        return;
    }

    merge.merge('', url, '', function (content) {
        loaded[url] = true;
        loading[url] = false;
        modules[url] = content;
        if (callback) {
            callback(content);
        }
        return;
    });
    return;
};

// 加载资源文件
var loadScripts = function (asserts, callback) {
    ergodicScripts([], asserts, function (scripts) {
        var length = scripts.length;
        var hook = function () {
            if (!--length && callback) {
                callback();
            }
        };

        if (length === 0) {
            if (callback) {
                callback();
            }
            return;
        }

        for (var i = 0; i < scripts.length; i++) {
            var moduleName = scripts[i];
            var current = loadQueue[moduleName];
            loadScript(current.path, moduleName, configure.isStore, current.version, hook);
        }
    });
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
                    jsCall(_current.path, module, hook);
                };
            })(current));
        } else {
            jsCall(current.path, module, hook);
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

    if (configureMaps[name]) {
        configureMaps[name](conf);
    }

    return conf;
};

var add = function (name, conf) {
    if (!name || !conf) {
        return;
    }

    loadQueue[name] = typeof conf === 'string' ? { path: conf } : conf;
};

var adds = function (conf) {
    if (!conf.modules) return;

    for (var module in conf.modules) {
        if (conf.modules.hasOwnProperty(module)) {
            var module_config = conf.modules[module];

            if (!conf.modules.hasOwnProperty(module)) continue;
            add(module, module_config);
        }
    }
};

var use = function () {
    var callback = function () {
        return;
    };
    var args = [].slice.call(arguments);

    if (typeof (args[args.length - 1]) === 'function') {
        callback = args.pop();
    }

    if (configure.isStore) {
        loadScripts(args, function () {
            loadParallel(args, callback);
        });
    } else {
        loadParallel(args, callback);
    }
};

loader.config = config;
loader.add = add;
loader.adds = adds;
loader.use = use;

module.exports = loader;
