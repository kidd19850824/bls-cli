'use strict'

const { resetConfig, log } = require('../src/common')

module.exports = () => {
    const reseted = resetConfig()
    if (reseted) {
        log.success('Reset completed')
    } else {
        log.fatal('Reset failed')
    }
}
