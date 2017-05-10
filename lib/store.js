export default class Store {
    constructor (config, hook) {
        this.hook = hook;
        this.prefix = config.get('store.prefix'); // 储存前缀
        this.maxSize = config.get('store.maxSize'); // 存储最大大小

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
    isSupported () {
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
    }

    /**
     * 清楚超出 maxSize 大小的最老数据
     * @return {Boolean}
     */
    clearSuperfluous () {
        // TODO
    }

    /**
     * 获取 Localstorage 项
     * @param {string} key
     * @return {Object} { 'u': url地址, 'v': 版本号, 'c': 实际内容, 't': 时间戳, 's': 内容大小 }
     */
    getItem (key) {
        // TODO
    }

    /**
     * 保存 Localstorage 项
     * @param {string} key
     * @param {Object} { 'u': url地址, 'v': 版本号, 'c': 实际内容, 't': 时间戳, 's': 内容大小 }
     * @return {Boolean}
     */
    setItem (key, value) {
        // TODO
    }

    /**
     * 删除 Localstorage 项
     * @param {string} key
     * @return {Boolean}
     */
    removeItem (key) {
        // TODO
    }
}
