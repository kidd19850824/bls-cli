'use strict'

const fs = require('fs')
const { showArgument, log } = require('./common')
const { samLocalInvokeLambda } = require('./sam')

module.exports = (config, argv) => {
    if (argv._.indexOf('help') > -1) {
        log.title('Invoke your Lambda function')
        showArgument('-f', 'Your function name, ex: GetXxxFunction')
        showArgument('-o', 'Set parameter override, ex: p1=xxx,p2=yyy')
        showArgument('-t', 'Your application.yaml name, ex: application.yaml, please key in [\'application\'] [default: template]')
        return true
    }
    let appsPath = `${config.workspace}/apps`
    if (!fs.existsSync(config.workspace) || !fs.lstatSync(config.workspace).isDirectory()) {
        log.error(`Module not exists.[${config.workspace}]`)
        return false
    }
    if (!fs.existsSync(appsPath) || !fs.lstatSync(appsPath).isDirectory()) {
        log.error(`Directory not exists.[${appsPath}]`)
        return false
    }
    if (!argv.f) {
        log.error(`Must define invoke function name`)
        return false
    }
    let parameters = {}
    if (argv.o && argv.o.length) {
        for (let string of argv.o.split(',')) {
            let [key, value] = string.split('=')
            parameters[key] = value
        }
    }
    try {
        samLocalInvokeLambda(appsPath, config.region, argv.f, argv.t, parameters)
    } catch (error) {
        log.fatal(error)
    }
}
