var serverUrl = '';

/**
 * 合并算法
 * @param oldContent
 * @param incData
 * @return String 合并后的内容
 */
var _merge = function (oldContent, incData) {
    var reContent = '';
    var dataArray = incData;
    var lastArray = null;
    for (var i = 0; i < dataArray.length; i++) {
        var jObj = dataArray[i];
        if (typeof jObj === 'object') {
            var start = jObj[0] - 1;
            var len = jObj[1];
            if (lastArray) {
                start = start + lastArray[0];
            }
            lastArray = jObj;
            reContent += oldContent.substring(start, start + len);
        } else {
            reContent += jObj;
        }
    }
    return reContent;
};

/**
 * 获取 Diff 信息
 * @param source
 * @param target
 * @param callback({
 *            code: 1, // 0 为失败，1为成功
 *            data: {} // 增量数据
 *        })
 * @return
 */
var _getMixDiff = function (source, target, callback) {
    var eRealUrl = serverUrl + '?source=' + source + '&target=' + target;
    // var r = window.ActiveXObject ? new window.ActiveXObject('Microsoft.XMLHTTP'): new window.XMLHttpRequest()
    var r = new window.XMLHttpRequest();
    r.open('GET', eRealUrl, true);
    r.onreadystatechange = function () {
        if (r.readyState === 4) {
            if (r.status === 200) {
                var response = JSON.parse(r.responseText);
                if (response.code === 1) {
                    callback({code: 1, data: response.data});
                } else {
                    callback({code: 0});
                }
            } else {
                callback({code: 0});
            }
        }
    };
    return r.send(null);
};

/**
 * 获取改变后的内容
 * @param source
 * @param target
 * @param oldConetnt
 * @param callback({
 *            code: 1, // 0 为失败，1为成功
 *            content: '' // 更新后的内容
 *        })
 * @return
 */
var merge = function (source, target, oldConetnt, callback) {
    _getMixDiff(source, target, function (data) {
        if (data.code === 1) {
            callback({
                code: 1,
                content: _merge(oldConetnt, data.data)
            });
        } else {
            callback({code: 0});
        }
    });
};

// _ 前缀为私有方法，这里只是为了方便单元测试
module.exports = {
    _merge: _merge,
    _getMixDiff: _getMixDiff,
    merge: merge
};
