/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _index = __webpack_require__(1);

	var _index2 = _interopRequireDefault(_index);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	window.Inc = window.inc = new _index2.default();

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _hook = __webpack_require__(2);

	var _hook2 = _interopRequireDefault(_hook);

	var _config = __webpack_require__(3);

	var _config2 = _interopRequireDefault(_config);

	var _loader = __webpack_require__(4);

	var _loader2 = _interopRequireDefault(_loader);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /*eslint no-eval: 0, no-useless-call: 0*/


	var makeArray = function makeArray(names) {
	    var arr = [];
	    for (var i = 0; i < names.length; i++) {
	        arr.push(names[i]);
	    }
	    return arr;
	};

	var Inc = function () {
	    function Inc() {
	        _classCallCheck(this, Inc);

	        this.queue = {}; // 待执行模块

	        var scripts = makeArray(document.getElementsByTagName('script'));
	        var self = scripts.pop();
	        var config = self.getAttribute('config');
	        var autoload = self.getAttribute('autoload');
	        var core = self.getAttribute('core');
	        var callback = self.getAttribute('callback');

	        this._init(config);
	        this._autoload(scripts, autoload, core, callback);
	    }

	    /**
	     * 初始化
	     * @param {String} config
	     */


	    Inc.prototype._init = function _init(config) {
	        var cfg = {};
	        if (config) {
	            try {
	                cfg = JSON.parse(config);
	            } catch (e) {
	                if (console && console.error) {
	                    console.error('In Error :: attribute config not json');
	                }
	            }
	        }

	        this.config = new _config2.default(cfg);
	        this.hook = new _hook2.default();
	    };

	    /**
	     * 自动加载
	     * @param {Array} scripts
	     * @param {String} autoload
	     * @param {String} core
	     * @param {String} callback
	     */


	    Inc.prototype._autoload = function _autoload(scripts, autoload, core, callback) {
	        for (var i = 0; i < scripts.length; i++) {
	            var script = scripts[i];
	            var name = script.getAttribute('inc-name');
	            var path = script.getAttribute('inc-path');
	            var version = script.getAttribute('inc-version');
	            var rely = script.getAttribute('inc-rely');
	            if (name && path) {
	                this.add(name, {
	                    path: path,
	                    version: version,
	                    rely: rely ? rely.split(',') : []
	                });
	            }
	        }

	        if (autoload && (autoload === 'true' || autoload === 'yes')) {
	            this.use(core, function () {
	                if (callback) {
	                    window.eval.call(window, callback);
	                }
	            });
	        }
	    };

	    /**
	     * 加载待执行模块
	     * @param {String} name
	     * @param {Object} config
	     */


	    Inc.prototype.add = function add(name, config) {
	        if (!name || !config) {
	            return;
	        }
	        var module = typeof config === 'string' ? { path: config } : config;
	        module.name = name;
	        this.queue[name] = module;
	    };

	    /**
	     * 加载待执行模块
	     * @param {Object} config
	     */


	    Inc.prototype.adds = function adds(config) {
	        if (!config.modules) return;
	        for (var module in config.modules) {
	            if (config.modules.hasOwnProperty(module)) {
	                var module_config = config.modules[module];
	                if (config.type && !module_config.type) {
	                    module_config.type = config.type;
	                }
	                this.add(module, module_config);
	            }
	        }
	    };

	    /**
	     * 执行模块
	     */


	    Inc.prototype.use = function use() {
	        var _this = this;

	        var callback = function callback() {
	            return;
	        };

	        var args = [].slice.call(arguments);
	        if (typeof args[args.length - 1] === 'function') {
	            callback = args.pop();
	        }

	        var index = args.length; // 执行索引
	        if (index === 0) {
	            // 直接 callback
	            callback();
	            return;
	        }

	        var hook = function hook() {
	            index--;
	            if (index === 0) {
	                callback();
	                setTimeout(function () {
	                    _this.hook.doStatistics();
	                }, 0);
	            }
	        };

	        args.forEach(function (main) {
	            new _loader2.default(_this.config, _this.hook, _this.queue, main).execute(function () {
	                hook();
	            });
	        });
	    };

	    return Inc;
	}();

	exports.default = Inc;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Hook = function () {
	    function Hook(prefix, maxSize) {
	        _classCallCheck(this, Hook);

	        this.statistics = { // 统计项目
	            storeCurrentSize: { type: 'count', name: 'inc.storeCurrentSize' }, // 当前使用存储大小
	            storeGetItemTime: { type: 'timing', name: 'inc.storeGetItemTime' }, // 读取存储执行时间
	            mergeTime: { type: 'timing', name: 'inc.mergeTime' }, // 合并文件耗时
	            mergeFetchDiffDataTime: { type: 'timing', name: 'inc.mergeFetchDiffDataTime' }, // 获取增量文件耗时
	            mergeFetchDiffDataFailCount: { type: 'count', name: 'inc.mergeFetchDiffDataFailCount' }, // 获取增量文件失败统计
	            mergeFetchDiffDataSize: { type: 'count', name: 'inc.mergeFetchDiffDataSize' }, // 增量文件大小
	            mergeFetchFileContentTime: { type: 'count', name: 'inc.mergeFetchFileContentTime' }, // 获取全量文件耗时
	            mergeFetchFileContentSize: { type: 'count', name: 'inc.mergeFetchFileContentSize' }, // 全量文件大小
	            loaderScriptEvalTime: { type: 'timing', name: 'inc.loaderScriptEvalTime' } // script 执行时间
	        };
	        this.tasks = []; // 上报任务
	    }

	    /**
	     * 添加上报任务
	     * @param {string} name
	     * @param {number} value
	     */


	    Hook.prototype.push = function push(name, value) {
	        this.tasks.push([name, value]);
	    };

	    /**
	     * 执行统计
	     */


	    Hook.prototype.doStatistics = function doStatistics() {
	        var _this = this;

	        if (window.mta) {
	            this.tasks.forEach(function (task) {
	                var st = _this.statistics[task[0]];
	                if (st) {
	                    window.mta(st.type, st.name, task[0]);
	                }
	            });
	        }
	    };

	    return Hook;
	}();

	exports.default = Hook;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var defaultConfig = {
	    'bizname': '', // 储存前缀
	    'storeMaxSize': 0, // 存储最大大小，0 为不限制
	    'prefixServerUrl': '', // diff 服务地址
	    'prefixDiffFileUrl': '' // diff 文件地址前缀
	};

	var Config = function () {
	    function Config(config) {
	        _classCallCheck(this, Config);

	        this.config = _extends({}, defaultConfig, config);
	    }

	    /**
	     * 设置属性
	     * @param {string} name
	     * @param value
	     */


	    Config.prototype.set = function set(name, value) {
	        this.config[name] = value;
	    };

	    /**
	     * 获取属性
	     * @param {string} name
	     * @param value
	     */


	    Config.prototype.get = function get(name) {
	        return this.config[name];
	    };

	    return Config;
	}();

	exports.default = Config;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _store = __webpack_require__(5);

	var _store2 = _interopRequireDefault(_store);

	var _merge = __webpack_require__(6);

	var _merge2 = _interopRequireDefault(_merge);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /*eslint no-eval: 0, no-useless-call: 0*/


	var Loader = function () {
	    function Loader(config, hook, queue, main) {
	        _classCallCheck(this, Loader);

	        this.config = config;
	        this.hook = hook;

	        this.head = document.head || document.getElementsByTagName('head')[0]; // head el
	        this.activated = true; // 是否开启前端离线化

	        this.queue = queue; // 队列
	        this.main = main; // 执行主函数
	    }

	    /**
	     * 加载模块内容
	     * @param {String} name
	     * @param {Function} callback
	     */


	    Loader.prototype._runLoaded = function _runLoaded(name, callback) {
	        var module = this.queue[name];
	        if (module.content) {
	            // 模块内容存在则直接执行 callback
	            callback(module);
	            return;
	        }

	        var store = new _store2.default(this.config, this.hook);
	        var merge = new _merge2.default(this.config, this.hook);

	        if (!store.isSupported()) {
	            // 存储不可用则直接执行 callback
	            callback(module);
	            return;
	        }

	        var data = store.getItem(module.name) || {};
	        var url = data.u,
	            version = data.v,
	            content = data.c;

	        if (module.version && version === module.version) {
	            // 版本相同直接取本地存储
	            module.content = content;
	            callback(module);
	            return;
	        }

	        // 更新 module 内容
	        var updateModule = function updateModule(text) {
	            if (text) {
	                module.content = text;
	                // 异步更新内容
	                setTimeout(function () {
	                    store.setItem(module.name, {
	                        u: module.path,
	                        v: module.version,
	                        c: module.content
	                    });
	                }, 0);
	            }
	            callback(module);
	        };

	        if (url && url !== module.path) {
	            // url 存在并且 url 发生变化
	            merge.getMergeContent(url, module.path, content, updateModule);
	            return;
	        }

	        merge.getFileContent(module.path, updateModule);
	        return;
	    };

	    /**
	     * 执行加载队列
	     * @param {Function} callback
	     */


	    Loader.prototype._runQueue = function _runQueue(callback) {
	        var _this = this;

	        if (!this.activated) {
	            // 不使用前端离线化则直接执行 callback
	            callback();
	            return;
	        }

	        var modules = [];

	        // 遍历树
	        var tree = function tree(name) {
	            var module = _this.queue[name];
	            if (module) {
	                if (module.rely && module.rely.length > 0) {
	                    for (var i = 0; i < module.rely.length; i++) {
	                        tree(module.rely[i]);
	                    }
	                }
	                modules.push(module.name);
	            }
	        };

	        tree(this.main);

	        var index = modules.length; // 执行索引
	        if (index === 0) {
	            // 直接 callback
	            callback();
	            return;
	        }

	        var hook = function hook() {
	            index--;
	            if (index === 0) {
	                callback();
	            }
	        };

	        modules.forEach(function (module) {
	            _this._runLoaded(module, hook);
	        });
	    };

	    /**
	     * 执行模块
	     * @param {Object} module
	     * @param {Function} callback
	     */


	    Loader.prototype._runModule = function _runModule(module, callback) {
	        var path = module.path,
	            content = module.content;

	        var pureUrl = path.split('?')[0];
	        var type = module.type || pureUrl.toLowerCase().substring(pureUrl.lastIndexOf('.') + 1);
	        if (type === 'js') {
	            if (content && this.scriptRun(content)) {
	                callback();
	            } else {
	                var script = this.scriptInject(path);
	                script.onload = script.onreadystatechange = function () {
	                    callback();
	                };
	            }
	        } else if (type === 'css') {
	            var isContent = Boolean(content);
	            var style = this.styleInject(isContent ? content : path, isContent);
	            style.onload = style.onreadystatechange = function () {
	                callback();
	            };
	        } else {
	            if (console && console.warn) {
	                console.warn('Inc Error :: Module type not js or css: ' + module.name);
	            }
	            callback();
	        }
	    };

	    /**
	     * 递归执行
	     * @param {Array} names
	     * @param {Function} callback
	     */


	    Loader.prototype.__recursionExecute = function __recursionExecute(names, callback) {
	        var _this2 = this;

	        var index = names.length; // 执行索引
	        if (index === 0) {
	            // 直接 callback
	            callback();
	            return;
	        }

	        var hook = function hook() {
	            index--;
	            if (index === 0) {
	                callback();
	            }
	        };

	        names.forEach(function (name) {
	            var module = _this2.queue[name];
	            if (typeof module === 'undefined') {
	                if (console && console.warn) {
	                    console.warn('Inc Error :: Module not found: ' + name);
	                }
	                hook();
	            } else if (module.rely && module.rely.length > 0) {
	                _this2.__recursionExecute(module.rely, function () {
	                    _this2._runModule(module, function () {
	                        hook();
	                    });
	                });
	            } else {
	                _this2._runModule(module, function () {
	                    hook();
	                });
	            }
	        });
	    };

	    /**
	     * 注入 style
	     * @param {String} src
	     * @param {Boolean} isContent 是否是样式内容
	     * @return {Dom}
	     */


	    Loader.prototype.styleInject = function styleInject(src) {
	        var isContent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	        if (isContent) {
	            var _style = document.createElement('style');
	            _style.type = 'text/css';
	            _style.innerHTML = src;
	            this.head.appendChild(_style);
	            return _style;
	        }

	        var style = document.createElement('link');
	        style.type = 'text/css';
	        style.rel = 'stylesheet';
	        style.href = src;
	        this.head.appendChild(style);
	        return style;
	    };

	    /**
	     * 注入 script
	     * @param {String} src
	     * @param {Boolean} isContent 是否是脚本内容
	     * @return {Dom}
	     */


	    Loader.prototype.scriptInject = function scriptInject(src) {
	        var isContent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	        var script = document.createElement('script');
	        script.type = 'text/javascript';
	        script.async = 'true';
	        if (isContent) {
	            script.innerHTML = src;
	        } else {
	            script.src = src;
	        }
	        this.head.appendChild(script);
	        return script;
	    };

	    /**
	     * 注入 script
	     * @param {String} content
	     * @return {Boolean}
	     */


	    Loader.prototype.scriptRun = function scriptRun(content) {
	        if (!content || !/\S/.test(content)) {
	            return false;
	        }

	        try {
	            window.eval.call(window, content);
	            return true;
	        } catch (e) {
	            if (console && console.warn) {
	                console.warn(e);
	            }
	            return false;
	        }
	    };

	    /**
	     * 执行
	     * @param {Function} callback
	     */


	    Loader.prototype.execute = function execute(callback) {
	        var _this3 = this;

	        this._runQueue(function () {
	            _this3.__recursionExecute([_this3.main], callback);
	        });
	    };

	    return Loader;
	}();

	exports.default = Loader;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Store = function () {
	    function Store(config, hook) {
	        _classCallCheck(this, Store);

	        this.hook = hook;
	        this.prefix = config.get('bizname'); // 储存前缀
	        this.maxSize = config.get('storeMaxSize'); // 存储最大大小

	        this.currentSize = -1; // 存储当前大小
	        if (this.isSupported()) {
	            this.currentSize = localStorage.getItem(this.prefix + ':incCurrentSize') || -1;
	            this.hook.push('storeCurrentSize', this.currentSize);
	        }
	    }

	    /**
	     * 判断当前环境是否支持 Localstorage
	     * @return {Boolean}
	     */


	    Store.prototype.isSupported = function isSupported() {
	        try {
	            // api 支持情况
	            if (!('localStorage' in window && window.localStorage)) {
	                return false;
	            }
	            /**
	             * 存储异常情况下
	             * 1.已经存满
	             * 2.只读情况(隐身模式)
	             */
	            localStorage.setItem('-.-', 1);
	            localStorage.removeItem('-.-');
	        } catch (err) {
	            localStorage.clear();
	            return false;
	        }
	        return true;
	    };

	    /**
	     * 清楚超出 maxSize 大小的最老数据
	     * @return {Boolean}
	     */


	    Store.prototype.clearSuperfluous = function clearSuperfluous() {}
	    // TODO


	    /**
	     * 获取 Localstorage 项
	     * @param {string} key
	     * @return {Object} { 'u': url地址, 'v': 版本号, 'c': 实际内容, 't': 时间戳, 's': 内容大小 }
	     */
	    ;

	    Store.prototype.getItem = function getItem(key) {}
	    // TODO


	    /**
	     * 保存 Localstorage 项
	     * @param {string} key
	     * @param {Object} { 'u': url地址, 'v': 版本号, 'c': 实际内容 }
	     * @return {Boolean}
	     */
	    ;

	    Store.prototype.setItem = function setItem(key, value) {}
	    // TODO


	    /**
	     * 删除 Localstorage 项
	     * @param {string} key
	     * @return {Boolean}
	     */
	    ;

	    Store.prototype.removeItem = function removeItem(key) {
	        // TODO
	    };

	    return Store;
	}();

	exports.default = Store;

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Merge = function () {
	    function Merge(config, hook) {
	        _classCallCheck(this, Merge);

	        this.hook = hook;
	        this.prefixServerUrl = config.get('prefixServerUrl'); // diff 服务地址
	        this.prefixDiffFileUrl = config.get('prefixDiffFileUrl'); // diff 文件地址前缀
	    }

	    /**
	     * xhr
	     * @param {String} url
	     * @param {Function} callback
	     */


	    Merge.prototype._xhr = function _xhr(url, callback) {
	        // const req = window.ActiveXObject ? new window.ActiveXObject('Microsoft.XMLHTTP'): new window.XMLHttpRequest()
	        var req = new window.XMLHttpRequest();
	        req.open('GET', url, true);
	        req.onreadystatechange = function () {
	            if (req.readyState === 4) {
	                if (req.status === 200) {
	                    callback(req.responseText);
	                } else {
	                    callback();
	                }
	            }
	        };
	        return req.send(null);
	    };

	    /**
	     * 合并算法
	     * @param {String} oldContent
	     * @param {String} diffData
	     * @return {String} 合并后的内容
	     */


	    Merge.prototype._merge = function _merge(oldContent, diffData) {
	        var begin = new Date().getTime();
	        var reContent = '';
	        var lastArray = null;
	        for (var i = 0; i < diffData.length; i++) {
	            var jObj = diffData[i];
	            if ((typeof jObj === 'undefined' ? 'undefined' : _typeof(jObj)) === 'object') {
	                var start = jObj[0] - 1;
	                var len = jObj[1];
	                if (lastArray) {
	                    start = start + lastArray[0];
	                }
	                lastArray = jObj;
	                reContent += oldContent.substring(start, start + len);
	            } else {
	                reContent += jObj;
	            }
	        }
	        this.hook.push('mergeTime', new Date().getTime() - begin);
	        return reContent;
	    };

	    /**
	     * 拉去增量内容
	     * @param {String} oldUrl
	     * @param {String} newUrl
	     * @param {Function} callback ({
	     *            code: 1, // 0 失败 1 增量 2 全量 3 没有变化
	     *            data: {}
	     *        })
	     */


	    Merge.prototype._fetchDiffData = function _fetchDiffData(oldUrl, newUrl, callback) {
	        var _this = this;

	        var begin = new Date().getTime();
	        var oldPath = oldUrl.replace(/(http:|https:)/, '');
	        var newPath = newUrl.replace(/(http:|https:)/, '');
	        this._xhr(this.prefixDiffFileUrl + newPath.replace(/\//g, '') + oldPath.replace(/\//g, ''), function (responseText) {
	            if (responseText && responseText !== '') {
	                var code = responseText[responseText.length - 1];
	                if (Number(code) === 1 || Number(code) === 2) {
	                    callback({
	                        code: Number(code),
	                        data: responseText.substr(0, responseText.length - 1)
	                    });
	                } else {
	                    callback({
	                        code: Number(code)
	                    });
	                }
	                _this.hook.push('mergeFetchDiffDataSize', responseText.length);
	            } else {
	                callback({ code: 0 });
	                _this.hook.push('mergeFetchDiffDataFailCount');
	                // 通知服务器生成增量文件
	                _this._xhr(_this.prefixDiffFileUrl + '?target=' + newPath + '&source=' + oldPath, function () {
	                    return true;
	                });
	            }
	            _this.hook.push('mergeFetchFileContentTime', new Date().getTime() - begin);
	        });
	    };

	    /**
	     * 获取全量数据内容
	     * @param {String} url
	     * @param {Function} callback (content:String)
	     */


	    Merge.prototype.getFileContent = function getFileContent(url, callback) {
	        var _this2 = this;

	        try {
	            var begin = new Date().getTime();
	            this._xhr(url, function (responseText) {
	                callback(responseText);
	                _this2.hook.push('mergeFetchFileContentTime', new Date().getTime() - begin);
	                if (responseText && responseText !== '') {
	                    _this2.hook.push('mergeFetchFileContentSize', responseText.length);
	                }
	            });
	        } catch (e) {
	            callback();
	        }
	    };

	    /**
	     * 拉去增量内容
	     * @param {String} oldUrl
	     * @param {String} newUrl
	     * @param {String} oldContent
	     * @param {Function} callback (content:String)
	     */


	    Merge.prototype.getMergeContent = function getMergeContent(oldUrl, newUrl, oldContent, callback) {
	        var _this3 = this;

	        if (!this.prefixServerUrl || this.prefixServerUrl === '') {
	            if (console && console.error) {
	                console.error('In Error :: prefixServerUrl url not set');
	            }
	        }

	        if (!this.prefixDiffFileUrl || this.prefixDiffFileUrl === '') {
	            if (console && console.error) {
	                console.error('In Error :: prefixDiffFileUrl url not set');
	            }
	        }

	        try {
	            this._fetchDiffData(oldUrl, newUrl, function (payload) {
	                if (payload.code === 1) {
	                    callback(_this3._merge(oldContent, JSON.parse(payload.data)));
	                } else if (payload.code === 2) {
	                    callback(payload.data);
	                } else if (payload.code === 3) {
	                    callback(oldContent);
	                } else {
	                    callback();
	                }
	            });
	        } catch (e) {
	            callback();
	        }
	    };

	    return Merge;
	}();

	exports.default = Merge;

/***/ }
/******/ ]);