"use strict";

const fs = require('fs');
const path = require('path');
const events = require('events');

let countLines = function (file, cb) {
    let lines = 0;
    let reader = fs.createReadStream(file);
    reader.on('end', function () {
        cb(null, lines);
    });
    reader.on('data', function (data) {
        lines += data.toString().split('\n').length - 1;
    });
    reader.on('error', function (err) {
        cb(err);
    });
};

let onReadDirComplete = function (err, files) {
    if (err) throw err;

    let totalLines = 0;
    let completed = 0;

    let checkComplete = function () {
        if (completed === files.length) {
            console.log(totalLines);
        }
    };

    files.forEach(function (file) {
        countLines(path.join(process.argv[2], file), function (err,
            lines) {
            if (err) {
                if (err.code === 'EISDIR') {
                    // Not to worry, this is a subdirectory
                } else {
                    // Warn user and continue
                    console.error(err);
                }

            } else {
                totalLines += lines;
            }
            completed += 1;
            checkComplete();
        });
    });
};

fs.readdir(process.argv[2], onReadDirComplete);
