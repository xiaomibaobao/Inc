/*eslint no-eval: 0, no-useless-call: 0*/
import Store from './store';
import Merge from './merge';

export default class Loader {
    constructor (config, hook, queue, main) {
        this.config = config;
        this.hook = hook;

        this.head = document.head || document.getElementsByTagName('head')[0]; // head el
        this.activated = config.get('activated'); // 是否开启前端离线化

        this.queue = queue; // 队列
        this.main = main; // 执行主函数
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
        const {u: url, v: version, c: content} = data;
        if (module.version && version === module.version) { // 版本相同直接取本地存储
            module.content = content;
            callback(module);
            return;
        }

        // 更新 module 内容
        const updateModule = (text) => {
            if (text) {
                module.content = text;
                // 异步更新内容
                setTimeout(() => {
                    store.setItem(module.name, {
                        u: module.path,
                        v: module.version,
                        c: module.content
                    });
                }, 0);
            }
            callback(module);
        };

        if (url && url !== module.path) { // url 存在并且 url 发生变化
            merge.getMergeContent(url, module.path, content, updateModule);
            return;
        }

        merge.getFileContent(module.path, updateModule);
        return;
    }

    /**
     * 执行加载队列
     * @param {Function} callback
     */
    _runQueue (callback) {
        if (!this.activated) { // 不使用前端离线化则直接执行 callback
            callback();
            return;
        }

        const modules = [];

        // 遍历树
        const tree = (name) => {
            const module = this.queue[name];
            if (module) {
                if (module.rely && module.rely.length > 0) {
                    for (let i = 0; i < module.rely.length; i++) {
                        tree(module.rely[i]);
                    }
                }
                modules.push(module.name);
            }
        };

        tree(this.main);

        let index = modules.length; // 执行索引
        if (index === 0) { // 直接 callback
            callback();
            return;
        }

        const hook = () => {
            index--;
            if (index === 0) {
                callback();
            }
        };

        modules.forEach((module) => {
            this._runLoaded(module, hook);
        });
    }

    /**
     * 执行模块
     * @param {Object} module
     * @param {Function} callback
     */
    _runModule (module, callback) {
        const {path, content} = module;
        const pureUrl = path.split('?')[0];
        const type = module.type || pureUrl.toLowerCase().substring(pureUrl.lastIndexOf('.') + 1);
        if (type === 'js') {
            if (content && this.scriptRun(content)) {
                callback();
            } else {
                const script = this.scriptInject(path);
                script.onload = script.onreadystatechange = () => {
                    callback();
                };
            }
        } else if (type === 'css') {
            const isContent = Boolean(content);
            const style = this.styleInject(isContent ? content : path, isContent);
            style.onload = style.onreadystatechange = () => {
                callback();
            };
        } else {
            if (console && console.warn) {
                console.warn('Inc Error :: Module type not js or css: ' + module.name);
            }
            callback();
        }
    }

    /**
     * 递归执行
     * @param {Array} names
     * @param {Function} callback
     */
    __recursionExecute (names, callback) {
        let index = names.length; // 执行索引
        if (index === 0) { // 直接 callback
            callback();
            return;
        }

        const hook = () => {
            index--;
            if (index === 0) {
                callback();
            }
        };

        names.forEach((name) => {
            const module = this.queue[name];
            if (typeof (module) === 'undefined') {
                if (console && console.warn) {
                    console.warn('Inc Error :: Module not found: ' + name);
                }
                hook();
            } else if (module.rely && module.rely.length > 0) {
                this.__recursionExecute(module.rely, () => {
                    this._runModule(module, () => {
                        hook();
                    });
                });
            } else {
                this._runModule(module, () => {
                    hook();
                });
            }
        });
    }

    /**
     * 注入 style
     * @param {String} src
     * @param {Boolean} isContent 是否是样式内容
     * @return {Dom}
     */
    styleInject (src, isContent = false) {
        if (isContent) {
            const style = document.createElement('style');
            style.type = 'text/css';
            style.textContent = src;
            this.head.appendChild(style);
            return style;
        }

        const style = document.createElement('link');
        style.type = 'text/css';
        style.rel = 'stylesheet';
        style.href = src;
        this.head.appendChild(style);
        return style;
    }

    /**
     * 注入 script
     * @param {String} src
     * @param {Boolean} isContent 是否是脚本内容
     * @return {Dom}
     */
    scriptInject (src, isContent = false) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = 'true';
        if (isContent) {
            script.textContent = src;
        } else {
            script.src = src;
        }
        this.head.appendChild(script);
        return script;
    }

    /**
     * 注入 script
     * @param {String} content
     * @return {Boolean}
     */
    scriptRun (content) {
        if (!content || !/\S/.test(content)) {
            return false;
        }

        try {
            const begin = new Date().getTime();
            window.eval.call(window, content);
            this.hook.push('loaderScriptEvalTime', new Date().getTime() - begin);
            return true;
        } catch (e) {
            if (console && console.warn) {
                console.warn(e);
            }
            return false;
        }
    }

    /**
     * 执行
     * @param {Function} callback
     */
    execute (callback) {
        this._runQueue(() => {
            this.__recursionExecute([this.main], callback);
        });
    }
}
