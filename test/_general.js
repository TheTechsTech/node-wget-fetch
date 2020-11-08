const should = require('should'),
    fs = require('fs'),
    Stream = require('stream'),
    dst_dir = './test/tmp/',
    filename = 'angleman.png',
    dst_path = dst_dir + filename,
    rel_path = './' + filename,
    src_path = 'https://github.com/techno-express/node-wget/raw/master/',
    src_url = src_path + filename;

class Blob {};
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
            holdData.fileSizeMatch.should.equal(true)
        });

        it('validate Array', function () {
            fetching.isArray([]).should.equal(true);
            fetching.isArray({
                length: 5
            }).should.equal(false);
        });

        it('validate Buffer', function () {
            fetching.isBuffer(Buffer.from('a')).should.equal(true);
            fetching.isBuffer(null).should.equal(false);
            fetching.isBuffer(undefined).should.equal(false);
        });

        it('validate ArrayBuffer', function () {
            fetching.isArrayBuffer(new ArrayBuffer(2)).should.equal(true);
            fetching.isArrayBuffer({}).should.equal(false);
        });

        it('validate Blob', function () {
            fetching.isBlob(new Blob()).should.equal(true);
        });

        it('validate String', function () {
            fetching.isString('').should.equal(true);
            fetching.isString({
                toString: function () {
                    return '';
                }
            }).should.equal(false);
        });

        it('validate Number', function () {
            fetching.isNumber(123).should.equal(true);
            fetching.isNumber('123').should.equal(false);
        });

        it('validate Undefined', function () {
            fetching.isUndefined().should.equal(true);
            fetching.isUndefined(null).should.equal(false);
        });

        it('validate Object', function () {
            fetching.isObject({}).should.equal(true);
            fetching.isObject([]).should.equal(true);
            fetching.isObject(null).should.equal(false);
        });

        it('validate plain Object', function () {
            fetching.isPlainObject({}).should.equal(true);
            fetching.isPlainObject([]).should.equal(false);
            fetching.isPlainObject(null).should.equal(false);
            fetching.isPlainObject(Object.create({})).should.equal(false);
        });

        it('validate Date', function () {
            fetching.isDate(new Date()).should.equal(true);
            fetching.isDate(Date.now()).should.equal(false);
        });

        it('validate Function', function () {
            fetching.isFunction(function () {}).should.equal(true);
            fetching.isFunction('function').should.equal(false);
        });

        it('validate Stream', function () {
            fetching.isStream(new Stream.Readable()).should.equal(true);
            fetching.isStream({
                foo: 'bar'
            }).should.equal(false);
        });

        it('have fetching.xxxxx method helpers', function () {
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

        it('resolve on response action of OBJECT from GET method', function () {
            fetching.get('https://httpbin.org/get', 'object').then(res => {
                res.should.be.an.instanceof(fetching.fetch.Response);
                res.headers.should.be.an.instanceof(fetching.fetch.Headers);
                res.body.should.be.an.instanceof(Stream.Transform);
                res.bodyUsed.should.be.false;
                res.ok.should.be.true;
                res.status.should.equal(200);
                res.statusText.should.equal('OK');
            });
        });

        it('resolve on response action of JSON from POST method', function () {
            fetching.post('https://httpbin.org/post', 'a=1', 'json').then(res => {
                fetching.isObject(res).should.be.true;
            });
        });

        it('resolve on response action of TEXT from PATCH method', function () {
            fetching.patch('https://httpbin.org/patch', 'a=1', 'text').then(res => {
                fetching.isString(res).should.be.true;
            });
        });

        it('resolve on response action of BUFFER from PUT method', function () {
            fetching.put('https://httpbin.org/put', 'a=1', 'buffer').then(res => {
                fetching.isBuffer(res).should.be.true;
            });
        });

        it('resolve on response action of BLOB from DELETE method', function () {
            fetching.delete('https://httpbin.org/delete', 'a=1', 'blob').then(res => {
                fetching.isBlob(res).should.be.true;
            });
        });

        it('reject on Fetch to Url not accepting the HEAD method', function () {
            fetching.head('https://httpbin.org/head')
                .catch(err => {
                    err.should.equal('Fetch to https://httpbin.org/head failed, with status text: NOT FOUND');
                });
        });

        it('reject on Fetch to Url not accepting the OPTIONS method', function () {
            fetching.options('https://httpbin.org/options')
                .catch(err => {
                    err.should.equal('Fetch to https://httpbin.org/options failed, with status text: NOT FOUND');
                });
        });
    });

});
