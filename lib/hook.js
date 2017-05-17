export default class Hook {
    constructor () {
        this.statistics = { // 统计项目
            storeCurrentSize: { type: 'count', name: 'inc.storeCurrentSize' }, // 当前使用存储大小
            storeGetItemTime: { type: 'timing', name: 'inc.storeGetItemTime' }, // 读取存储执行时间
            mergeTime: { type: 'timing', name: 'inc.mergeTime' }, // 合并文件耗时
            mergeFetchDiffDataTime: { type: 'timing', name: 'inc.mergeFetchDiffDataTime' }, // 获取增量文件耗时
            mergeFetchDiffDataFailCount: { type: 'count', name: 'inc.mergeFetchDiffDataFailCount' }, // 获取增量文件失败统计
            mergeFetchDiffDataSize: { type: 'count', name: 'inc.mergeFetchDiffDataSize' }, // 增量文件大小
            mergeFetchFileContentTime: { type: 'count', name: 'inc.mergeFetchFileContentTime' }, // 获取全量文件耗时
            mergeFetchFileContentSize: { type: 'count', name: 'inc.mergeFetchFileContentSize' }, // 全量文件大小
            loaderScriptEvalTime: { type: 'timing', name: 'inc.loaderScriptEvalTime' } // script 执行时间
        };
        this.tasks = []; // 上报任务
    }

    /**
     * 添加上报任务
     * @param {string} name
     * @param {number} value
     */
    push (name, value) {
        this.tasks.push([name, value]);
    }

    /**
     * 执行统计
     */
    doStatistics (reportCallback) {
        if (reportCallback) {
            this.tasks.forEach((task) => {
                const statistic = this.statistics[task[0]];
                if (statistic) {
                    reportCallback(statistic, task[1]);
                }
            });
        }
    }
}
