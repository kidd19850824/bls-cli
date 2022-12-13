'use strict'

const { SSM } = require('aws-sdk')
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
            name: 'CodeBuild-GithubSshKey'
        },
        {
            name: 'CodePipeline-GithubOAuthToken'
        },
        {
            name: 'AppStoreBucket'
        }
    ]
    try {
        for (let region of avaliableRegions) {
            const ssm = new SSM({
                region: region
            })
            for (let parameter of parameters) {
                const result = await ssm.getParameter({
                    Name: `${prefix}-${parameter.name}`,
                    WithDecryption: true
                }).promise()
                console.log(result)
            }
        }
    } catch (error) {
        console.log(error.toString())
    }
}
