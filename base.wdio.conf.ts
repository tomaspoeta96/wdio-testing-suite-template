/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import _ from 'lodash';
import TestContext from './src/service/TestContext';
import TestCSVWriter from './src/service/TestCSVWriter';
import SuiteConfig from './src/config/SuiteConfig';
import BrowserCommands from './src/config/browser/CustomCommands';
import EnvironmentEnum from './src/enum/config/EnvironmentEnum';
import { deleteFolder } from './src/utils/files';
const fs = require('fs');

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
require('module-alias/register');


/**
 * Common configuration for every environment
 */

let ENVIRONMENT = undefined;

switch (process.argv[process.argv.indexOf("--env") + 1]) {
    case "TEST": {
        ENVIRONMENT = EnvironmentEnum.TEST;
        break;
    }
    case "PRODUCTION": {
        ENVIRONMENT = EnvironmentEnum.PRODUCTION;
        break;
    }
    case "INTEGRATION": {
        ENVIRONMENT = EnvironmentEnum.INTEGRATION;
        break;
    }
    default: {
        console.log("Selected environment does not exist:\nSetting default environment: TEST");
        ENVIRONMENT = EnvironmentEnum.TEST;
        break;
    }
}

export const baseConfig = {
    runner: 'local',
    specs: [
        './src/test/**/*.ts'
    ],
    suites: {
        e2e: [
            './src/test/frontend/**/*.ts'
        ],
        performance: [
            './src/test/performance/*.ts'
        ],
    },
    maxInstances: 2,
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 60000,
    connectionRetryCount: 3,

    services: ['chromedriver', 'devtools'],

    framework: 'mocha',

    reporters: [
        'spec',
        ['allure', {
            outputDir: 'reporters/allure-reports',
            disableWebdriverStepsReporting: true,
            disableWebdriverScreenshotsReporting: false,
            disableMochaHooks: true,
            tmsLinkTemplate: "https://mock-url.com/id/{}"
        }]],

    mochaOpts: {
        ui: 'bdd',
        bail: true,
        timeout: 60000,
        compilers: [
            // 'ts-node/register',
            'tsconfig-paths/register'
        ]
    },

    onPrepare: async function (config, capabilities): Promise<void> {
        if (!fs.existsSync(SuiteConfig.TMP_DOWNLOAD_DIR)) {
            // if it doesn't exist, create it
            fs.mkdirSync(SuiteConfig.TMP_DOWNLOAD_DIR);
        }
        await TestCSVWriter.resetCSV();
    },

    beforeSession: function (config, capabilities, specs): void {
        require('expect-webdriverio').setOptions({ wait: 60000 });
        console.log(`Setting environment: ${ENVIRONMENT}`);
        SuiteConfig.setEnvironment(ENVIRONMENT);

    },

    before: function (capabilities, specs): void {
        browser.maximizeWindow();
        BrowserCommands.addCommands();
    },

    afterTest: function (test, context, { error }): void {
        if (error) {
            browser.takeScreenshot();
        }
    },

    after: async function (): Promise<void> {
        const results: any[] = await TestCSVWriter.readCSV();
        await TestCSVWriter.updateCSV(_.differenceWith(TestContext.getTestList(), results, _.isEqual));
    },

    onComplete: function (): void {
        deleteFolder(SuiteConfig.TMP_DOWNLOAD_DIR);
    }
};