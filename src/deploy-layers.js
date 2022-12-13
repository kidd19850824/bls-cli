'use strict'

const fs = require('fs')
const YAML = require('yaml')
const { upperFirst } = require('lodash')
const { showArgument, log } = require('./common')
const { npmInstall, npmRunBuild } = require('./npm')
const { samPackage, samDeploy } = require('./sam')
const { globalModules, globalPackages } = require('../defined.json')

module.exports = async(config, argv) => {
    if (argv._.indexOf('help') > -1) {
        log.title('Deploy your layers')
        showArgument('-p', 'Whether to package the module?[default yes]')
        showArgument('-r', 'Set region, default from your config.')
        return true
    }
    let layersPath
    if (globalModules.indexOf(argv.m) > -1) {
        layersPath = config.workspace
    } else if (globalPackages.indexOf(argv.m) > -1) {
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
        const stackName = `BLS-${upperFirst(argv.m)}-Layers`
        const templateFile = `${layersPath}/template.yaml`
        const template = YAML.parseDocument(
            fs.readFileSync(templateFile, 'utf8')
        ).toJSON()
        const resources = template.Resources || {}
        let layers = []
        for (let resource of Object.values(resources)) {
            if (resource.Type === 'AWS::Serverless::LayerVersion') {
                const properties = resource.Properties || {}
                layers.push({
                    name: properties.LayerName,
                    contentUri: properties.ContentUri || '',
                    runtime: (properties.CompatibleRuntimes || []).pop().replace(/^([a-z]*).*/, '$1')
                })
            }
        }
        if (argv.p !== 0) {
            if (fs.existsSync(`${layersPath}/package.json`)) {
                await npmInstall(layersPath)
                await npmRunBuild(layersPath)
            }
            for (let layer of layers) {
                if (layer.contentUri !== 'dists') {
                    const layerPath = `${layersPath}/${layer.contentUri}/${layer.runtime}`
                    if (fs.existsSync(`${layerPath}/package.json`)) {
                        await npmInstall(layerPath)
                    }
                }
            }
            await samPackage(layersPath, argv.r || config.region, config.bucket)
        }
        await samDeploy(layersPath, stackName, config.region)
        // const lambda = new Lambda({
        //     region: config.region
        // })
        // const layerCollection = await lambda.listLayers({
        //     MaxItems: 50
        // }).promise()
        // for (let layer of layers) {
        //     for (let lambdaLayer of layerCollection.Layers) {
        //         if (lambdaLayer.LayerName === layer.name) {
        //             const latestVersion = lambdaLayer.LatestMatchingVersion.Version
        //             lambda.addLayerVersionPermission({
        //                 LayerName: layer.name,
        //                 VersionNumber: latestVersion,
        //                 StatementId: `${layer.name}-LayerVersionPermission`,
        //                 Action: 'lambda:GetLayerVersion',
        //                 Principal: '*'
        //             }).promise()
        //         }
        //     }
        //  }
    } catch (error) {
        log.fatal(error)
    }
}
