'use strict'

const fs = require('fs')
const { showArgument, log } = require('./common')
const { npmInstall, npmRunTests } = require('./npm')

module.exports = async(config, argv) => {
    if (argv._.indexOf('help') > -1) {
        log.title('Test your application')
        showArgument('-t', 'Only test case name, ex: -t user')
        showArgument('--force', 'Force npm install')
        return true
    }
    const appsPath = `${config.workspace}/apps`
    if (!fs.existsSync(config.workspace) || !fs.lstatSync(config.workspace).isDirectory()) {
        log.error(`Module not exists.[${config.workspace}]`)
        return false
    }
    if (!fs.existsSync(appsPath) || !fs.lstatSync(appsPath).isDirectory()) {
        log.error(`Directory not exists.[${appsPath}]`)
        return false
    }
    process.env.NODE_ENV = 'development'
    try {
        await npmInstall(appsPath, !!argv.force)
        await npmRunTests(appsPath, argv.t)
    } catch (error) {
        log.fatal(error)
        process.exit(255)
    }
}
