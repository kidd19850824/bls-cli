'use strict'

const { CloudFormation } = require('aws-sdk')
const { upperFirst } = require('lodash')
const { showArgument, log } = require('./common')

const successStatus = [
    'CREATE_COMPLETE',
    'UPDATE_COMPLETE'
]

module.exports = async(config, argv) => {
    if (argv._.indexOf('help') > -1) {
        log.title('Deploy your applicaton')
        showArgument('-n', 'Define applcation name with stack name')
        return true
    }
    let stackName = argv.n
    try {
        const cloudFormation = new CloudFormation({
            region: config.region
        })
        const stacks = await cloudFormation.describeStacks({
            StackName: stackName
        }).promise()
        const stack = stacks.Stacks.pop()
        if (successStatus.indexOf(stack.StackStatus) > -1) {
            const deleted = await cloudFormation.deleteStack({
                StackName: stackName
            }).promise()
            console.log(deleted)
        }
    } catch (error) {
        log.error(error)
    }
}
