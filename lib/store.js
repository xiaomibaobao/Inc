/**
 * 每个存储项为一个对象
 * { 'v': 版本号, ‘c’: 实际内容 }
 */
var store = window.localStorage;

/**
 * @return Boolean
 */
function isExist (key) {
    if (!key) {
        return false;
    }
    try {
        var jsonString = store.getItem(key);
        return Boolean(jsonString);
    } catch (e) {
        return false;
    }
}

/**
 * @return Object 找不到返回 null
 */
function getItem (key) {
    if (!key) {
        return null;
    }
    try {
        var jsonString = store.getItem(key);
        if (!jsonString) {
            return null;
        }
        return JSON.parse(jsonString);
    } catch (e) {
        return null;
    }
}

/**
 * @return Boolean
 */
function setItem (key, content, version) {
    if (!key || !content || !version) {
        return false;
    }
    try {
        store.setItem(key, JSON.stringify({v: version, c: content}));
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * @return String 找不到返回 ''
 */
function getVersion (key) {
    var json = getItem(key);
    if (!json) {
        return '';
    }
    return json.v;
}

/**
 * @return String 找不到返回 ''
 */
function getContent (key) {
    var json = getItem(key);
    if (!json) {
        return '';
    }
    return json.c;
}

module.exports = {
    isExist: isExist,
    getItem: getItem,
    setItem: setItem,
    getVersion: getVersion,
    getContent: getContent
};
