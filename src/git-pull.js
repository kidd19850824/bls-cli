'use strict'

const fs = require('fs')
const path = require('path')
const { showArgument, log } = require('./common')
const { padEnd } = require('lodash')
const { getCurrentBranch, getStatus, pull } = require('./git')

module.exports = (config, argv) => {
    if (argv._.indexOf('help') > -1) {
        log.title('Git status')
        showArgument('-m', 'Your module name, ex: bootstrap')
        return true
    }
    try {
        fs.readdirSync(config.workspace).map(async(moduleName) => {
            const modulePath = path.resolve(config.workspace, moduleName)
            if (/^bls-/.test(moduleName) && fs.lstatSync(modulePath).isDirectory()) {
                const branch = await getCurrentBranch(modulePath)
                const pulled = await pull(modulePath)
                log.info(
                    padEnd(moduleName, 16, ' '), '\t', 'Branch: ', branch
                )
                if (pulled) {
                    log.text('Updated')
                }
            }
        })
    } catch (error) {
        log.error(error)
    }
}
