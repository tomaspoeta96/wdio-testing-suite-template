import SuiteConfig from './src/config/SuiteConfig';
import { baseConfig } from './base.wdio.conf';

const path = require('path');

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
require('module-alias/register');

const config = {
    headless: true,
    capabilities: [{
        maxInstances: 1,
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: ['--lang=en', "--window-size=1920,1080", '--headless', '--disable-gpu', "--remote-debugging-port=9222"],
            prefs: {
                'intl.accept_languages': 'en,US',
                'directory_upgrade': true,
                'prompt_for_download': false,
                'download.default_directory': path.join(__dirname, SuiteConfig.TMP_DOWNLOAD_DIR)
            }
        },
        acceptInsecureCerts: true
    }],
    specFileRetries: 2,
    specFileRetriesDelay: 5,
    specFileRetriesDeferred: true,
    logLevel: 'error',
};

exports.config = Object.assign(baseConfig, config);