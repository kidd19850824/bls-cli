'use strict'

const { S3 } = require('aws-sdk')
const { showArgument, log } = require('./common')
const inquirer = require('inquirer')

module.exports = async(config, argv) => {
    if (argv._.indexOf('help') > -1) {
        log.title('Deploy your S3 buckets')
        showArgument('filter', `Filter only BLS's bucket`)
        return true
    }
    const s3 = new S3()
    const prompt = inquirer.createPromptModule()
    const selectBucketPrompt = async() => {
        const listBuckets = await s3.listBuckets().promise()
        prompt({
            type: 'list',
            name: 'bucket',
            pageSize: 24,
            choices: listBuckets.Buckets.map(bucket => {
                if (!argv.filter) {
                    return bucket.Name
                } else {
                    if (/^bls-.*$/.test(bucket.Name)) {
                        return bucket.Name
                    } else {
                        return null
                    }
                }
            }).filter(bucket => {
                return bucket != null
            })
        }).then(result => {
            confirmPrompt(result.bucket)
        })
    }
    const confirmPrompt = async(bucket) => {
        prompt({
            type: 'list',
            name: 'confirm',
            choices: [
                'Yes',
                'No'
            ]
        }).then(async(result) => {
            if (result.confirm === 'Yes') {
                try {
                    const deleteObjects = async(continuationToken) => {
                        const listObjects = await s3.listObjectsV2({
                            Bucket: bucket,
                            ContinuationToken: continuationToken
                        }).promise()
                        if (listObjects.KeyCount) {
                            await s3.deleteObjects({
                                Bucket: bucket,
                                Delete: {
                                    Objects: listObjects.Contents.map(object => {
                                        return {
                                            Key: object.Key
                                        }
                                    })
                                }
                            }).promise()
                        }
                        if (listObjects.NextContinuationToken) {
                            await deleteObjects(listObjects.NextContinuationToken)
                        } else {
                            Promise.resolve(true)
                        }
                    }
                    await deleteObjects()
                    await s3.deleteBucket({
                        Bucket: bucket
                    }).promise()
                    selectBucketPrompt()
                } catch (error) {
                    console.log(error.toString())
                }
            } else {
                selectBucketPrompt()
            }
        })
    }
    selectBucketPrompt()
}
