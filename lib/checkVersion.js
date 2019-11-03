const {version} = require('../package.json');
const {config} = require('../package.json');
const https = require('https');
const StringLiterals = require('../lib/stringLiterals');

function checkVersion(errorCallback, notEqualsCallback, equalsCallback) {
    console.log(`checkVersion: url: ${config.versionFileUrl}`);

    https.get(config.versionFileUrl, (res) => {
        const { statusCode } = res;
        console.log(`checkVersion statusCode: ${statusCode}`);

        if (statusCode === 200) {
            res.setEncoding(StringLiterals.ENCODING);

            let retrievedData = '';

            res.on('data', (chunk) => {
                console.log(`checkVersion: chunk: ${chunk}`);

                retrievedData += chunk;
            });

            res.on('end', () => {
                console.log(`checkVersion: retrieved ${retrievedData} current version: ${version}`);

                if (retrievedData.trim() === version) {
                    console.log(`checkVersion: version is equal`);
                    equalsCallback();
                } else {
                    console.log(`checkVersion: version is NOT equal`);
                    notEqualsCallback();
                }
            });

            res.on('error', (error) => {
                console.info(`checkVersion: error: ${error}`);

                errorCallback();
            })
        } else {
            errorCallback();
        }
    });
}

module.exports = {checkVersion};