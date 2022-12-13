'use strict'

const { Lambda } = require('aws-sdk')
const { log } = require('./common')

module.exports = async(config) => {
    try {
        const lambda = new Lambda({
            region: config.region
        })
        const layerCollection = await lambda.listLayers({
            MaxItems: 50
        }).promise()
        for (let layer of layerCollection.Layers) {
            const layerVersionCollection = await lambda.listLayerVersions({
                LayerName: layer.LayerName
            }).promise()
            for (let layerVersion of layerVersionCollection.LayerVersions) {
                try {
                    await lambda.getLayerVersionPolicy({
                        LayerName: layer.LayerName,
                        VersionNumber: layerVersion.Version
                    }).promise()
                    continue
                } catch (error) {}
                console.log(`Adding permission to Layer: ${layer.LayerName} Version: ${layerVersion.Version}`)
                lambda.addLayerVersionPermission({
                    LayerName: layer.LayerName,
                    VersionNumber: layerVersion.Version,
                    StatementId: `${layer.LayerName}-LayerVersionPermission`,
                    Action: 'lambda:GetLayerVersion',
                    Principal: '*'
                }).promise()
            }
        }
    } catch (error) {
        log.fatal(error)
    }
}
