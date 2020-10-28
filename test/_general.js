var should = require('should'),
    fs = require('fs'),
    dst_dir = './test/tmp/',
    filename = 'angleman.png',
    dst_path = dst_dir + filename,
    rel_path = './' + filename,
    src_path = 'https://github.com/techno-express/node-wget/raw/master/',
    src_url = src_path + filename;


describe('node-wget-js', function () {
    describe('should', function () {

        it("load", function () {
            var wget = require('../wget.js');
            should.exist(wget);
        });

        var wget = require('../wget.js');

        it("return relative filepath: " + rel_path, function () {
            wget(rel_path, {
                dry: true
            }).then(result => {
                should.exist(result);
                result.filepath.should.equal(rel_path);
            });
        });

        it("return absolute filepath: " + dst_path, function () {
            wget(src_url, dst_dir, {
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

            wget(src_url, dst_path)
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
            holdData.filepath.should.equal(dst_path)
        });

    });

});
