'use strict'

const fs = require('fs')
const { camelCase } = require('lodash')
const { showArgument, log } = require('./common')
const { samLocalStartApi } = require('./sam')

module.exports = (config, argv) => {
    if (argv._.indexOf('help') > -1) {
        log.title('Start API gateway in locally with your application')
        showArgument('-h', 'The local hostname or IP address to bind to (default: 127.0.0.1)')
        showArgument('-p', 'The local port number to listen on (default: 3000)')
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
        let parameters = {}
        let parametersPath = `${appsPath}/parameters.json`
        if (fs.existsSync(parametersPath)) {
            const customParameters = require(parametersPath)
            const inherit = 'inherit'
            for (let key in customParameters) {
                const value = customParameters[key]
                const camelKey = camelCase(key)
                if (value.substr(0, inherit.length).toLowerCase() === inherit) {
                    if (value.length === inherit.length && config[camelKey]) {
                        parameters[key] = config[camelKey]
                        continue
                    }
                    const inheritKey = camelCase(
                        value.substr(inherit.length + 1)
                    )
                    if (config[inheritKey]) {
                        parameters[key] = config[inheritKey]
                    } else if (config[camelKey]) {
                        log.warn(`Inherit key[${inheritKey}] not defined in config, auto change with property[${key}]`)
                        parameters[key] = config[camelKey]
                    } else {
                        log.warn(`Inherit key[${inheritKey}] not defined in config`)
                    }
                } else {
                    parameters[key] = value
                }
            }
        }
        if (argv.o && argv.o.length) {
            for (let string of argv.o.split(',')) {
                let [key, value] = string.split('=')
                parameters[key] = value
            }
        }
        samLocalStartApi(appsPath, config.region, argv.h, argv.p, argv.t, parameters)
    } catch (error) {
        log.fatal(error)
    }
}
