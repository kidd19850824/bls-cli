'use strict'

const fs = require('fs')
const { log } = require('./common')
const { spawn } = require('child_process')

const command = 'npm'

module.exports.npmInstall = (prefix, force = false) => {
    return new Promise((resolve, reject) => {
        const args = [
            `install`,
            `--prefix`, prefix
        ]
        const nodeModulesPath = `${prefix}/node_modules`
        if (fs.existsSync(nodeModulesPath) && !force) {
            resolve(true)
            return
        }
        log.info(command, args.join(' '))
        const npmInstall = spawn(command, args, {
            stdio: 'inherit',
            shell: true
        })
        npmInstall.on('close', (code) => {
            if (code === 0) {
                resolve(true)
            } else {
                reject(
                    new Error(code)
                )
            }
        })
    })
}

module.exports.npmGlobalInstall = (repository) => {
    return new Promise((resolve, reject) => {
        const args = [
            `install`,
            `${repository}`,
            `-g`
        ]
        log.info(command, args.join(' '))
        const npmInstall = spawn(command, args, {
            stdio: 'inherit',
            shell: true
        })
        npmInstall.on('close', (code) => {
            if (code === 0) {
                resolve(true)
            } else {
                reject(
                    new Error(code)
                )
            }
        })
    })
}

module.exports.npmRunBuild = (prefix) => {
    return new Promise((resolve, reject) => {
        const args = [
            `run`, `build`,
            `--prefix`, prefix
        ]
        log.info(command, args.join(' '))
        const npmRunBuild = spawn(command, args, {
            stdio: 'inherit',
            shell: true
        })
        npmRunBuild.on('close', (code) => {
            if (code === 0) {
                resolve(true)
            } else {
                reject(
                    new Error(code)
                )
            }
        })
    })
}

module.exports.npmRunDev = (prefix, target = null) => {
    return new Promise((resolve, reject) => {
        const script = target ? `dev-${target}` : `dev`
        const args = [
            `run`, script,
            `--prefix`, prefix
        ]
        log.info(command, args.join(' '))
        const npmRunDev = spawn(command, args, {
            stdio: 'inherit',
            shell: true
        })
        npmRunDev.on('close', (code) => {
            if (code === 0) {
                resolve(true)
            } else {
                reject(
                    new Error(code)
                )
            }
        })
    })
}

module.exports.npmRunWatch = (prefix) => {
    return new Promise((resolve, reject) => {
        const args = [
            `run`, `watch`,
            `--prefix`, prefix
        ]
        log.info(command, args.join(' '))
        const npmRunWatch = spawn(command, args, {
            stdio: 'inherit',
            shell: true
        })
        npmRunWatch.on('close', (code) => {
            if (code === 0) {
                resolve(true)
            } else {
                reject(
                    new Error(code)
                )
            }
        })
    })
}

module.exports.npmRunTests = (prefix, target) => {
    return new Promise(async(resolve, reject) => {
        const packageJson = require(`${prefix}/package.json`)
        const scripts = packageJson.scripts || {}
        let testCase = []
        if (target && scripts[`test-${target}`]) {
            testCase.push(`test-${target}`)
        } else {
            for (let name in scripts) {
                if (/^test/.test(name)) {
                    testCase.push(name)
                }
            }
        }
        try {
            for (let scriptName of testCase) {
                await npmRunTest(prefix, scriptName)
            }
        } catch (error) {
            reject(error)
        }
        resolve(true)
    })
}

const npmRunTest = (prefix, script) => {
    return new Promise((resolve, reject) => {
        const args = [
            `run`, script,
            `--prefix`, prefix
        ]
        log.info(command, args.join(' '))
        const npmRuntTest = spawn(command, args, {
            stdio: 'inherit',
            shell: true
        })
        npmRuntTest.on('close', (code) => {
            if (code === 0) {
                resolve(true)
            } else {
                reject(
                    new Error(code)
                )
            }
        })
    })
}
