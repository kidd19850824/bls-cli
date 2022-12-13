'use strict'

const { putConfig, removeConfig, showArgument, log } = require('./common')

module.exports = async(config, argv) => {
    if (argv._.indexOf('help') > -1) {
        log.title('Write your config')
        showArgument('-n', 'Your config name')
        showArgument('-v', 'Your config value')
        return true
    }
    try {
        if (!argv.n || typeof argv.n !== 'string') {
            log.error('Config name is undefined.')
            return
        }
        if (argv.v !== undefined && argv.v !== null) {
            putConfig({
                [argv.n]: argv.v
            })
            log.success(`Set ${argv.n} = ${argv.v} success`)
        } else {
            removeConfig(argv.n)
            log.success(`Remove ${argv.n} success`)
        }
    } catch (error) {
        log.error(error)
    }
}
