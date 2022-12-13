'use strict'

const fs = require('fs')
const path = require('path')
const { camelCase, upperFirst, isString } = require('lodash')
const { showArgument, log } = require('./common')
const { npmInstall, npmRunBuild } = require('./npm')
const { samPackage, samDeploy } = require('./sam')
const { getStacksOutputs } = require('./cloud-formation')
const { sync: s3Sync } = require('./aws-s3')
const { sourceHasChanged } = require('./checksum')

module.exports = async(config, argv) => {
    if (argv._.indexOf('help') > -1) {
        log.title('Deploy your applicaton')
        showArgument('-n', 'Define applcation name with stack name')
        showArgument('-b', 'Set boostrap app name with parameter override') // pre deprecated
        showArgument('-o', 'Set parameter override, ex: p1=xxx,p2=yyy')
        showArgument('-e', '部署環境 [default develop]')
        return true
    }
    let stackName
    let enviroment = (argv.e) ? argv.e : 'develop'
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
    stackName = argv.n || `BLS-${upperFirst(config.projectName)}-${config.user}`
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
        let parameters = {}
        const localParametersPath = `${appsPath}/parameters.json`
        // 優先權最低
        if (fs.existsSync(localParametersPath)) {
            let localParameters = require(localParametersPath)
            parameters = (enviroment && localParameters.hasOwnProperty(enviroment))
                ? await parseParameterFile(localParameters[enviroment], config)
                : await parseParameterFile(localParameters, config)
        }
        // 優先權最高
        if (argv.o && argv.o.length) {
            for (let string of argv.o.split(',')) {
                let [key, value] = string.split('=')
                parameters[key] = value
            }
        }
        if (config.environment) {
            parameters['Environment'] = config.environment
        }
        await samDeploy(appsPath, stackName, config.region, parameters)
        const outputs = await getStacksOutputs(stackName, config.region)
        const clientDistsPath = `${clientsPath}/dists`
        if (outputs.hasOwnProperty('WebBucketName')) {
            if (fs.lstatSync(clientDistsPath).isDirectory()) {
                await s3Sync(clientDistsPath, outputs.WebBucketName, config.awsProfile)
            } else {
                log.info(`Can't found dists path at ${clientDistsPath}`)
            }
        } else {
            log.info(`You don't have output "WebBucketName", if you want sync the client's files, you must output "WebBucketName"`)
        }
        const hookFile = path.resolve(`${config.workspace}/hooks/deploy.js`)
        if (fs.existsSync(hookFile)) {
            const { handler } = require(hookFile)
            if (handler instanceof (async() => {}).constructor) {
                log.info(`Executing deploy hook`)
                try {
                    await handler(config, argv)
                } catch (error) {
                    log.error(`Deploy hook error: ${error.message}`)
                }
            }
        }
        log.success('Deploy Success!')
    } catch (error) {
        log.fatal(error)
        process.exit(-1)
    }
}

const parseParameterFile = async(parameters, config) => {
    let inherit = 'inherit'
    const result = {}
    for (let key in parameters) {
        const value = parameters[key]
        const camelKey = camelCase(key)
        if (value.substr(0, inherit.length).toLowerCase() === inherit) {
            if (value.length === inherit.length && config[camelKey]) {
                result[key] = config[camelKey]
                continue
            }
            const inheritKey = camelCase(
                value.substr(inherit.length + 1)
            )
            if (!config.hasOwnProperty(inheritKey) && !config.hasOwnProperty(camelKey)) {
                log.warn(`Inherit key[${inheritKey}] not defined in config`)
                continue
            }
            result[key] = (config[inheritKey])
                ? config[inheritKey]
                : config[camelKey]
        } else {
            result[key] = value
        }
    }
    return result
}
