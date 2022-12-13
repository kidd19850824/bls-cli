'use strict'

const { log, showArgument } = require('./common')
const { CloudWatchLogs } = require('aws-sdk')

module.exports = async(config, argv) => {
    if (argv._.indexOf('help') > -1) {
        log.title('Deploy your applicaton')
        showArgument('--all', 'Clean all typeslogs, [default: false]')
        return true
    }
    try {
        const cloudWatchLogs = new CloudWatchLogs({
            region: config.region
        })
        let parameters = {}
        if (!argv.all) {
            parameters.logGroupNamePrefix = '/aws/lambda'
        }
        const result = await cloudWatchLogs.describeLogGroups(parameters).promise()
        log.title(`Find ${result.logGroups.length} log groups`)
        for (const logGroup of result.logGroups) {
            log.success(`Delete ${logGroup.logGroupName} success`)
            await cloudWatchLogs.deleteLogGroup({
                logGroupName: logGroup.logGroupName
            }).promise()
        }
    } catch (error) {
        log.fatal(error)
    }
}
