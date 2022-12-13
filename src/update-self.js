'use strict'

const { log } = require('./common')
const { npmGlobalInstall } = require('./npm')

module.exports = async(config, argv) => {
    try {
        await npmGlobalInstall('git+ssh://github.com/SoftChef/bls-cli.git#master')
    } catch (error) {
        log.fatal(error)
    }
}
