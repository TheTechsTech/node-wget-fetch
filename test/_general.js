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

        var  wget = require('../wget.js');

        it("return relative filepath: " + rel_path, function () {
            wget({
                dry: true,
                url: rel_path
            }).then(result => {
                should.exist(result);
                result.filepath.should.equal(rel_path);
            });
        });

        it("return absolute filepath: " + dst_path, function () {
            var testPath = wget({
                dry: true,
                dest: dst_dir,
                url: src_url
            });
            should.exist(testPath);
            testPath.should.equal(dst_path);
        });

        var flag = false;
        var url = src_url;
        var holdErr, holdRes, holdData = undefined;

        beforeEach(function (done) {
            this.timeout(15 * 60 * 1000); // give it 15 seconds instead of 2

            wget({
                url: src_url,
                dest: dst_path
            }, function (err, data) {
                holdErr = err;
                holdData = data;
                done(); // complete the async beforeEach
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
