'use strict'

const path = require('path')
const { spawn } = require('child_process')
const { showArgument, log } = require('./common')

module.exports = (config, argv) => {
    if (argv['_'].indexOf('help') > -1) {
        log.title('Start DynamoDB in locally')
        showArgument('-p', 'Local DynamoDB port')
        return true
    }
    const ddbPath = path.resolve(`${__dirname}/../dynamodb`)
    log.text('You can view local DynamoDB in browser: \n')
    log.text('npm install dynamodb-admin -g')
    log.text('export DYNAMO_ENDPOINT=http://localhost:8000')
    log.text('dynamodb-admin \n')
    spawn('java', [
        `-Djava.library.path=${ddbPath}/DynamoDBLocal_lib`,
        `-jar`, `${ddbPath}/DynamoDBLocal.jar`,
        `-delayTransientStatuses`,
        `-port`, `${argv.p || 8000}`,
        `-dbPath`, `${config.workspace}`,
        `-sharedDb`
    ], { stdio: 'inherit' })
}
