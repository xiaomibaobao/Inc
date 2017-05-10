export default class Config {
    constructor () {
        this.config = {
            'store.prefix': '',
            'store.maxSize': -1,
            'diff.prefixServerUrl': '',
            'diff.prefixDiffFileUrl': ''
        };
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
