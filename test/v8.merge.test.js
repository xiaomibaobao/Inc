/* global describe, it */
var chai = require('chai');
var merge = require('../lib/merge')._merge;

var expect = chai.expect;

var src = '这里是改变之前的代码';
var target = '这里是改变之后的代码，abc';
var data = [ [ 1, 6 ], '后', [ 7, 3 ], '，abc' ];

describe('mergeAndDiff', function () {
    describe('#usingTheMergeMethod()', function () {
        it('should return', function (done) {
            expect(merge(src, data)).to.equal(target);
            done();
        });
    });
});
