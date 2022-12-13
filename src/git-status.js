'use strict'

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const { showArgument, log } = require('./common')
const { upperFirst, padEnd } = require('lodash')
const { getCurrentBranch, getStatus } = require('./git')

module.exports = (config, argv) => {
    if (argv._.indexOf('help') > -1) {
        log.title('Git status')
        showArgument('-m', 'Your module name, ex: bootstrap')
        return true
    }
    try {
        const hex = {
            new: '#06FF70',
            modified: '#FFCC00',
            deleted: '#880000'
        }
        fs.readdirSync(config.workspace).map(async(moduleName) => {
            const modulePath = path.resolve(config.workspace, moduleName)
            if (/^bls-/.test(moduleName) && fs.lstatSync(modulePath).isDirectory()) {
                const branch = await getCurrentBranch(modulePath)
                const files = await getStatus(modulePath)
                log.info(
                    padEnd(moduleName, 16, ' '), '\t', 'Branch: ', branch
                )
                if (files.length > 0) {
                    for (let file of files) {
                        console.log(
                            chalk.hex(hex[file.status] || '#FFFFFF')(
                                padEnd(upperFirst(file.status), 16, ' ')
                            ),
                            '\t',
                            file.path
                        )
                    }
                } else {
                    log.text('Nothing to commit, working tree clean')
                }
            }
        })
    } catch (error) {
        log.error(error)
    }
}
