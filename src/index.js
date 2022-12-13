'use strict'

const { showCommand, log } = require('./common')

module.exports.help = (_, argv) => {
    if (argv.v) {
        this.version()
        return
    }
    log.title('Welcome use BLS CLI')
    showCommand('create-project', '', 'Create new project')
    showCommand('checkout-project', '', 'Checkout exists project')
    showCommand('delete-project', '', 'Delete project')
    console.log()
    showCommand('initialize', 'init', 'Initialize your develop environment')
    showCommand('dynamodb', 'ddb', 'Start local DynamoDB')
    showCommand('layers', 'lls', 'List all layers in current region')
    // showCommand('update-layers', '', 'Update layers permission')
    showCommand('clear-projects', 'cps', 'Delete all of dependcy files')
    showCommand('clear-logs', 'cls', 'Delete Lambda logs on AWS CloudWatchLogs in current region.')
    showCommand('delete-buckets', '', 'Delete S3 Buckets')
    showCommand('write-config', 'wc', 'Write BLS config')
    showCommand('show-config', 'sc', 'Display BLS config')
    showCommand('reset-config', 'rc', 'Reset BLS config')
    showCommand('update-self', '', 'Update BLS CLI')
    showCommand('version', 'v', 'Display BLS CLI version')
    console.log()
    // showCommand('deploy-devops', 'devops', 'Setup AWS DevOps with your application')
    // showCommand('get-ssm-parameters', 'gsp', 'Get your ssm parameters')
    // showCommand('set-ssm-parameters', 'ssp', 'Set your ssm parameters')
    // console.log()
    // showCommand('git-status', 'gs', 'View all bls modules status')
    // showCommand('git-pull', 'gp', 'Pull all bls modules')
    // console.log()
    // showCommand('new-module', 'nm', 'Create your application')
    // showCommand('watch-apps', 'aw', 'Watch your application with start-api')
    showCommand('package-apps', 'ap', 'Package your application')
    showCommand('deploy-apps', 'ad', 'Deploy your application')
    showCommand('test-apps', 'at', 'Test your application')
    // showCommand('package-layers', 'lp', 'Package your layers')
    // showCommand('deploy-layers', 'ld', 'Deploy your layers')
    // showCommand('test-layers', 'lt', 'Test your layers')
    // showCommand('delete-apps', '', 'Delete your application')
    // showCommand('delete-layers', '', 'Delete your layers')
    showCommand('create-invalidation', '', 'Create Invalidation')
    console.log()
    showCommand('start-client', 'client', 'Start your client')
    // showCommand('start-api', 'api', 'Start your API in locally')
    showCommand('invoke-lambda', 'invoke', 'Invoke your Lambda in locally -f <function>')
    // showCommand('start-lambda', 'lambda', 'Start your Lambda in locally')
    // showCommand('i18n-editor', 'i18n', 'Start i18n editor')
    console.log('')
}

module.exports.alias = {
    'init': 'initialize',
    'ddb': 'dynamodb',
    'lls': 'list-layers',
    'cps': 'clear-projects',
    'cls': 'clear-logs',
    'wc': 'write-config',
    'sc': 'show-config',
    'rc': 'reset-config',
    // 'devops': 'deploy-devops',
    // 'gsp': 'get-ssm-parameters',
    // 'ssp': 'set-ssm-parameters',
    // 'gs': 'git-status',
    // 'gp': 'git-pull',
    // 'nm': 'new-module',
    // 'aw': 'watch-apps',
    'ap': 'package-apps',
    'ad': 'deploy-apps',
    'at': 'test-apps',
    // 'lp': 'package-layers',
    // 'ld': 'deploy-layers',
    // 'lt': 'test-layers',
    'client': 'start-client',
    // 'api': 'start-api',
    'invoke': 'invoke-lambda'
    // 'lambda': 'start-lambda',
    // 'i18n': 'internationalization-editor'
}

module.exports.createProject = require('./create-project')
module.exports.checkoutProject = require('./checkout-project')
module.exports.deleteProject = require('./delete-project')

module.exports.initialize = require('./initialize')
module.exports.dynamodb = require('./dynamodb')
module.exports.listLayers = require('./list-layers')
module.exports.updateLayers = require('./update-layers')
module.exports.clearProjects = require('./clear-projects')
module.exports.clearLogs = require('./clear-logs')
module.exports.deleteBuckets = require('./delete-buckets')
module.exports.updateSelf = require('./update-self')
module.exports.writeConfig = require('./write-config')
module.exports.showConfig = require('./show-config')
module.exports.resetConfig = require('./reset-config')
module.exports.version = () => {
    const packageJson = require('../package.json')
    log.info(`Version: ${packageJson.version}`)
}
// module.exports.deployDevops = require('./deploy-devops')
// module.exports.getSsmParameters = require('./get-ssm-parameters')
// module.exports.setSsmParameters = require('./set-ssm-parameters')
// module.exports.gitStatus = require('./git-status')
// module.exports.gitPull = require('./git-pull')
// module.exports.watchApps = require('./watch-apps')
module.exports.packageApps = require('./package-apps')
module.exports.packageLayers = require('./package-layers')
module.exports.deployApps = require('./deploy-apps')
// module.exports.deployLayers = require('./deploy-layers')
module.exports.testApps = require('./test-apps')
// module.exports.testLayers = require('./test-layers')
// module.exports.deleteApps = require('./delete-apps')
// module.exports.deleteLayers = require('./delete-layers')

module.exports.createInvalidation = require('./create-invalidation')

module.exports.startClient = require('./start-client')
// module.exports.startApi = require('./start-api')
module.exports.invokeLambda = require('./invoke-lambda')
// module.exports.startLambda = require('./start-lambda')
// module.exports.internationalizationEditor = require('./i18n-editor')
