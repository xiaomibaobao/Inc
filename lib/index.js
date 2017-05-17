/*eslint no-eval: 0, no-useless-call: 0*/
import Hook from './hook';
import Config from './config';
import Loader from './loader';

const makeArray = (names) => {
    const arr = [];
    for (let i = 0; i < names.length; i++) {
        arr.push(names[i]);
    }
    return arr;
};

export default class Inc {
    constructor () {
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
        this.config = new Config(window[config] || {});
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

        if (autoload && (autoload === 'true' || autoload === 'yes')) {
            this.use(core, () => {
                if (callback) {
                    window.eval.call(window, callback);
                }
            });
        }
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
        const module = typeof config === 'string' ? { path: config } : config;
        module.name = name;
        this.queue[name] = module;
    }

    /**
     * 加载待执行模块
     * @param {Object} config
     */
    adds (config) {
        if (!config.modules) return;
        for (let module in config.modules) {
            if (config.modules.hasOwnProperty(module)) {
                const module_config = config.modules[module];
                if (config.type && !module_config.type) {
                    module_config.type = config.type;
                }
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

        let index = args.length; // 执行索引
        if (index === 0) { // 直接 callback
            callback();
            return;
        }

        const hook = () => {
            index--;
            if (index === 0) {
                callback();
                setTimeout(() => {
                    this.hook.doStatistics(this.config.get('reportCallback'));
                }, 0);
            }
        };

        args.forEach((main) => {
            new Loader(this.config, this.hook, this.queue, main)
                .execute(() => {
                    hook();
                });
        });
    }
}

