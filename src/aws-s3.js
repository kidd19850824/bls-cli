'use strict'

// const awsCommand = require('./aws-command')
const awsCommand = 'aws'
const { spawn } = require('child_process')
const { log } = require('./common')

module.exports.sync = (localPath, bucket, profile) => {
    return new Promise(async(resolve, reject) => {
        try {
            const args = [
                's3', 'sync',
                localPath,
                `s3://${bucket}`
            ]
            if (profile) {
                args.push('--profile')
                args.push(profile)
            }
            log.info(awsCommand, args.join(' '))
            const sync = spawn(awsCommand, args, {
                stdio: 'inherit',
                shell: true
            })
            sync.on('close', (code) => {
                if (code === 0) {
                    resolve(true)
                } else {
                    reject(
                        new Error(code)
                    )
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}

module.exports.pubObject = (bucket, key, body) => {
    return new Promise(async(resolve, reject) => {
        try {
            const args = [
                's3api', 'put-object',
                '--bucket', bucket,
                '--key', key,
                '--body', body
            ]
            log.info(awsCommand, args.join(' '))
            const putObject = spawn(awsCommand, args, {
                stdio: 'inherit',
                shell: true
            })
            putObject.on('close', (code) => {
                if (code === 0) {
                    resolve(true)
                } else {
                    reject(
                        new Error(code)
                    )
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}
