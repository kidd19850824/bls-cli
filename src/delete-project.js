'use strict'

const { loadGlobalConfig, saveGlobalConfig, log } = require('../src/common')
const { selectProjectPrompt } = require('./prompts')

module.exports = async(_, argv) => {
    let globalConfig = loadGlobalConfig()
    let selectedProject = await selectProjectPrompt(globalConfig.projects)
    globalConfig.projects = globalConfig.projects.filter(projectName => {
        return projectName !== selectedProject.projectName
    })
    if (globalConfig.currentProject === selectedProject.projectName) {
        if (globalConfig.projects.length > 0) {
            globalConfig.currentProject = globalConfig.projects[0]
        } else {
            globalConfig = {}
        }
    }
    saveGlobalConfig(globalConfig)
    log.success(`Delete project [${selectedProject.projectName}] success`)
}