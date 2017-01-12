/* global describe, it, chai */

var assert = chai.assert;
var expect = chai.expect;

describe('In', function () {
    describe('#add()', function () {
        it('should added special module successful', function (done) {
            inc.add('mod1', './modules/mod1.js');
            inc.use('mod1', function() {
                expect(window['mod1'] === true);
                done();
            });
        });
    });
});
