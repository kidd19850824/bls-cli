'use strict'

const rc = require('rc')
const { loadConfig, showConfig, log } = require('../src/common')

module.exports = (config, argv) => {
    const awsProfile = argv.a || 'bls'
    const awsConfig = rc('aws')['bls'] || rc('aws')[`profile ${awsProfile}`]
    log.title('AWS Config')
    for (let key in awsConfig) {
        showConfig(key, awsConfig[key])
    }
    log.text()
    log.title('BLS CLI Config')
    config = loadConfig()
    for (let key in config) {
        showConfig(key, config[key])
    }
    log.text()
}
