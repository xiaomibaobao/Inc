import Store from './store';
import Merge from './merge';

export default class Loader {
    constructor (config, hook, queue, main) {
        this.config = config;
        this.hook = hook;

        this.activated = true; // 是否开启前端离线化
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
        if (version === module.version) { // 版本相同直接取本地存储
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
                    store.setItem({
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
            }
            modules.push(name);
        };

        tree(this.main);

        let index = modules.length; // 执行索引
        if (index === 0) { // 直接 callback
            callback();
            return;
        }

        modules.forEach((module) => {
            this._runLoaded(module, () => {
                index--;
                if (index === 0) {
                    callback();
                }
            });
        });
        return;
    }

    /**
     * 执行
     * @param {Function} callback
     */
    execute (callback) {
        this._runQueue(() => {
            console.log(this.queue);
            callback();
        });
    }
}
