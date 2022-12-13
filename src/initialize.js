'use strict'

const { log } = require('./common')
const AWS = require('aws-sdk')
const fs = require('fs')

module.exports = async(config, argv) => {
    const s3 = new AWS.S3({
        region: config.region
    })
    const bucketName = config.bucket
    console.log(bucketName)
    try {
        await s3.headBucket({
            Bucket: bucketName
        }).promise()
        log.info(`S3 bucket exists.[${bucketName}]`)
        return true
    } catch (error) {
        if (error.code === 'Forbidden') {
            log.fatal('Bucket already exists')
            return false
        }
    }
    try {
        await s3.createBucket({
            Bucket: bucketName
        }).promise()
        log.success(`Created s3 bucket: ${bucketName}`)
        await s3.putBucketPolicy({
            Bucket: bucketName,
            Policy: JSON.stringify({
                'Version': '2012-10-17',
                'Statement': [
                    {
                        'Effect': 'Allow',
                        'Principal': {
                            'Service': 'cloudformation.amazonaws.com'
                        },
                        'Action': 's3:GetObject',
                        'Resource': `arn:aws:s3:::${bucketName}/*`
                    }
                ]
            })
        }).promise()
        log.success(`Update bucket policy success`)
        log.success('Initialize success')
    } catch (error) {
        log.fatal('Create failed', error)
    }
}
