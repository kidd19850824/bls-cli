'use strict'

const fs = require('fs')
const chalk = require('chalk')
const untildify = require('untildify')
const { pad, padEnd } = require('lodash')

const globalConfigFile = untildify('~/.config/bls.config.json')

module.exports.loadGlobalConfig = () => {
    let globlConfig = {}
    try {
        if (!fs.existsSync(globalConfigFile)) {
            return globlConfig
        }
        globlConfig = JSON.parse(
            fs.readFileSync(globalConfigFile)
        )
    } catch (error) {
        this.log.error(error)
    }
    return globlConfig
}

module.exports.saveGlobalConfig = (config) => {
    let saved = false
    try {
        fs.writeFileSync(globalConfigFile, JSON.stringify(config, null, 4))
        saved = true
    } catch (error) {
        console.log(error)
    }
    return saved
}

module.exports.loadConfig = () => {
    let config = {}
    let configFilePath = this.getConfigFilePath()
    try {
        if (!fs.existsSync(configFilePath)) {
            return config
        }
        config = JSON.parse(
            fs.readFileSync(configFilePath)
        )
    } catch (error) {
        console.log(error)
    }
    return config
}

module.exports.saveConfig = (config) => {
    let saved = false
    let configFilePath = this.getConfigFilePath()
    try {
        fs.writeFileSync(configFilePath, JSON.stringify(config, null, 4))
        saved = true
    } catch (error) {
        console.log(error)
    }
    return saved
}

module.exports.putConfig = (config) => {
    let updated = false
    let configFilePath = this.getConfigFilePath()
    try {
        updated = fs.writeFileSync(configFilePath, JSON.stringify({
            ...JSON.parse(
                fs.readFileSync(configFilePath)
            ),
            ...config
        }, null, 4))
    } catch (error) {
        console.log(error)
    }
    return updated
}

module.exports.removeConfig = (key) => {
    let removed = false
    let configFilePath = this.getConfigFilePath()
    try {
        removed = fs.writeFileSync(configFilePath, JSON.stringify({
            ...JSON.parse(
                fs.readFileSync(configFilePath)
            ),
            [key]: undefined
        }, null, 4))
    } catch (error) {
        console.log(error)
    }
    return removed
}

module.exports.resetConfig = () => {
    let reseted = false
    let configFilePath = this.getConfigFilePath()
    try {
        fs.unlinkSync(configFilePath)
        reseted = true
    } catch (error) {
        console.log(error)
    }
    return reseted
}

module.exports.getConfigFilePath = () => {
    const globalConfig = this.loadGlobalConfig()
    return untildify(`~/.config/bls.${globalConfig.currentProject}.json`)
}

module.exports.showCommand = (command, shortCommand, description) => {
    console.log(
        padEnd(command, 16, ' '), '\t',
        chalk.bold(
            padEnd(`${shortCommand}`, 10, ' ')
        ), '\t', description
    )
}

module.exports.showArgument = (argName, description) => {
    console.log(padEnd(argName, 5, ' '), '\t', description)
}

module.exports.showConfig = (key, value) => {
    console.log(
        chalk.hex('#06FF70')(padEnd(key, 16, ' ')), '\t', chalk.hex('#06FF70').bold(value)
    )
}

const logger = () => {
    return {
        success() {
            this.output(chalk.hex('#00FF00'), arguments)
        },
        debug() {
            this.output(chalk.hex('#FFFF00'), arguments)
        },
        error() {
            this.output(chalk.hex('#FF615F').bold, arguments)
        },
        fatal() {
            this.output(chalk.bgHex('##FF615F').bold, arguments)
        },
        info() {
            this.output(chalk.hex('#06FF70'), arguments)
        },
        trace() {
            this.output(chalk.bgHex('#06FF70'), arguments)
        },
        warn() {
            this.output(chalk.bgHex('#EEAA00').bold, arguments)
        },
        title(message) {
            const backgroundColor = '#D6D6D6'
            const padding = 8
            const width = message.length + padding
            const margin = Math.floor((process.stdout.columns - width) / 2) - 10
            const marginContent = pad('', margin, ' ')
            const paddingContent = chalk.bgHex(backgroundColor)(pad('', width, ' '))
            const content = chalk.bgHex(backgroundColor).bold(pad(message, width, ' '))
            console.log(
                '', marginContent, paddingContent, marginContent, '\n',
                marginContent, content, marginContent, '\n',
                marginContent, paddingContent, marginContent, '\n'
            )
        },
        hidden() {},
        text() {
            this.output(chalk.white, arguments, false)
        },
        output(style, messages, newLine = true) {
            if (newLine) {
                console.log()
            }
            console.log(
                style(
                    Array.prototype.slice.call(messages).join(' ')
                )
            )
        }
    }
}

module.exports.log = logger(true)
