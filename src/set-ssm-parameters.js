'use strict'

const { SSM } = require('aws-sdk')
const fs = require('fs')
const { showArgument, log } = require('./common')
const { avaliableRegions } = require('../defined.json')

module.exports = async(config, argv) => {
    if (argv._.indexOf('help') > -1) {
        log.title('Publish your applicaton')
        showArgument('-')
        return true
    }
    const prefix = 'BLS'
    const parameters = [
        {
            name: 'CodeBuild-GithubSshKey',
            value: 'ssh-key'
        }
    ]
    if (fs.existsSync(config.githubSshKey)) {
        parameters.push({
            name: 'CodeBuild-GithubSshKey',
            value: fs.readFileSync(config.githubSshKey).toString()
        })
    }
    if (config.githubOAuthToken) {
        parameters.push({
            name: 'CodePipeline-GithubOAuthToken',
            value: config.githubOAuthToken
        })
    }
    if (config.appStoreBucketName) {
        parameters.push({
            name: 'AppStoreBucket',
            value: config.appStoreBucketName
        })
    }
    try {
        for (let region of avaliableRegions) {
            const ssm = new SSM({
                region: region
            })
            for (let parameter of parameters) {
                await ssm.putParameter({
                    Name: `${prefix}-${parameter.name}`,
                    Type: 'String',
                    Value: parameter.value,
                    Overwrite: true
                }).promise()
            }
        }
    } catch (error) {
        console.log(error)
    }
}
