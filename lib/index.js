/*eslint no-eval: 0, no-useless-call: 0*/
import Hook from './hook';
import Config from './config';
import Store from './store';
import Merge from './merge';

const makeArray = (names) => {
    const arr = [];
    for (let i = 0; i < names.length; i++) {
        arr.push(names[i]);
    }
    return arr;
};

class Inc {
    constructor () {
        this.activated = true; // 是否开启前端离线化
        this.queue = {}; // 待执行模块

        const scripts = makeArray(document.getElementsByTagName('script'));
        const self = scripts.pop();
        const config = self.getAttribute('config');
        const autoload = self.getAttribute('autoload');
        const core = self.getAttribute('core');
        const callback = self.getAttribute('callback');

        this._init(config);
        this._autoload(scripts, autoload, core, callback);
    }

    /**
     * 初始化
     * @param {String} config
     */
    _init (config) {
        let cfg = {};
        if (config) {
            try {
                cfg = JSON.parse(config);
            } catch (e) {
                if (console && console.error) {
                    console.error('In Error :: attribute config not json');
                }
            }
        }

        this.config = new Config(cfg);
        this.hook = new Hook();
    }

    /**
     * 自动加载
     * @param {Array} scripts
     * @param {String} autoload
     * @param {String} core
     * @param {String} callback
     */
    _autoload (scripts, autoload, core, callback) {
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            const name = script.getAttribute('inc-name');
            const path = script.getAttribute('inc-path');
            const version = script.getAttribute('inc-version');
            const rely = script.getAttribute('inc-rely');
            if (name && path) {
                this.add(name, {
                    path,
                    version,
                    rely: rely ? rely.split(',') : []
                });
            }
        }
        if (autoload && core) {
            this.use(core, () => {
                if (callback) {
                    window.eval.call(window, callback);
                }
            });
        }
    }

    /**
     * 加载模块内容
     * @param {String} name
     * @param {Function} callback
     */
    _runLoaded (name, callback) {
        const module = this.queue[name];
        if (module.content) { // 模块内容存在则直接执行 callback
            callback(module);
            return;
        }

        const store = new Store(this.config, this.hook);
        const merge = new Merge(this.config, this.hook);

        if (!store.isSupported()) { // 存储不可用则直接执行 callback
            callback(module);
            return;
        }

        const data = store.getItem(module.name) || {};
        let {u: url, v: version, c: content} = data;
        if (version === module.version) {
            module.content = content;
            callback(module);
            return;
        }

        // url 不存在或 url 没有发生变化则请求全量
        if (!url || url === module.path) {
            merge.getFileContent(module.path, (content) => {
                if (content) {
                    module.content = content;
                }
                callback(module);
            });
        }
    }

    /**
     * 执行加载队列
     * @param {Array} args
     * @param {Function} callback
     */
    _runQueue (args, callback) {
        if (!this.activated) { // 不使用前端离线化则直接执行 callback
            callback();
            return;
        }

        const modules = [];

        // 遍历树
        const tree = (names) => {
            for (let i = 0; i < names.length; i++) {
                const name = names[i];
                const module = this.queue[name];
                if (module) {
                    modules.push(name);
                    if (module.rely && module.rely.length > 0) {
                        tree(module.rely);
                    }
                }
            }
        };

        tree(args);

        for (let i = 0; i < modules.length; i++) {
            this._runLoaded(modules[i], () => {
                console.log(12);
            });
        }
        console.log(modules);
        console.log(callback);
    }

    /**
     * 加载待执行模块
     * @param {String} name
     * @param {Object} config
     */
    add (name, config) {
        if (!name || !config) {
            return;
        }
        this.queue[name] = typeof conf === 'string' ? { path: config } : config;
    }

    /**
     * 加载待执行模块
     * @param {Object} config
     */
    adds (config) {
        if (!config.modules) return;
        for (let module in config.modules) {
            if (config.modules.hasOwnProperty(module)) {
                let module_config = config.modules[module];
                if (!config.modules.hasOwnProperty(module)) continue;
                this.add(module, module_config);
            }
        }
    }

    /**
     * 执行模块
     */
    use () {
        let callback = () => {
            return;
        };

        const args = [].slice.call(arguments);
        if (typeof (args[args.length - 1]) === 'function') {
            callback = args.pop();
        }

        this._runQueue(args, callback);
    }
}

export default new Inc();
