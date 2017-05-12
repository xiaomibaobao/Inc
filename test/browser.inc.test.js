/* global describe, it, chai, inc, after */
/*eslint no-console: "ignore"*/

var assert = chai.assert;
var expect = chai.expect;

describe('Inc', function () {
    after(function () {
        // runs after all tests in this block
        var coverage = window.__coverage__;

        if (coverage) {
            // console.log(JSON.stringify(coverage));
        } else {
            console.log('No coverage data generated');
        }
    });

    beforeEach(function() {
        this.xhr = sinon.useFakeXMLHttpRequest();

        this.requests = [];
        this.xhr.onCreate = function (xhr) {
            this.requests.push(xhr);
        }.bind(this);
    });


    afterEach(function() {
        this.xhr.restore();

        // clear
        inc.queue = {};

        window.mod1 = undefined;
        window.mod2 = undefined;
        window.mod3 = undefined;

        window.localStorage.clear();
    });

    describe('#add(name, path) 添加模块', function () {
        it('测试首次请求，获取全量数据', function (done) {
            inc.add('_mod1', './modules/_mod1.js');
            inc.use('_mod1', function () {
                expect(window.mod1).to.equal(true);
                done();
            });

            this.requests[0].respond(200, {
                'Content-Type': 'application/javascript' 
            }, 'window.mod1 = true;');
        });

        it('测试网络请求出错', function (done) {
            inc.add('mod1', './modules/mod1.js');
            inc.use('mod1', function () {
                expect(window.mod1).to.equal(true);
                done();
            });

            this.requests[0].respond(404, {}, '');
        });

        it('测试执行代码出错', function (done) {
            inc.add('mod2', './modules/mod2.js');
            inc.use('mod2', function () {
                expect(window.mod2).to.equal(true);
                done();
            });

            this.requests[0].respond(200, {
                'Content-Type': 'application/javascript' 
            }, 'window.mod2 = true;console.log(abc.abc.abc);');
        });
    });

    describe('#add(name, object) - 使用配置', function () {
        it('测试使用配置信息', function (done) {
            inc.add('_mod1', { path: './modules/_mod1.js', type: 'js', version: '1.0' });
            inc.use('_mod1', function () {
                expect(window.mod1).to.equal(true);
                done();
            });

            this.requests[0].respond(200, {
                'Content-Type': 'application/javascript' 
            }, 'window.mod1 = true;');
        });

        it('测试执行样式文件', function (done) {
            inc.add('mod2', { path: './modules/_mod1.css', type: 'css', version: '1.0' });
            inc.use('mod2', function () {
                done();
            });

            this.requests[0].respond(200, {
                'Content-Type': 'text/css' 
            }, 'h1 {color: #2f6fad;}');
        });

        it('测试依赖', function (done) {
            inc.add('_mod1', { path: './modules/_mod1.js', type: 'js', charset: 'utf-8'});
            inc.add('_mod2', { path: './modules/_mod2.js', type: 'js', charset: 'utf-8', rely: ['_mod1'] });
            inc.use('_mod2', function () {
                expect(window.mod1).to.equal(true);
                expect(window.mod2).to.equal(true);
                done();
            });

            this.requests[0].respond(200, {
                'Content-Type': 'application/javascript' 
            }, 'window.mod1 = true;');

            this.requests[1].respond(200, {
                'Content-Type': 'application/javascript' 
            }, 'window.mod2 = true;');
        });
    });

    describe('#add(param) - 没有配置信息', function () {
        it('测试没有配置信息', function (done) {
            inc.add('mod3');
            inc.use('mod3', function () {
                console.log(window.mod3);
                expect(window.mod3).to.equal(undefined);
                done();
            });
        });
    });

    describe('#adds()', function () {
        it('测试多个配置', function (done) {
            inc.adds({
                modules: {
                    '_mod1': './modules/_mod1.js',
                    '_mod2': { path: './modules/_mod2.js', type: 'js', rely: ['_mod1'] }
                }
            });
            inc.use('_mod2', function () {
                expect(window.mod1).to.equal(true);
                expect(window.mod2).to.equal(true);
                done();
            });

            this.requests[0].respond(200, {
                'Content-Type': 'application/javascript' 
            }, 'window.mod1 = true;');

            this.requests[1].respond(200, {
                'Content-Type': 'application/javascript' 
            }, 'window.mod2 = true;');
        });

        it('测试首次请求，获取全量数据', function (done) {
            inc.adds({
                modules: {
                    '_mod1': { path: './modules/_mod1.js', version: '1.0', charset: 'utf-8' }
                }
            });
            inc.use('_mod1', function () {
                expect(window.mod1).to.equal(true);
                done();
            });

            this.requests[0].respond(200, {
                'Content-Type': 'application/javascript' 
            }, 'window.mod1 = true;');
        });

        it('测试直接使用本地数据', function (done) {
            window.localStorage.setItem('test:_mod1', '{"u":"./modules/_mod1.js","v":"1.0","c":"window.mod1 = true;"}');
            inc.adds({
                modules: {
                    '_mod1': { path: './modules/_mod1.js', version: '1.0', type: 'js', charset: 'utf-8' }
                }
            });
            inc.use('_mod1', function () {
                expect(window.mod1).to.equal(true);
                done();
            });
        });

        it('测试获取增量数据', function (done) {
            window.localStorage.setItem('test:_mod1', '{"u":"./modules/_mod1.js","v":"1.0","c":"window.mod2 = true;"}');
            inc.adds({
                modules: {
                    '_mod1': { path: './modules/_mod2.js', version: '2.0', type: 'js', charset: 'utf-8' }
                }
            });
            inc.use('_mod1', function () {
                expect(window.mod1).to.equal(true);
                done();
            });

            this.requests[0].respond(200, {
                'Content-Type': 'text/json' 
            }, JSON.stringify([[1,10], '1',[11,8]]) + '1');
        });
    });
});
