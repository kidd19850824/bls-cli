'use strict'

const rc = require('rc')
const { loadGlobalConfig, saveGlobalConfig, saveConfig, log } = require('../src/common')
const { projectNamePrompt, awsProfilePrompt, workspacePrompt, userPrompt, emailPrompt, environmentPrompt } = require('./prompts')
const { assignIn } = require('lodash')

module.exports = async(_, argv) => {
    let globalConfig = loadGlobalConfig()
    const result = await projectNamePrompt()
    if (globalConfig.projects.indexOf(result.projectName) > -1) {
        log.error(`Project exists`)
        return false
    }
    globalConfig.currentProject = result.projectName
    globalConfig.projects.push(result.projectName)
    let config = {
        ...await awsProfilePrompt(),
        ...await workspacePrompt(),
        ...await userPrompt(),
        ...await emailPrompt(),
        ...await environmentPrompt()
    }
    assignIn(config, rc('aws')[config.awsProfile] || rc('aws')[`profile ${config.awsProfile}`])
    config.bucket = `miap-${config.user}-${config.region}`
    saveGlobalConfig(globalConfig)
    saveConfig(config)
    log.success(`Create project [${globalConfig.currentProject}] success`)
}