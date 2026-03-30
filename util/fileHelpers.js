const fsExtra = require('fs-extra');

function mergeChunks(files, dest) {
    console.log('Start merging file chunks.');

    return new Promise((resolve, reject) => {
        const output = fsExtra.createWriteStream(dest);

        function appendFile(file, callback) {
            const input = fsExtra.createReadStream(file);
            input.pipe(output, { end: false });
            input.on('end', callback);
            input.on('error', callback);
        }

        (function next(i) {
            if (i < files.length) {
                appendFile(files[i], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        next(i + 1);
                    }
                });
            } else {
                output.end();
                resolve();
            }
        })(0);
    });
}

module.exports = {
    mergeChunks,
};
