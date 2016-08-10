const fs = require('fs');

let path = process.argv[2];

fs.readdir(path, function (err, files) {
    files.forEach(function(file) {
        console.log(`${ file }`);
    });
    console.log(`Number of files: ${ files.length }`);
});