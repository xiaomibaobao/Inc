export default class Store {
    constructor (config, hook) {
        this.hook = hook;
        this.prefix = config.get('bizname'); // 储存前缀
        this.maxSize = config.get('storeMaxSize'); // 存储最大大小
        this.supported = false; // 缓存isSupported结果

        this.currentSize = 0; // 存储当前大小
        if (this.isSupported()) {
            this.currentSize = Number(localStorage.getItem(this.prefix + '_:cs')); // 这里键值前缀设置为 this.prefix + '_' ，多个下划线，避免和其他键值冲突
            this.hook.push('storeCurrentSize', this.currentSize);
        }
    }

    /**
     * 判断当前环境是否支持 Localstorage
     * @param {function} fallback
     * @return {Boolean}
     */
    isSupported (fallback) {
        try {
            // api 支持情况
            if (!('localStorage' in window && window.localStorage)) {
                if(typeof fallback === 'function') fallback();
                this.supported = false;
                return false;
            }
            /**
             * 存储异常情况下
             * 1.已经存满
             * 2.只读情况(隐身模式)
             */
            localStorage.setItem('-.-', 1);
            localStorage.removeItem('-.-');
            this.supported = true;
        } catch (err) {
            localStorage.clear();
            if(typeof fallback === 'function') fallback();
            this.supported = false;
            return false;
        }
        return true;
    }

    /**
     * 清除当前的最老数据
     */
    clearSuperfluous () {
        if (!this.supported) {
            return;
        }

        var targetKey = '';
        var targetLength = 0;
        var targetTimestamp = 0;

        for (var i =0; i < localStorage.length; i++) {
           var storeKey = localStorage.key(i);
           if (storeKey.indexOf(this.prefix + ':') === 0) {
               var storeValue = localStorage.getItem(storeKey);
               var item = JSON.parse(storeValue);
               if (targetTimestamp === 0 || item.t < targetTimestamp) {
                   targetTimestamp = item.t;
                   targetKey = storeKey;
                   targetLength = storeKey.length + storeValue.length;
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
        if (!this.supported || !key) {
            return null;
        }
        var storeKey = this.prefix + ':' + key;
        var storeValue = localStorage.getItem(storeKey);
        if (!storeValue) {
            return null;
        }
        var item = JSON.parse(storeValue);
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
        if (!this.supported || !key || !content || !version || !url) {
            return false;
        }

        var storeKey = this.prefix + ':' + key;
        var storeValue = JSON.stringify({
            u: url, v: version, c: content, t: Date.now()
        });
        var size = storeKey.length + storeValue.length;
        if (this.maxSize === 0 || size > this.maxSize) {
            return false;
        }

        var oldStoreValue = localStorage.getItem(storeKey);
        if (oldStoreValue) {
            this.currentSize -= storeKey.length + oldStoreValue.length;
            localStorage.removeItem(storeKey);
        }

        while (this.currentSize + size > this.maxSize) {
            this.clearSuperfluous();
        }

        try {
            localStorage.setItem(storeKey, storeValue);
            localStorage.setItem(this.prefix + '_:cs', this.currentSize + size);
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
        if (!this.supported || !key) {
            return false;
        }
        var storeKey = this.prefix + ':' + key;
        var storeValue = localStorage.getItem(storeKey);
        if (!storeValue) {
            return true;
        }
        var size = storeKey.length + storeValue.length;
        try {
            localStorage.setItem(this.prefix + '_:cs', this.currentSize - size);
        } catch (e) {
            return false;
        }
        // 更改大小成功
        localStorage.removeItem(storeKey);
        this.currentSize -= size;
        return true;
    }
}
