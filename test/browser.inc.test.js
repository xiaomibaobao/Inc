/* global describe, it, chai, inc, after */
/*eslint no-console: "ignore"*/

var assert = chai.assert;
var expect = chai.expect;

describe('In', function () {
    describe('#add(name, path)', function () {
        it('should added special module successful', function (done) {
            inc.add('mod1', './modules/mod1.js');
            inc.use('mod1', function () {
                expect(window.mod1).to.equal(true);
                done();
            });
        });
    });

    describe('#add(name, object) - without dependency', function () {
        it('should added special module successful', function (done) {
            inc.add('mod2', { path: './modules/mod2.js', type: 'js', charset: 'utf-8' });
            inc.use('mod2', function () {
                expect(window.mod2).to.equal(true);
                done();
            });
        });
    });

    describe('#add(name, object) - with dependency', function () {
        it('should added special module successful', function (done) {
            inc.add('mod3', { path: './modules/mod3.js', type: 'js', charset: 'utf-8'});
            inc.add('mod4', { path: './modules/mod4.js', type: 'js', charset: 'utf-8', rely: ['mod3'] });
            inc.use('mod4', function () {
                expect(window.mod3).to.equal(true);
                expect(window.mod4).to.equal(true);
                done();
            });
        });
    });

    describe('#add(param) - missing parameters', function () {
        it('should added special module failed', function (done) {
            inc.add('mod5');
            inc.use('mod5', function () {
                expect(window.mod3).to.equal(true);
                expect(window.mod4).to.equal(true);
                done();
            });
        });
    });

    describe('#adds()', function () {
        it('should added special module successful', function (done) {
            inc.add('mod1', './modules/mod1.js');
            inc.use('mod1', function () {
                expect(window.mod1 === true);
                done();
            });
        });
    });

    after(function () {
        // runs after all tests in this block
        var coverage = window.__coverage__;

        if (coverage) {
            console.log(JSON.stringify(coverage));
        } else {
            console.log('No coverage data generated');
        }
    });
});
