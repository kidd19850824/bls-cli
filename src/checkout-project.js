'use strict'

const { loadGlobalConfig, saveGlobalConfig, showArgument, log } = require('../src/common')
const { selectProjectPrompt } = require('./prompts')

module.exports = async(_, argv) => {
    let globalConfig = loadGlobalConfig()
    let selectedProject = argv.s || false
    if (selectedProject) {
        if (!globalConfig.projects.includes(selectedProject)) {
          showArgument('-s', `Not Found Project [${selectedProject}]`)
          return true
        }
    } else {
        selectedProject = (await selectProjectPrompt(globalConfig.projects)).projectName
    }
    globalConfig.currentProject = selectedProject
    saveGlobalConfig(globalConfig)
    log.success(`Checkout project [${selectedProject}] success`)
}