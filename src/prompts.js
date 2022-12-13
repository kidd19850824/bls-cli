'use strict'

const inquirer = require('inquirer')
const rc = require('rc')
const fs = require('fs')

const prompt = inquirer.createPromptModule()

module.exports.confirmPrompt = () => {
    return prompt({
        type: 'list',
        name: 'answer',
        message: 'Are you sure?',
        choices: [
            'Yes',
            'No'
        ]
    })
}

module.exports.projectNamePrompt = () => {
    return prompt({
        type: 'input',
        name: 'projectName',
        message: 'Please input your project name',
        validate(input) {
            return /[\w-_]{3,16}/.test(input)
        }
    })
}

module.exports.selectProjectPrompt = (projects) => {
    return prompt({
        type: 'list',
        name: 'projectName',
        pageSize: 24,
        choices: projects
    })
}

module.exports.awsProfilePrompt = () => {
    return prompt({
        type: 'input',
        name: 'awsProfile',
        message: 'Please input your AWS profile name',
        validate(input) {
            return !!(rc('aws')[input] || rc('aws')[`profile ${input}`])
        }
    })
}

module.exports.workspacePrompt = () => {
    return prompt({
        type: 'input',
        name: 'workspace',
        message: 'Please input your workspace',
        validate(input) {
            return fs.lstatSync(input).isDirectory()
        }
    })
}

module.exports.userPrompt = () => {
    return prompt({
        type: 'input',
        name: 'user',
        message: 'Please input your username',
        validate(input) {
            return /^[\w]*$/.test(input)
        }
    })
}

module.exports.emailPrompt = () => {
    return prompt({
        type: 'input',
        name: 'email',
        message: 'Please input your email address',
        validate(input) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
        }
    })
}

module.exports.environmentPrompt = () => {
    return prompt({
        type: 'list',
        name: 'environment',
        message: 'Please select your envirnoment',
        choices: [
            'development',
            'production'
        ]
    })
}

module.exports.selectCloudFrontDistributionPrompt = (distributions) => {
    return prompt({
        type: 'list',
        choices: distributions,
        name: 'distribution',
        message: 'Select distribution'
    })
}
