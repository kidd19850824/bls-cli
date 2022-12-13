'use strict'

const { CloudFormation } = require('aws-sdk')
const { log } = require('./common')

module.exports.getStacksOutputs = async(stackName, region) => {
    let outputs = {}
    try {
        const cloudFormation = new CloudFormation({
            region: region
        })
        const result = await cloudFormation.describeStacks({
            StackName: stackName
        }).promise()
        const stacks = result.Stacks.pop()
        stacks.Outputs.forEach(output => {
            outputs[output.OutputKey] = output.OutputValue
        })
    } catch (error) {
        log.error(error)
    }
    return outputs
}
