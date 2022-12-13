'use strict'

const fs = require('fs')
const { isArray, isString } = require('lodash')
const { showArgument, log } = require('./common')
const { npmInstall, npmRunBuild } = require('./npm')
const { samPackage } = require('./sam')
const { sourceHasChanged } = require('./checksum')

module.exports = async(config, argv) => {
    if (argv._.indexOf('help') > -1) {
        log.title('Package your application')
        return true
    }
    const appsPath = `${config.workspace}/apps`
    const clientsPath = `${config.workspace}/clients`
    if (!fs.existsSync(config.workspace) || !fs.lstatSync(config.workspace).isDirectory()) {
        log.error(`Module not exists.[${config.workspace}]`)
        return false
    }
    if (!fs.existsSync(appsPath) || !fs.lstatSync(appsPath).isDirectory()) {
        log.error(`Directory not exists.[${appsPath}]`)
        return false
    }
    if (!fs.existsSync(clientsPath) || !fs.lstatSync(clientsPath).isDirectory()) {
        log.error(`Directory not exists.[${clientsPath}]`)
        return false
    }
    try {
        let packApps = sourceHasChanged(config.workspace, 'apps', 'src')
        let packClients = false
        let clientsSource = require(`${clientsPath}/package.json`).source
        if (!clientsSource) {
            clientsSource = ['src']
        }
        if (isString(clientsSource)) {
            clientsSource = [clientsSource]
        }
        for (let clientSource of clientsSource) {
            packClients = sourceHasChanged(config.workspace, 'clients', clientSource) || packClients
        }
        if (packApps) {
            await npmInstall(appsPath, argv.force)
            await npmRunBuild(appsPath)
        }
        if (packClients) {
            await npmInstall(clientsPath, argv.force)
            await npmRunBuild(clientsPath)
        }
        await samPackage(appsPath, config.region, config.bucket)
    } catch (error) {
        log.fatal(error)
    }
}
