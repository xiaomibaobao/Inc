var serverUrl = '';

// 合并算法
var mergejs = function (oldContent, incData) {
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

// 获取 Diff 信息
var mixDiff = function (url, oldUrl, callback) {
    var eRealUrl = serverUrl + '?url=' + url + '&oldUrl=' + oldUrl;
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


// 获取
var merge = function (url, oldUrl, oldConetnt, callback) {
    mixDiff(url, oldUrl, function (data) {
        if (data.code === 1) {
            callback({
                code: 1,
                content: mergejs(oldConetnt, data.data)
            });
        } else {
            callback({code: 0});
        }
    });
};


module.exports = {
    merge: merge,
    mixDiff: mixDiff
};
