'use strict'

const fs = require('fs')
const { S3 } = require('aws-sdk')
const { showArgument, log } = require('./common')
const { npmInstall, npmRunDev } = require('./npm')

module.exports = async(config, argv) => {
    if (argv._.indexOf('help') > -1) {
        log.title('Start client dev-server with your application')
        showArgument('-t', 'npm run dev-{target}, ex: landing')
        return true
    }
    try {
        const clientsPath = `${config.workspace}/clients`
        const webDeveloperPath = `${config.workspace}/web-dev`
        const webDeveloperConfigPath = `${webDeveloperPath}/config`
        if (!fs.existsSync(config.workspace) || !fs.lstatSync(config.workspace).isDirectory()) {
            log.error(`Module not exists.[${config.workspace}]`)
            return false
        }
        if (!fs.existsSync(clientsPath) || !fs.lstatSync(clientsPath).isDirectory()) {
            log.error(`Directory not exists.[${clientsPath}]`)
            return false
        }
        await npmInstall(clientsPath)
        await npmRunDev(clientsPath, argv.t)
    } catch (error) {
        log.fatal(error)
    }
}
