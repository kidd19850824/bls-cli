'use strict'

const { log } = require('./common')
const { listLayers } = require('./lambda')

module.exports = async(config) => {
    try {
        const result = await listLayers(config.region)
        for (let layer of result.Layers) {
            log.title(`Layer Name: ${layer.LayerName}`)
            log.text(`Layer ARN: ${layer.LayerArn}`)
            log.text(`Layer Latest Version: ${layer.LatestMatchingVersion.Version}`)
            log.text(`Layer Latest ARN: ${layer.LatestMatchingVersion.LayerVersionArn}`)
            log.text(`Layer Compatible Runtimes: ${layer.LatestMatchingVersion.CompatibleRuntimes}\n`)
            // let policy = await lambda.getLayerVersionPolicy({
            //     LayerName: layer.LayerName,
            //     VersionNumber: layer.LatestMatchingVersion.Version
            // }).promise()
            // let layerPolicy = JSON.parse(policy.Policy)
            // log.text(`Layer Policy: ${layerPolicy.Statement[0].Principal}`)
        }
    } catch (error) {
        log.fatal(error)
    }
}
