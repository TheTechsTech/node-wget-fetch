const should = require('should'),
    fs = require('fs'),
    Stream = require('stream'),
    dst_dir = './test/tmp/',
    filename = 'angleman.png',
    dst_path = dst_dir + filename,
    rel_path = './' + filename,
    src_path = 'https://github.com/techno-express/node-wget/raw/master/',
    src_url = src_path + filename;

class Blob { };
Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
    value: 'Blob',
    writable: false,
    enumerable: false,
    configurable: true
});

describe('node-wget-fetch', function () {
    describe('should', function () {

        it("load", function () {
            var fetching = require('../wget-fetch.js');
            should.exist(fetching);
        });

        var fetching = require('../wget-fetch.js');

        it("return relative filepath: " + rel_path, function () {
            fetching(rel_path, {
                dry: true
            }).then(result => {
                should.exist(result);
                result.filepath.should.equal(rel_path);
            });
        });

        it("return absolute filepath: " + dst_path, function () {
            fetching(src_url, dst_dir, {
                dry: true
            }).then(testPath => {
                should.exist(testPath);
                testPath.filepath.should.equal(dst_path);
            });;
        });

        var flag = false;
        var url = src_url;
        var holdErr, holdRes, holdData = undefined;

        beforeEach(function (done) {
            this.timeout(15 * 60 * 1000); // give it 15 seconds instead of 2

            fetching(src_url, dst_path)
                .then(data => {
                    holdData = data;
                    fs.unlinkSync(dst_path);
                    done(); // complete the async beforeEach
                })
                .catch(err => {
                    holdErr = err;
                });
        });

        it("load " + dst_path + " from " + src_url, function () {
            should.not.exist(holdErr);
            should.exist(holdData);
            should.exist(holdData.filepath);
            should.exist(holdData.fileSize);
            should.exist(holdData.headers);
            holdData.retrievedSizeMatch.should.equal(true)
        });

        it('should validate Array', function () {
            fetching.isArray([]).should.equal(true);
            fetching.isArray({
                length: 5
            }).should.equal(false);
        });

        it('should validate Buffer', function () {
            fetching.isBuffer(Buffer.from('a')).should.equal(true);
            fetching.isBuffer(null).should.equal(false);
            fetching.isBuffer(undefined).should.equal(false);
        });

        it('should validate ArrayBuffer', function () {
            fetching.isArrayBuffer(new ArrayBuffer(2)).should.equal(true);
            fetching.isArrayBuffer({}).should.equal(false);
        });

        it('should validate Blob', function () {
            fetching.isBlob(new Blob()).should.equal(true);
        });

        it('should validate String', function () {
            fetching.isString('').should.equal(true);
            fetching.isString({
                toString: function () {
                    return '';
                }
            }).should.equal(false);
        });

        it('should validate Number', function () {
            fetching.isNumber(123).should.equal(true);
            fetching.isNumber('123').should.equal(false);
        });

        it('should validate Undefined', function () {
            fetching.isUndefined().should.equal(true);
            fetching.isUndefined(null).should.equal(false);
        });

        it('should validate Object', function () {
            fetching.isObject({}).should.equal(true);
            fetching.isObject([]).should.equal(true);
            fetching.isObject(null).should.equal(false);
        });

        it('should validate plain Object', function () {
            fetching.isPlainObject({}).should.equal(true);
            fetching.isPlainObject([]).should.equal(false);
            fetching.isPlainObject(null).should.equal(false);
            fetching.isPlainObject(Object.create({})).should.equal(false);
        });

        it('should validate Date', function () {
            fetching.isDate(new Date()).should.equal(true);
            fetching.isDate(Date.now()).should.equal(false);
        });

        it('should validate Function', function () {
            fetching.isFunction(function () {}).should.equal(true);
            fetching.isFunction('function').should.equal(false);
        });

        it('should validate Stream', function () {
            fetching.isStream(new Stream.Readable()).should.equal(true);
            fetching.isStream({
                foo: 'bar'
            }).should.equal(false);
        });

          it('should have fetching method helpers', function () {
              (typeof fetching.wget).should.equal('function');
              (typeof fetching.get).should.equal('function');
              (typeof fetching.head).should.equal('function');
              (typeof fetching.options).should.equal('function');
              (typeof fetching.delete).should.equal('function');
              (typeof fetching.post).should.equal('function');
              (typeof fetching.put).should.equal('function');
              (typeof fetching.patch).should.equal('function');
              (typeof fetching.fetch).should.equal('function');
              (typeof fetching.fetch.Headers).should.equal('function');
          });
    });

});
