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

	window.inc = __webpack_require__(1);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _hook = __webpack_require__(2);

	var _hook2 = _interopRequireDefault(_hook);

	var _config = __webpack_require__(3);

	var _config2 = _interopRequireDefault(_config);

	var _store = __webpack_require__(4);

	var _store2 = _interopRequireDefault(_store);

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

	        this.activated = true; // 是否开启前端离线化
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
	        if (autoload && core) {
	            this.use(core, function () {
	                if (callback) {
	                    window.eval.call(window, callback);
	                }
	            });
	        }
	    };

	    /**
	     * 加载模块内容
	     * @param {String} name
	     * @param {Function} callback
	     */


	    Inc.prototype._runLoaded = function _runLoaded(name, callback) {
	        var module = this.queue[name];
	        if (module.content) {
	            // 模块内容存在则直接执行 callback
	            callback(module);
	            return;
	        }

	        var store = new _store2.default(this.config, this.hook);
	        if (!store.isSupported()) {
	            // 存储不可用则直接执行 callback
	            callback(module);
	            return;
	        }

	        var data = store.getItem(module.name);
	        var url = data.u,
	            version = data.v,
	            content = data.c;

	        console.log(url, version, content);
	        if (version === module.version) {
	            console.log(version);
	        }
	    };

	    /**
	     * 执行加载队列
	     * @param {Array} args
	     * @param {Function} callback
	     */


	    Inc.prototype._runQueue = function _runQueue(args, callback) {
	        var _this = this;

	        if (!this.activated) {
	            // 不使用前端离线化则直接执行 callback
	            callback();
	            return;
	        }

	        var modules = [];

	        // 遍历树
	        var tree = function tree(names) {
	            for (var i = 0; i < names.length; i++) {
	                var name = names[i];
	                var module = _this.queue[name];
	                if (module) {
	                    modules.push(name);
	                    if (module.rely && module.rely.length > 0) {
	                        tree(module.rely);
	                    }
	                }
	            }
	        };

	        tree(args);

	        for (var i = 0; i < modules.length; i++) {
	            this._runLoaded(modules[i], function () {
	                console.log(12);
	            });
	        }
	        console.log(modules);
	        console.log(callback);
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
	        this.queue[name] = typeof conf === 'string' ? { path: config } : config;
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
	                if (!config.modules.hasOwnProperty(module)) continue;
	                this.add(module, module_config);
	            }
	        }
	    };

	    /**
	     * 执行模块
	     */


	    Inc.prototype.use = function use() {
	        var callback = function callback() {
	            return;
	        };

	        var args = [].slice.call(arguments);
	        if (typeof args[args.length - 1] === 'function') {
	            callback = args.pop();
	        }

	        this._runQueue(args, callback);
	    };

	    return Inc;
	}();

	exports.default = new Inc();

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
	        // TODO
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
	     * @param {Object} { 'u': url地址, 'v': 版本号, 'c': 实际内容, 't': 时间戳, 's': 内容大小 }
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

/***/ }
/******/ ]);