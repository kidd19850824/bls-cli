'use strict'

const { Lambda } = require('aws-sdk')

module.exports.listLayers = (region) => {
    return new Promise(async(resolve, reject) => {
        try {
            const lambda = new Lambda({
                region
            })
            resolve(
                await lambda.listLayers().promise()
            )
        } catch (error) {
            reject(error)
        }
    })
}

module.exports.listAllLayers = (region) => {
    return new Promise(async(resolve, reject) => {
        try {
            let layers = {}
            const lambda = new Lambda({
                region
            })
            let layerList = await lambda.listLayers().promise()
            for (let layer of layerList.Layers) {
                layers[layer.LayerName] = {
                    arn: layer.LayerArn,
                    name: layer.LayerName,
                    latest: {
                        arn: layer.LatestMatchingVersion.LayerVersionArn,
                        version: layer.LatestMatchingVersion.Version
                    }
                }
            }
            resolve(layers)
        } catch (error) {
            reject(error)
        }
    })
}

module.exports.listLayerVersions = (region, layerName) => {
    return new Promise(async(resolve, reject) => {
        try {
            const lambda = new Lambda({
                region
            })
            const layerVersionCollection = await lambda.listLayerVersions({
                LayerName: layerName
            }).promise()
            const versions = layerVersionCollection.LayerVersions.map(layerVersion => {
                return {
                    arn: layerVersion.LayerVersionArn,
                    version: layerVersion.Version
                }
            })
            resolve(versions)
        } catch (error) {
            reject(error)
        }
    })
}

module.exports.getLayerVersionPolicy = (region, layerName, version) => {
    return new Promise(async(resolve) => {
        try {
            const lambda = new Lambda({
                region
            })
            const layerVersionPolicy = await lambda.getLayerVersionPolicy({
                LayerName: layerName,
                VersionNumber: version
            }).promise()
            resolve(layerVersionPolicy)
        } catch (error) {
            resolve(null)
        }
    })
}
