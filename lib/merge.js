export default class Merge {
    constructor (config, hook) {
        this.hook = hook;
        this.prefixServerUrl = config.get('prefixServerUrl'); // diff 服务地址
        this.prefixDiffFileUrl = config.get('prefixDiffFileUrl'); // diff 文件地址前缀
    }

    /**
     * xhr
     * @param {String} url
     * @param {Function} callback
     */
    _xhr (url, callback) {
        // const req = window.ActiveXObject ? new window.ActiveXObject('Microsoft.XMLHTTP'): new window.XMLHttpRequest()
        const req = new window.XMLHttpRequest();
        req.open('GET', url, true);
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    callback(req.responseText, req.responseType);
                } else {
                    callback();
                }
            }
        };
        return req.send(null);
    }

    /**
     * 合并算法
     * @param {String} oldContent
     * @param {String} diffData
     * @return {String} 合并后的内容
     */
    _merge (oldContent, diffData) {
        const begin = new Date().getTime();
        let reContent = '';
        let lastArray = null;
        for (let i = 0; i < diffData.length; i++) {
            let jObj = diffData[i];
            if (typeof jObj === 'object') {
                let start = jObj[0] - 1;
                let len = jObj[1];
                if (lastArray) {
                    start = start + lastArray[0];
                }
                lastArray = jObj;
                reContent += oldContent.substring(start, start + len);
            } else {
                reContent += jObj;
            }
        }
        this.hook.push('mergeTime', new Date().getTime() - begin);
        return reContent;
    }

    /**
     * 拉去增量内容
     * @param {String} oldUrl
     * @param {String} newUrl
     * @param {Function} callback ({
     *            code: 1, // 0 失败 1 增量 2 全量 3 没有变化
     *            data: {}
     *        })
     */
    _fetchDiffData (oldUrl, newUrl, callback) {
        const begin = new Date().getTime();
        const oldPath = oldUrl.replace(/(http:|https:)/, '');
        const newPath = newUrl.replace(/(http:|https:)/, '');
        this._xhr(this.prefixDiffFileUrl + newPath.replace(/\//g, '') + oldPath.replace(/\//g, ''), (responseText) => {
            if (responseText) {
                const code = responseText[responseText.length - 1];
                if (Number(code) === 1 || Number(code) === 2) {
                    callback({
                        code: Number(code),
                        data: responseText.substr(0, responseText.length - 1)
                    });
                } else {
                    callback({
                        code: Number(code)
                    });
                }
                this.hook.push('mergeFetchDiffDataSize', responseText.length);
            } else {
                callback({ code: 0 });
                this.hook.push('mergeFetchDiffDataFailCount');
                // 通知服务器生成增量文件
                this._xhr(this.prefixDiffFileUrl + '?target=' + newPath + '&source=' + oldPath, (responseText, responseType) => {
                    if (responseType === 'json') {           // 这里靠想象力改的，可能有问题
                        callback({
                            code: Number(responseText[responseText.length - 1]),
                            data: responseText.substr(0, responseText.length - 1)
                        });
                        this.hook.push('mergeFetchDiffDataSize', responseText.length);
                    }
                    return true;
                });
            }
            this.hook.push('mergeFetchFileContentTime', new Date().getTime() - begin);
        });
    }

    /**
     * 获取全量数据内容
     * @param {String} url
     * @param {Function} callback (content:String)
     */
    getFileContent (url, callback) {
        try {
            const begin = new Date().getTime();
            this._xhr(url, (responseText) => {
                callback(responseText);
                this.hook.push('mergeFetchFileContentTime', new Date().getTime() - begin);
                if (responseText && responseText !== '') {
                    this.hook.push('mergeFetchFileContentSize', responseText.length);
                }
            });
        } catch (e) {
            callback();
        }
    }

    /**
     * 拉去增量内容
     * @param {String} oldUrl
     * @param {String} newUrl
     * @param {String} oldContent
     * @param {Function} callback (content:String)
     */
    getMergeContent (oldUrl, newUrl, oldContent, callback) {
        if (!this.prefixServerUrl) {
            if (console && console.error) {
                console.error('In Error :: prefixServerUrl url not set');
            }
        }

        if (!this.prefixDiffFileUrl) {
            if (console && console.error) {
                console.error('In Error :: prefixDiffFileUrl url not set');
            }
        }

        try {
            this._fetchDiffData(oldUrl, newUrl, (payload) => {
                if (payload.code === 1) {
                    callback(this._merge(oldContent, JSON.parse(payload.data)));
                } else if (payload.code === 2) {
                    callback(payload.data);
                } else if (payload.code === 3) {
                    callback(oldContent);
                } else {
                    callback();
                }
            });
        } catch (e) {
            callback();
        }
    }
}
