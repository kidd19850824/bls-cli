'use strict'

const fs = require('fs')
const YAML = require('yaml')
const { CloudFormation, S3 } = require('aws-sdk')
const { Bar: ProgressBar } = require('cli-progress')
const { showArgument, log } = require('./common')
const { first, upperFirst } = require('lodash')
const { avaliableRegions } = require('../defined.json')

const successStatus = [
    'CREATE_COMPLETE',
    'UPDATE_COMPLETE'
]
const errorStatus = [
    'ROLLBACK_COMPLETE'
]

// const deploy = {
//     region: 'ap-northeast-1',
//     bucket: 'bls-codepipeline-artifact'
// }

const stackStatusBar = new ProgressBar({
    format: 'Checking stack status {status}'
})

module.exports = async(config, argv) => {
    if (argv._.indexOf('help') > -1) {
        log.title('Deploy your applicaton')
        showArgument('-n', 'Define applcation name with stack name')
        showArgument('-e', 'Publish to enviroment, [develop or production]')
        showArgument('-t', 'Override cloudformation template filename. [default cloudformation.yaml]')
        showArgument('-d', 'Delete cloudformation stack, if stack was fail. [default yes]')
        return true
    }
    let name
    const templateName = (argv.t)
        ? argv.t
        : 'devops.yaml'
    const templatePath = `${config.workspace}/${templateName}`
    const prefix = 'BLS'
    const suffix = 'DevOps'

    name = (argv.n && argv.n.length > 3)
        ? argv.n
        : moduleName

    if (!argv.e) {
        log.error(`未指定部屬環境`)
        return false
    }
    // 會影響各模組devops.yaml所依賴的部屬環境參數
    if (['production', 'develop'].indexOf(argv.e) === -1) {
        log.error(`不允許的部屬環境`)
        return false
    }
    if (!fs.existsSync(config.workspace) || !fs.lstatSync(config.workspace).isDirectory()) {
        log.error(`Module not exists.[${config.workspace}]`)
        return false
    }
    if (!fs.existsSync(templatePath)) {
        log.fatal('CloudFormation template not found.')
    }

    const templateJson = YAML.parseDocument(
        fs.readFileSync(templatePath, 'utf8')
    ).toJSON()
    const metadata = templateJson['Metadata'] || {}
    const bls = metadata['BLS'] || {}
    const blsType = bls['Type'] || 'Module'
    const template = fs.readFileSync(templatePath)
    const stackName = `${prefix}-${upperFirst(name)}-${suffix}`
    const appStoreBucket = `bls-app-store-${argv.e}`
    const appStoreBucketArn = `arn:aws:s3:::${appStoreBucket}`

    // @todo 檢查App Store Bucket 確實存在

    for (let region of avaliableRegions) {
        log.info(`Start deploy DevOps to ${region} Region`)
        let stacks
        const cloudFormation = new CloudFormation({ region })
        const artifactBucket = `bls-artifact-${region}-${argv.e}`
        const artifactBucketArn = `arn:aws:s3:::${artifactBucket}`
        let parameters = [
            {
                ParameterKey: 'ArtifactBucketArn',
                ParameterValue: artifactBucketArn
            },
            {
                ParameterKey: 'ArtifactBucket',
                ParameterValue: artifactBucket
            },
            {
                ParameterKey: 'AppStoreBucketArn',
                ParameterValue: appStoreBucketArn
            },
            {
                ParameterKey: 'AppStoreBucket',
                ParameterValue: appStoreBucket
            },
            {
                ParameterKey: 'EnvironmentType',
                ParameterValue: argv.e
            }
        ]
        try {
            let result = await cloudFormation.getStackPolicy({
                StackName: stackName
            }).promise()
            await cloudFormation.updateStack({
                StackName: stackName,
                TemplateBody: template.toString(),
                Capabilities: [
                    'CAPABILITY_IAM'
                ],
                Parameters: parameters
            }).promise()
        } catch (error) {
            if (error.message.indexOf('does not exist') != -1) {
                await cloudFormation.createStack({
                    StackName: stackName,
                    TemplateBody: template.toString(),
                    Capabilities: [
                        'CAPABILITY_IAM'
                    ],
                    Parameters: parameters
                }).promise()
            } else if (error.message.indexOf('No updates are to be performed') !== -1) {
                log.info(`無需更新 ${error.message}`)
                continue
            }
        }
        try {
            stackStatusBar.start(0, 0, {
                status: '...'
            })
            checkStackStatus(region, stackName, {
                delete: argv.d !== 0
            })
        } catch (error) {
            log.error('Create stack', error)
        }
    }
}

const checkStackStatus = async(region, stackName, options, previousStatus) => {
    try {
        stackStatusBar.update(0, {
            status: previousStatus || '...'
        })
        const cloudFormation = new CloudFormation({
            region
        })
        const stacks = await cloudFormation.describeStacks({
            StackName: stackName
        }).promise()
        const latestStack = first(stacks.Stacks) || {}
        if (successStatus.indexOf(latestStack.StackStatus) > -1) {
            stackStatusBar.stop()
            log.success('Stack was complete.')
        } else if (errorStatus.indexOf(latestStack.StackStatus) > -1) {
            stackStatusBar.stop()
            if (options.delete !== false) {
                await cloudFormation.deleteStack({
                    StackName: stackName
                }).promise()
                log.error('Delete stack')
            }
        } else {
            setTimeout(() => {
                checkStackStatus(region, stackName, options, latestStack.StackStatus)
            }, 2000)
        }
    } catch (error) {
        log.error('Check stack', error)
    }
}
