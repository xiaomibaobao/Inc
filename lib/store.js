export default class Store {
    constructor (config, hook) {
        this.hook = hook;
        this.prefix = config.get('bizname'); // 储存前缀
        this.maxSize = config.get('storeMaxSize'); // 存储最大大小

        this.currentSize = 0; // 存储当前大小
        for (var i =0; i < localStorage.length; i++) {
           var storeKey = localStorage.key(i);
           if (storeKey.indexOf(this.prefix + ':') === 0) {
               var jsonString = localStorage.getItem(storeKey);
               var item = JSON.parse(jsonString);
               this.currentSize += item.c.length;
           }
        }
        if (this.isSupported()) {
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
     * 清除超出 maxSize 大小的最老数据
     * @return {Boolean}
     */
    clearSuperfluous () {
        var targetKey = '';
        var targetLength = 0;
        var targetTimestamp = 0;

        for (var i =0; i < localStorage.length; i++) {
           var storeKey = localStorage.key(i);
           if (storeKey.indexOf(this.prefix + ':') === 0) {
               var jsonString = localStorage.getItem(storeKey);
               var item = JSON.parse(jsonString);
               if (targetTimestamp === 0 || item.t < targetTimestamp) {
                   targetTimestamp = item.t;
                   targetKey = storeKey;
                   targetLength = item.c.length;
               }
           }
        }

        localStorage.removeItem(targetKey);
        this.currentSize -= targetLength;
    }

    /**
     * 获取 Localstorage 项
     * @param {string} key
     * @return {Object} { 'u': url地址, 'v': 版本号, 'c': 实际内容, 't': 时间戳 }
     */
    getItem (key) {
        if (!key) {
            return null;
        }
        var storeKey = this.prefix + ':' + key;
        var jsonString = localStorage.getItem(storeKey);
        if (!jsonString) {
            return null;
        }
        var item = JSON.parse(jsonString);
        item.t = Date.now(); // 更新时间戳
        try {
            localStorage.setItem(storeKey, JSON.stringify(item));
        } catch (e) {
            // do nothing
        }
        return item;
    }

    /**
     * 保存 Localstorage 项
     * @param {string} key
     * @param {Object} { 'u': url地址, 'v': 版本号, 'c': 实际内容, 't': 时间戳 }
     * @return {Boolean}
     */
    setItem (key, content, version, url) {
        if (!key || !content || !version || !url) {
            return false;
        }

        var size = content.length;
        if (size > this.maxSize) {
            return false;
        }

        var storeKey = this.prefix + ':' + key;
        var jsonString = localStorage.getItem(storeKey);
        if (jsonString) {
            var item = JSON.parse(jsonString);
            this.currentSize -= item.c.length;
            localStorage.removeItem(storeKey);
        }

        while (this.currentSize + size > this.maxSize) {
            this.clearSuperfluous();
        }
        try {
            localStorage.setItem(storeKey, JSON.stringify({
                u: url, v: version, c: content, t: Date.now()
            }));
            this.currentSize += size;
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 删除 Localstorage 项
     * @param {string} key
     * @return {Boolean}
     */
    removeItem (key) {
        if (!key) {
            return false;
        }
        var storeKey = this.prefix + ':' + key;
        var jsonString = localStorage.getItem(storeKey);
        if (!jsonString) {
            return true;
        }
        var item = JSON.parse(jsonString);
        this.currentSize -= item.c.length;
        localStorage.removeItem(storeKey);
        return true;
    }
}
