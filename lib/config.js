const defaultConfig = {
    'activated': true, // 是否开启前端离线化
    'bizname': '', // 储存前缀
    'storeMaxSize': 0, // 存储最大大小，0 为不限制
    'prefixServerUrl': '', // diff 服务地址
    'prefixDiffFileUrl': '',  // diff 文件地址前缀
    'reportCallback' (statistic, value) { // 上报 Callback
        if (window.mta) {
            window.mta(statistic.type, statistic.name, value);
        }
    }
};

export default class Config {
    constructor (config) {
        this.config = Object.assign({}, defaultConfig, config);
    }

    /**
     * 设置属性
     * @param {string} name
     * @param value
     */
    set (name, value) {
        this.config[name] = value;
    }

    /**
     * 获取属性
     * @param {string} name
     * @param value
     */
    get (name) {
        return this.config[name];
    }
}
