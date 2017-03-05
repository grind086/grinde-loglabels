var UglifyJS = require("uglify-js"),
    fs = require('fs');

var input = fs.readFileSync('./index.js', 'utf8'),
    result = UglifyJS.minify(input, { fromString: true });

fs.writeFile('./dist/loglabels.js', input, 'utf8');
fs.writeFile('./dist/loglabels.min.js', result.code, 'utf8');
