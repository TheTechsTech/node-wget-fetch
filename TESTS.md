# TOC
   - [wgetjs](#wgetjs)
<a name=""></a>

<a name="wgetjs"></a>
# wgetjs
<a name="wgetjs-should"></a>
## should
load.

```js
wget = require('../wget.js');
should.exist(wget);
```

return relative filepath: ./angleman.png.

```js
var testpath = wget({dry: true, url: src_url});
should.exist(testpath);
testpath.should.equal(rel_path);
```

return absolute filepath: /test/tmp/angleman.png.

```js
var testpath = wget({dry: true, dest: dst_dir, url: src_url});
should.exist(testpath);
testpath.should.equal(dst_path);
```

load /test/tmp/angleman.png from https://raw.github.com/techno-express/node-wget/master/angleman.png.

```js
should.not.exist(holderr);
            should.exist(holddata);
            should.exist(holddata.filepath);
            holddata.filepath.should.equal(dst_path)
```
