import should from 'should';
import {
    unlinkSync
} from 'fs';
import {
    Readable,
    Transform
} from 'stream';
import fetching from '../wget-fetch.js';
const exist = should.exist;
const not = should.not;
const dst_dir = './test/tmp/';
const filename = 'angleman.png';
const dst_path = dst_dir + filename;
const rel_path = './' + filename;
const src_path = 'https://github.com/techno-express/node-wget/raw/master/';
const src_url = src_path + filename;

class Blob { };
Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
    value: 'Blob',
    writable: false,
    enumerable: false,
    configurable: true
});

describe('node-wget-fetch', function () {
    describe('should', function () {

        it("return relative filepath: " + rel_path, function () {
            fetching(rel_path, {
                dry: true
            }).then(result => {
                exist(result);
                result.filepath.should.equal(rel_path);
            });
        });

        it("return absolute filepath: " + dst_path, function () {
            fetching(src_url, dst_dir, {
                dry: true
            }).then(testPath => {
                exist(testPath);
                testPath.filepath.should.equal(dst_path);
            });;
        });

        var flag = false;
        var url = src_url;
        var holdErr, holdRes, holdData = undefined;

        beforeEach(function (done) {
            this.timeout(15 * 60 * 1000); // give it 15 seconds instead of 2

            fetching.wget(src_url, dst_path)
                .then(data => {
                    holdData = data;
                    unlinkSync(dst_path);
                    done(); // complete the async beforeEach
                })
                .catch(err => {
                    holdErr = err;
                });
        });

        it("load " + dst_path + " from " + src_url, function () {
            not.exist(holdErr);
            exist(holdData);
            exist(holdData.filepath);
            exist(holdData.fileSize);
            exist(holdData.headers);
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
            fetching.isFunction(function () { }).should.equal(true);
            fetching.isFunction('function').should.equal(false);
        });

        it('validate Stream', function () {
            fetching.isStream(new Readable()).should.equal(true);
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
                res.body.should.be.an.instanceof(Transform);
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
            fetching.put('https://httpbin.org/put', '', 'buffer').then(res => {
                fetching.isBuffer(res).should.be.true;
            });
        });

        it('resolve on response action of BLOB from DELETE method', function () {
            fetching.delete('https://httpbin.org/delete', 'a', 'blob').then(res => {
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

        it('resolve on response action of HEADER from GET method', function () {
            fetching.get('https://httpbin.org/get', 'header').then(res => {
                fetching.isObject(res).should.be.true;
                exist(res.connection);
            });
        });

        it('resolve on response action of STREAM from POST method', function () {
            fetching.post('https://httpbin.org/post', {
                stuff: 1
            }, 'stream').then(res => {
                fetching.isStream(res).should.be.true;
            });
        });

        it('resolve on response action of ARRAY from PUT method and BODY as OBJECT', function () {
            fetching.put('https://httpbin.org/put', {
                stuff: 2
            }, 'array').then(res => {
                fetching.isArrayBuffer(res).should.be.true;
            });
        });

        it('resolve on response action of TEXT from PATCH method in OPTIONS parameter', function () {
            fetching('https://httpbin.org/patch',
                'text', {
                method: 'PATCH',
                body: new URLSearchParams('stuff=3')
            })
                .then(res => {
                    fetching.isString(res).should.be.true;
                });
        });

        it('resolve on file retrieval no destination set with OPTIONS parameter instead', function () {
            fetching.wget('https://github.com/techno-express/node-wget-fetch/blob/master/test/tmp/Image.bmp', {
                retry: { retries: 5, factor: 2 },
                headers: {
                    'User-Agent': 'node-wget-fetch/1.0'
                },
                compress: false,
                size: 1
            })
                .then(res => {
                    fetching.isArray(res).should.be.true;
                    unlinkSync(res.filepath);
                });
        });
    });

    describe('resolve', () => {
        it('should resolve on third attempt', done => {
            var trial = 0;
            fetching.retryPromise({ retries: 10, minTimeout: 200, factor: 1 }, (resolve, retry, reject) => {
                trial++;
                if (trial == 3) { return resolve('ok'); }
                else { return retry('nok'); }
            })
                .then(result => {
                    result.should.equal('ok');
                    trial.should.equal(3);
                    done();
                })
                .catch(error => { throw new Error('should not be rejected'); });
        });
    });

    describe('reject', () => {
        it('should simply reject', done => {
            fetching.retryPromise((resolve, retry, reject) => {
                setTimeout(() => reject('nok'), 250);
            }).catch((err) => {
                err.should.equal('nok');
                done();
            });
        });
    });

    describe('Error on options', () => {
        it('should error on minTimeout is greater than maxTimeout', done => {
            try {
                fetching.retryPromise({ retries: 5, minTimeout: 10, maxTimeout: 5 }, (resolve, retry, reject) => {
                    console.log('Should not be displayed.')
                });
            } catch (err) {
                err.should.be.instanceof(Error);
                done();
            }
        });
    });

    describe('retries', () => {
        it('should do three retries and then reject', done => {
            var trial = 0;
            fetching.retryPromise({ retries: 3, minTimeout: 200, factor: 1 }, (resolve, retry, reject) => {
                trial++;
                retry('nok');
            })
                .then(result => {
                    throw new Error('should not resolve');
                })
                .catch(error => {
                    error.should.equal('nok');
                    trial.should.equal(3);
                    done();
                });
        });
    });

    describe('retries', () => {
        it('should not allow multiple retries in one cycle', done => {
            var trial = 0;
            fetching.retryPromise({ retries: 3, minTimeout: 200, factor: 1 }, (resolve, retry, reject) => {
                trial++;
                if (trial == 1) {
                    retry('this retry should be accepted');
                    retry('this retry should be ignored');
                }
                else if (trial == 2) {
                    resolve('ok');
                }
                else {
                    throw new Error('should not retry more than once');
                }
            })
                .then(result => {
                    result.should.equal('ok');
                    trial.should.equal(2);
                    done();
                })
                .catch(error => {
                    throw new Error('should not be rejected');
                });
        });
    });
});
