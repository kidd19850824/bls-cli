'use strict'

const fs = require('fs')
const { showArgument, log } = require('./common')
const { npmInstall, npmRunWatch } = require('./npm')

module.exports = async(config, argv) => {
    if (argv._.indexOf('help') > -1) {
        log.title('Start watch your application')
        return true
    }
    try {
        const appsPath = `${config.workspace}/apps`
        if (!fs.existsSync(config.workspace) || !fs.lstatSync(config.workspace).isDirectory()) {
            log.error(`Module not exists.[${config.workspace}]`)
            return false
        }
        if (!fs.existsSync(appsPath) || !fs.lstatSync(appsPath).isDirectory()) {
            log.error(`Directory not exists.[${appsPath}]`)
            return false
        }
        await npmInstall(appsPath)
        await npmRunWatch(appsPath)
    } catch (error) {
        log.fatal(error)
    }
}
