'use strict'

const fs = require('fs')
const { showArgument, log } = require('./common')
const { samLocalStartLambda } = require('./sam')

module.exports = (config, argv) => {
    if (argv._.indexOf('help') > -1) {
        log.title('Start Lambda in locally with your application')
        showArgument('-t', 'Your application.yaml name, ex: application.yaml, please key in [\'application\'] [default: template]')
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
    try {
        samLocalStartLambda(appsPath, config.region, argv.p, argv.t)
    } catch (error) {
        log.fatal(error)
    }
}
