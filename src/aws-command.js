'use strict'

const { execSync } = require('child_process')

let awsCommand = 'aws'

try {
    execSync('which aws2')
    awsCommand = 'aws2'
} catch (error) {}

module.exports = awsCommand
