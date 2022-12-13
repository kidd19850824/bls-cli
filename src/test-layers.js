'use strict'

const fs = require('fs')
const { showArgument, log } = require('./common')
const { npmInstall, npmRunTests } = require('./npm')
const { globalModules } = require('../defined.json')

module.exports = async(config, argv) => {
    if (argv._.indexOf('help') > -1) {
        log.title('Test your layers')
        showArgument('-t', 'Only test case name, ex: -t user')
        showArgument('--force', 'Force npm install')
        return true
    }
    let layersPath
    if (globalModules.indexOf(argv.m)) {
        layersPath = config.workspace
    } else {
        layersPath = `${config.workspace}/layers`
    }
    if (!fs.existsSync(config.workspace) || !fs.lstatSync(config.workspace).isDirectory()) {
        log.error(`Module not exists.[${config.workspace}]`)
        return false
    }
    if (!fs.existsSync(layersPath) || !fs.lstatSync(layersPath).isDirectory()) {
        log.error(`Directory not exists.[${layersPath}]`)
        return false
    }
    try {
        await npmInstall(layersPath, !!argv.force)
        await npmRunTests(layersPath, argv.t)
    } catch (error) {
        log.fatal(error)
        process.exit(255)
    }
}
